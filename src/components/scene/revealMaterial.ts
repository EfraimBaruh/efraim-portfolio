import * as THREE from "three";
import { palette } from "@/content/palette";
import { BUST_BAND, BUST_CUT } from "./bust";

/** Hex as sRGB components, to compare with output-space fragment colours. */
function srgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

/**
 * Patches a glTF PBR material so fragments above `reveal` (world Y) are
 * discarded, with a faint warm band at the boundary. Lets the solid scan
 * sweep up through the point cloud. Below the bust line the surface fades
 * into the background colour, like a lit bust, and is not drawn past it.
 * Idempotent: returns the material's existing uniform when already patched.
 */
export function applyReveal(material: THREE.Material, initial: number): { value: number } {
  if (material.userData.reveal) return material.userData.reveal;
  const reveal = { value: initial };
  material.userData.reveal = reveal;

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uReveal = reveal;
    shader.uniforms.uEdgeColor = { value: new THREE.Color(palette.accent) };
    shader.uniforms.uBustCut = { value: BUST_CUT };
    shader.uniforms.uBustBand = { value: BUST_BAND };
    // Background is drawn untouched by tone mapping, so match it in sRGB.
    shader.uniforms.uFadeColor = { value: srgb(palette.ink) };

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vRevealWorld;")
      .replace(
        "#include <project_vertex>",
        "#include <project_vertex>\nvRevealWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;",
      );

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uReveal;
        uniform vec3 uEdgeColor;
        uniform float uBustCut;
        uniform float uBustBand;
        uniform vec3 uFadeColor;
        varying vec3 vRevealWorld;`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float revealNoise = fract(sin(dot(floor(vRevealWorld.xz * 180.0), vec2(12.9898, 78.233))) * 43758.5453);
        float revealEdge = uReveal - vRevealWorld.y + revealNoise * 0.02;
        if (revealEdge < 0.0 || vRevealWorld.y < uBustCut) discard;
        totalEmissiveRadiance += uEdgeColor * (1.0 - smoothstep(0.0, 0.03, revealEdge)) * 0.5;`,
      )
      .replace(
        "#include <colorspace_fragment>",
        `#include <colorspace_fragment>
        float bustFade = smoothstep(uBustCut, uBustCut + uBustBand, vRevealWorld.y);
        gl_FragColor.rgb = mix(uFadeColor, gl_FragColor.rgb, bustFade);`,
      );
  };
  material.customProgramCacheKey = () => "reveal-bust";
  material.needsUpdate = true;
  return reveal;
}
