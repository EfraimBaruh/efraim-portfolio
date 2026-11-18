import type { GLTFLoader } from "three-stdlib";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

let started = false;
// Not a React hook despite the name; aliased so the hooks lint rule agrees.
const { useWorkers: startWorkers } = MeshoptDecoder;

/**
 * drei's bundled meshopt decoder runs on the main thread; three's own one can
 * decode in Web Workers, which keeps unpacking the 3 MB scan out of the
 * page's long tasks. Pass as useGLTF's `extendLoader` (and to preload).
 */
export function withMeshopt(loader: GLTFLoader) {
  if (!started) {
    started = true;
    startWorkers(Math.min(2, Math.max(1, (navigator.hardwareConcurrency ?? 2) - 1)));
  }
  loader.setMeshoptDecoder(MeshoptDecoder);
}
