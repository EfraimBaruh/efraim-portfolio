import * as THREE from "three";
import { applyReveal } from "./revealMaterial";
import { meshesUnder, restGeometryWork, runSliced, type Work } from "./sampleSurface";

const prepared = new WeakMap<THREE.Object3D, Promise<void>>();

/**
 * Readies a loaded scan before its first frame, so none of this lands in one
 * long task when it first renders:
 * 1. in ~8 ms slices: bake the skinned rest geometry (bounds and sampling
 *    share it), pre-bound the skinned meshes, upload every texture;
 * 2. patch the materials for the reveal, then compile their shaders in
 *    parallel (KHR_parallel_shader_compile) against the stage's lights.
 * Cached per scene; pass the promise to React's `use()`.
 */
export function prepareScan(
  root: THREE.Object3D,
  { gl, camera, stage }: { gl: THREE.WebGLRenderer; camera: THREE.Camera; stage: THREE.Scene },
  initialReveal: number,
): Promise<void> {
  let promise = prepared.get(root);
  if (!promise) {
    promise = prepare(root, gl, camera, stage, initialReveal);
    prepared.set(root, promise);
  }
  return promise;
}

async function prepare(
  root: THREE.Object3D,
  gl: THREE.WebGLRenderer,
  camera: THREE.Camera,
  stage: THREE.Scene,
  initialReveal: number,
) {
  await runSliced(bakeAndUpload(root, gl));
  for (const mesh of meshesUnder(root)) {
    for (const material of materialsOf(mesh)) applyReveal(material, initialReveal);
  }
  // Shader variants depend on the stage's environment map: compiling before
  // it exists means a second, blocking compile once it arrives.
  for (let frames = 0; !stage.environment && frames < 60; frames++) {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  try {
    await gl.compileAsync(root, camera, stage);
  } catch {
    // Compiling on the first frame instead is slower, never wrong.
  }
}

function materialsOf(mesh: THREE.Mesh) {
  return Array.isArray(mesh.material) ? mesh.material : [mesh.material];
}

function* bakeAndUpload(root: THREE.Object3D, gl: THREE.WebGLRenderer): Work<void> {
  root.updateWorldMatrix(true, true);
  const textures = new Set<THREE.Texture>();
  for (const mesh of meshesUnder(root)) {
    const rest = yield* restGeometryWork(mesh);
    if ((mesh as THREE.SkinnedMesh).isSkinnedMesh) {
      // three otherwise skins every vertex on the CPU to bound the mesh on
      // its first frame. The rest pose bounds it well enough (the Idle clip
      // only breathes), and frustum culling is off for skinned meshes anyway.
      rest.computeBoundingBox();
      rest.computeBoundingSphere();
      yield;
      const skinned = mesh as THREE.SkinnedMesh;
      skinned.boundingBox ??= rest.boundingBox!.clone();
      skinned.boundingSphere ??= rest.boundingSphere!.clone();
    }
    for (const material of materialsOf(mesh)) {
      for (const value of Object.values(material)) {
        if ((value as THREE.Texture)?.isTexture) textures.add(value as THREE.Texture);
      }
    }
  }
  for (const texture of textures) {
    gl.initTexture(texture);
    yield;
  }
}
