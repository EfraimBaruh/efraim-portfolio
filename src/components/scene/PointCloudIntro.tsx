"use client";

import { type RefObject, use, useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { palette } from "@/content/palette";
import { runSliced, sampleSurfaceWork, type Work } from "./sampleSurface";
import { BUST_BAND, BUST_CUT } from "./bust";

// Timeline in seconds from the moment the scan finishes loading.
const FADE_IN = 0.6;
const ASSEMBLE_START = 0.2;
const ASSEMBLE_END = 2.9;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uAssemble;
  uniform float uReveal;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec2 uHeight;
  uniform vec3 uKeyDir;
  uniform float uBustCut;
  uniform float uBustBand;

  attribute vec3 aStart;
  attribute vec3 aNormal;
  attribute float aSeed;

  varying float vAlpha;
  varying float vShade;

  float easeInOutCubic(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
  }

  void main() {
    // Bottom-up stagger with a little per-point jitter.
    float h = clamp((position.y - uHeight.x) / (uHeight.y - uHeight.x), 0.0, 1.0);
    float delay = h * 0.5 + aSeed * 0.12;
    float p = easeInOutCubic(clamp((uAssemble - delay) / 0.38, 0.0, 1.0));

    // Unassembled points drift slowly and swirl around the vertical axis.
    float t = uTime * 0.35 + aSeed * 6.2831;
    vec3 drift = aStart + vec3(sin(t), cos(t * 0.8), sin(t * 1.3)) * 0.04;
    float swirl = (1.0 - p) * 1.2;
    drift.xz = mat2(cos(swirl), -sin(swirl), sin(swirl), cos(swirl)) * drift.xz;

    vec3 pos = mix(drift, position, p);
    vec4 world = modelMatrix * vec4(pos, 1.0);
    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * mix(1.6, 1.0, p) / -mv.z;

    // Fake key light gives the cloud form before the real surface appears.
    vec3 n = normalize(mat3(modelMatrix) * aNormal);
    vShade = mix(0.55, 0.45 + 0.55 * max(dot(n, uKeyDir), 0.0), p);

    // Points dissolve as the solid surface sweeps up past them.
    float worldTargetY = (modelMatrix * vec4(position, 1.0)).y;
    float revealFade = smoothstep(uReveal - 0.1, uReveal + 0.02, worldTargetY);
    float bustFade = smoothstep(uBustCut, uBustCut + uBustBand, worldTargetY);
    vAlpha = mix(0.3, 1.0, p) * revealFade * bustFade;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vAlpha;
  varying float vShade;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float disc = smoothstep(0.5, 0.2, d);
    float a = disc * vAlpha * uOpacity;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor * vShade, a);
  }
`;

/** Targets on the scan surface plus random start positions in a loose column around the figure. */
function* buildGeometry(source: THREE.Object3D, count: number, floorY: number): Work<THREE.BufferGeometry> {
  const { positions, normals, minY, maxY } = yield* sampleSurfaceWork(source, count, floorY);
  count = positions.length / 3;
  const height = maxY - minY;
  const starts = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const r = height * (0.12 + Math.random() * 0.3);
    const a = Math.random() * Math.PI * 2;
    starts[i * 3] = Math.cos(a) * r;
    starts[i * 3 + 1] = minY + Math.random() * height * 1.05;
    starts[i * 3 + 2] = Math.sin(a) * r;
    seeds[i] = Math.random();
    if ((i & 4095) === 4095) yield;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  g.setAttribute("aNormal", new THREE.BufferAttribute(normals, 3));
  g.setAttribute("aStart", new THREE.BufferAttribute(starts, 3));
  g.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
  g.userData.height = [minY, maxY];
  return g;
}

function createMaterial(geometry: THREE.BufferGeometry) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uAssemble: { value: 0 },
      uReveal: { value: -1 },
      uOpacity: { value: 0 },
      uSize: { value: 0 },
      uPixelRatio: { value: 1 },
      uHeight: { value: new THREE.Vector2(...(geometry.userData.height as [number, number])) },
      uKeyDir: { value: new THREE.Vector3(-2.5, 3, 2.5).normalize() },
      uColor: { value: new THREE.Color(palette.accent2) },
      uBustCut: { value: BUST_CUT },
      uBustBand: { value: BUST_BAND },
    },
  });
}

type Stage = { gl: THREE.WebGLRenderer; camera: THREE.Camera; scene: THREE.Scene };
type Intro = { geometry: THREE.BufferGeometry; material: THREE.ShaderMaterial };

/** Samples in slices, then compiles the points shader in parallel, all before the first frame. */
async function buildIntro(source: THREE.Object3D, count: number, floorY: number, stage: Stage): Promise<Intro> {
  const geometry = await runSliced(buildGeometry(source, count, floorY));
  const material = createMaterial(geometry);
  try {
    await stage.gl.compileAsync(new THREE.Points(geometry, material), stage.camera, stage.scene);
  } catch {
    // Compiles on the first frame instead.
  }
  return { geometry, material };
}

// Keyed so React's use() gets a stable promise across renders.
const builds = new WeakMap<THREE.Object3D, Map<string, Promise<Intro>>>();

function introFor(source: THREE.Object3D, count: number, floorY: number, stage: Stage) {
  let bySource = builds.get(source);
  if (!bySource) builds.set(source, (bySource = new Map()));
  const key = `${count}:${floorY}`;
  let promise = bySource.get(key);
  if (!promise) bySource.set(key, (promise = buildIntro(source, count, floorY, stage)));
  return promise;
}

type Props = {
  /** The loaded scan; points are sampled in its local space. */
  source: THREE.Object3D;
  count: number;
  /** Only the surface above this local-space Y is sampled (the bust). */
  floorY: number;
  /** Current dissolve height in world Y, owned by the avatar. */
  revealRef: RefObject<number>;
  onAssembled: () => void;
};

export default function PointCloudIntro({ source, count, floorY, revealRef, onAssembled }: Props) {
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);
  const points = useRef<THREE.Points<THREE.BufferGeometry, THREE.ShaderMaterial>>(null);
  const elapsed = useRef(0);
  const assembledFired = useRef(false);

  // Suspends (the scan stays hidden) until the cloud is sampled and compiled.
  const { geometry, material } = use(introFor(source, count, floorY, { gl, camera, scene }));

  useEffect(
    () => () => {
      // GPU buffers only; the cached arrays stay so a re-render (or React's
      // dev remount) never resamples and restarts the intro.
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((_, delta) => {
    elapsed.current += Math.min(delta, 1 / 30);
    const t = elapsed.current;
    if (!points.current) return;
    const u = points.current.material.uniforms;
    u.uReveal.value = revealRef.current;
    u.uTime.value = t;
    u.uPixelRatio.value = gl.getPixelRatio();
    // Point size in world-ish units; denser clouds get finer points.
    u.uSize.value = 1.6 * Math.sqrt(140000 / count);
    u.uOpacity.value = Math.min(t / FADE_IN, 1);
    u.uAssemble.value = THREE.MathUtils.clamp((t - ASSEMBLE_START) / (ASSEMBLE_END - ASSEMBLE_START), 0, 1);
    if (!assembledFired.current && u.uAssemble.value > 0.82) {
      assembledFired.current = true;
      onAssembled();
    }
  });

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />;
}
