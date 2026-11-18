import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";

/**
 * Geometry as it is actually rendered at rest, in the mesh's local space.
 * A skinned mesh is positioned through its bones (not its node transform),
 * so its raw position attribute can sit far from where it's drawn; bake the
 * bone-transformed positions into a plain geometry instead.
 */
function restGeometry(mesh: THREE.Mesh): THREE.BufferGeometry {
  if (!(mesh as THREE.SkinnedMesh).isSkinnedMesh) return mesh.geometry;
  const skinned = mesh as THREE.SkinnedMesh;
  const source = skinned.geometry;
  const count = source.attributes.position.count;
  const positions = new Float32Array(count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    skinned.getVertexPosition(i, v);
    v.toArray(positions, i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  if (source.index) g.setIndex(source.index);
  g.computeVertexNormals();
  return g;
}

export type SurfaceSamples = {
  positions: Float32Array;
  normals: Float32Array;
  /** Local-space Y range of the sampled surface, for height-based staggering. */
  minY: number;
  maxY: number;
};

/**
 * Samples `count` points across every mesh under `root`, distributed by
 * surface area, in `root`'s local space. Area weighting matters for scans:
 * the face has far more triangles than the body, so per-triangle sampling
 * would crowd the head. With `floorY`, only surface above it is sampled
 * (rejection sampling keeps the density uniform across meshes).
 */
export function sampleSurface(root: THREE.Object3D, count: number, floorY = -Infinity): SurfaceSamples {
  root.updateWorldMatrix(true, true);
  const rootInverse = root.matrixWorld.clone().invert();

  const entries: { sampler: MeshSurfaceSampler; matrix: THREE.Matrix4; normalMatrix: THREE.Matrix3; area: number }[] = [];
  root.traverse((node) => {
    if (!(node as THREE.Mesh).isMesh) return;
    const mesh = node as THREE.Mesh;
    const geometry = restGeometry(mesh);
    const sampler = new MeshSurfaceSampler(new THREE.Mesh(geometry)).build();
    const matrix = rootInverse.clone().multiply(mesh.matrixWorld);
    // Area is measured in mesh space; scale it into root space so meshes with
    // different transforms (quantization offsets) are weighted correctly.
    const scale = new THREE.Vector3().setFromMatrixScale(matrix);
    const distribution = (sampler as unknown as { distribution: Float32Array }).distribution;
    const area = distribution[distribution.length - 1] * scale.x * scale.y;
    entries.push({ sampler, matrix, normalMatrix: new THREE.Matrix3().getNormalMatrix(matrix), area });
  });

  const totalArea = entries.reduce((sum, e) => sum + e.area, 0);
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  let minY = Infinity;
  let maxY = -Infinity;

  // Pick meshes by area, then reject samples below the floor.
  const cumulative: number[] = [];
  entries.reduce((sum, e) => (cumulative.push(sum + e.area), sum + e.area), 0);
  const maxAttempts = count * 40;
  let written = 0;
  for (let attempt = 0; written < count && attempt < maxAttempts; attempt++) {
    const r = Math.random() * totalArea;
    const entry = entries[Math.min(cumulative.findIndex((c) => r <= c), entries.length - 1)];
    entry.sampler.sample(p, n);
    p.applyMatrix4(entry.matrix);
    if (p.y < floorY) continue;
    n.applyMatrix3(entry.normalMatrix).normalize();
    p.toArray(positions, written * 3);
    n.toArray(normals, written * 3);
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
    written++;
  }

  return { positions: positions.subarray(0, written * 3), normals: normals.subarray(0, written * 3), minY, maxY };
}

/**
 * Bounding box of everything under `root`, in root's local space — i.e.
 * ignoring root's own transform, which callers may already have scaled.
 */
export function localBounds(root: THREE.Object3D): THREE.Box3 {
  root.updateWorldMatrix(true, true);
  const rootInverse = root.matrixWorld.clone().invert();
  const box = new THREE.Box3();
  const meshBox = new THREE.Box3();
  root.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    const geometry = restGeometry(mesh);
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    meshBox.copy(geometry.boundingBox!).applyMatrix4(rootInverse.clone().multiply(mesh.matrixWorld));
    box.union(meshBox);
  });
  return box;
}
