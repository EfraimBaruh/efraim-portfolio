import * as THREE from "three";
import { MeshSurfaceSampler } from "three/examples/jsm/math/MeshSurfaceSampler.js";

/**
 * CPU work on the scan (skinning ~70k vertices, sampling up to 140k points)
 * is written as generators that `yield` every few hundred iterations.
 * `runSliced` drives them in ~8 ms slices so the main thread never blocks
 * long enough to drop frames or delay input; `runSync` runs them outright.
 */
export type Work<T> = Generator<void, T, void>;

const SLICE_MS = 8;

export function runSync<T>(work: Work<T>): T {
  let step = work.next();
  while (!step.done) step = work.next();
  return step.value;
}

function yieldToMain() {
  const scheduler = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  if (scheduler?.yield) return scheduler.yield();
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

export async function runSliced<T>(work: Work<T>): Promise<T> {
  let deadline = performance.now() + SLICE_MS;
  for (;;) {
    const step = work.next();
    if (step.done) return step.value;
    if (performance.now() > deadline) {
      await yieldToMain();
      deadline = performance.now() + SLICE_MS;
    }
  }
}

const restCache = new WeakMap<THREE.Mesh, THREE.BufferGeometry>();

/**
 * Geometry as it is actually rendered at rest, in the mesh's local space.
 * A skinned mesh is positioned through its bones (not its node transform),
 * so its raw position attribute can sit far from where it's drawn; bake the
 * bone-transformed positions into a plain geometry instead. Cached per mesh:
 * bounds and sampling share one pass, and later calls stay at rest even
 * while the Idle clip moves the bones.
 */
export function* restGeometryWork(mesh: THREE.Mesh): Work<THREE.BufferGeometry> {
  if (!(mesh as THREE.SkinnedMesh).isSkinnedMesh) return mesh.geometry;
  const cached = restCache.get(mesh);
  if (cached) return cached;
  const skinned = mesh as THREE.SkinnedMesh;
  const source = skinned.geometry;
  const count = source.attributes.position.count;
  const positions = new Float32Array(count * 3);
  const v = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    skinned.getVertexPosition(i, v);
    v.toArray(positions, i * 3);
    if ((i & 511) === 511) yield;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  if (source.index) g.setIndex(source.index);
  yield;
  g.computeVertexNormals();
  restCache.set(mesh, g);
  return g;
}

function restGeometry(mesh: THREE.Mesh) {
  return runSync(restGeometryWork(mesh));
}

export function meshesUnder(root: THREE.Object3D) {
  const meshes: THREE.Mesh[] = [];
  root.traverse((node) => {
    if ((node as THREE.Mesh).isMesh) meshes.push(node as THREE.Mesh);
  });
  return meshes;
}

/**
 * Only the triangles that reach above `floorY` (root space), so the sampler
 * isn't built over, and mostly rejected from, the body below the bust.
 */
function* cropAbove(geometry: THREE.BufferGeometry, toRoot: THREE.Matrix4, floorY: number): Work<THREE.BufferGeometry | null> {
  const pos = geometry.attributes.position;
  const e = toRoot.elements;
  const y = new Float32Array(pos.count);
  for (let i = 0; i < pos.count; i++) {
    y[i] = e[1] * pos.getX(i) + e[5] * pos.getY(i) + e[9] * pos.getZ(i) + e[13];
    if ((i & 2047) === 2047) yield;
  }
  const index = geometry.index;
  const corners = index ? index.count : pos.count;
  const kept = new Uint32Array(corners);
  let n = 0;
  for (let c = 0; c < corners; c += 3) {
    const a = index ? index.getX(c) : c;
    const b = index ? index.getX(c + 1) : c + 1;
    const d = index ? index.getX(c + 2) : c + 2;
    if (Math.max(y[a], y[b], y[d]) >= floorY) {
      kept[n++] = a;
      kept[n++] = b;
      kept[n++] = d;
    }
    if ((c & 4095) === 4095) yield;
  }
  if (n === 0) return null;
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", pos);
  if (geometry.attributes.normal) g.setAttribute("normal", geometry.attributes.normal);
  g.setIndex(new THREE.BufferAttribute(kept.slice(0, n), 1));
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
 * would crowd the head. With `floorY`, only surface above it is sampled:
 * triangles wholly below are cropped first, and rejection sampling trims the
 * ones that straddle it, so density stays uniform across meshes.
 */
export function* sampleSurfaceWork(root: THREE.Object3D, count: number, floorY = -Infinity): Work<SurfaceSamples> {
  root.updateWorldMatrix(true, true);
  const rootInverse = root.matrixWorld.clone().invert();

  const entries: { sampler: MeshSurfaceSampler; matrix: THREE.Matrix4; normalMatrix: THREE.Matrix3; area: number }[] = [];
  for (const mesh of meshesUnder(root)) {
    const matrix = rootInverse.clone().multiply(mesh.matrixWorld);
    const rest = yield* restGeometryWork(mesh);
    const geometry = floorY === -Infinity ? rest : yield* cropAbove(rest, matrix, floorY);
    if (!geometry) continue;
    const sampler = new MeshSurfaceSampler(new THREE.Mesh(geometry)).build();
    yield;
    // Area is measured in mesh space; scale it into root space so meshes with
    // different transforms (quantization offsets) are weighted correctly.
    const scale = new THREE.Vector3().setFromMatrixScale(matrix);
    const distribution = (sampler as unknown as { distribution: Float32Array }).distribution;
    const area = distribution[distribution.length - 1] * scale.x * scale.y;
    entries.push({ sampler, matrix, normalMatrix: new THREE.Matrix3().getNormalMatrix(matrix), area });
  }

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
    if ((attempt & 1023) === 1023) yield;
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
  for (const mesh of meshesUnder(root)) {
    const geometry = restGeometry(mesh);
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    meshBox.copy(geometry.boundingBox!).applyMatrix4(rootInverse.clone().multiply(mesh.matrixWorld));
    box.union(meshBox);
  }
  return box;
}
