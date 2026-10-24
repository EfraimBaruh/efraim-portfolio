import * as THREE from "three";

/**
 * Patches a glTF PBR material so fragments above `reveal` (world Y) are
 * discarded, with a faint warm band at the boundary. Lets the solid scan
 * sweep up through the point cloud. Idempotent: returns the material's
 * existing uniform when already patched.
 */
export function applyReveal(material: THREE.Material, initial: number): { value: number } {
  if (material.userData.reveal) return material.userData.reveal;
  const reveal = { value: initial };
  material.userData.reveal = reveal;

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uReveal = reveal;
    shader.uniforms.uEdgeColor = { value: new THREE.Color("#c8b89a") };

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
        varying vec3 vRevealWorld;`,
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float revealNoise = fract(sin(dot(floor(vRevealWorld.xz * 180.0), vec2(12.9898, 78.233))) * 43758.5453);
        float revealEdge = uReveal - vRevealWorld.y + revealNoise * 0.02;
        if (revealEdge < 0.0) discard;
        totalEmissiveRadiance += uEdgeColor * (1.0 - smoothstep(0.0, 0.03, revealEdge)) * 0.5;`,
      );
  };
  material.customProgramCacheKey = () => "reveal";
  material.needsUpdate = true;
  return reveal;
}
