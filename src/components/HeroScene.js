import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

function createGridTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(0, 255, 255, 0.9)';
  ctx.lineWidth = 2;
  const step = size / 8;
  for (let i = 0; i <= size; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 4);
  return texture;
}

function loadModel(loader, modelPath, isMountedRef) {
  return new Promise((resolve, reject) => {
    loader.load(
      modelPath,
      (gltf) => {
        if (!isMountedRef.current) return;
        resolve(gltf);
      },
      undefined,
      (error) => {
        console.error(`An error happened loading ${modelPath}:`, error);
        reject(error);
      }
    );
  });
}

function HeroScene({ emitter, hologram, beam = {} }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const isMountedRef = { current: true };

    // Scene setup — one shared scene/camera/renderer for both models.
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    const mountNode = mountRef.current;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountNode.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const blueLight = new THREE.PointLight(0x00ffff, 1, 10);
    blueLight.position.set(0, 2, 0);
    scene.add(blueLight);

    const loader = new GLTFLoader();

    let emitterGroup = null;
    let hologramGroup = null;
    let beamMesh = null;
    let gridTexture = null;

    function applyTransform(gltfScene, config) {
      gltfScene.position.set(...(config.position || [0, 0, 0]));
      gltfScene.scale.set(...(config.scale || [1, 1, 1]));
      gltfScene.rotation.set(...(config.rotation || [0, 0, 0]));
    }

    function applyHologramMaterial(gltfScene) {
      gltfScene.traverse((node) => {
        if (node.isMesh) {
          node.material.transparent = true;
          node.material.opacity = 0.7;
          node.material.color.set(0x00ffff);
          node.material.emissive.set(0x00ffff);
          node.material.emissiveIntensity = 0.2;
        }
      });
    }

    function buildBeam() {
      if (!beam.enabled || !emitterGroup || !hologramGroup) return;

      const emitterOffset = beam.emitterOffset || [0, 0, 0];
      const targetOffset = beam.targetOffset || [0, 0, 0];

      const emitterOrigin = emitterGroup.localToWorld(new THREE.Vector3(...emitterOffset));
      const targetOrigin = hologramGroup.localToWorld(new THREE.Vector3(...targetOffset));

      const direction = new THREE.Vector3().subVectors(targetOrigin, emitterOrigin);
      const length = direction.length();
      if (length < 0.001) return;
      direction.normalize();

      gridTexture = createGridTexture();
      const beamMaterial = new THREE.MeshBasicMaterial({
        map: gridTexture,
        color: 0x00ffff,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });

      const geometry = new THREE.CylinderGeometry(0.08, 0.6, length, 32, 1, true);
      beamMesh = new THREE.Mesh(geometry, beamMaterial);
      beamMesh.position.copy(emitterOrigin).add(targetOrigin).multiplyScalar(0.5);
      beamMesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.clone().negate()
      );
      scene.add(beamMesh);
    }

    // MeshoptDecoder's WASM initializes asynchronously — GLTFLoader checks
    // decoder.supported synchronously while parsing, so loading must not
    // start until this resolves, or meshopt-compressed files fail to load.
    MeshoptDecoder.ready.then(() => {
      if (!isMountedRef.current) return;
      loader.setMeshoptDecoder(MeshoptDecoder);

      Promise.all([
        loadModel(loader, emitter.modelPath, isMountedRef).then((gltf) => {
          if (!isMountedRef.current) return;
          scene.add(gltf.scene);
          applyTransform(gltf.scene, emitter);
          emitterGroup = gltf.scene;
        }),
        loadModel(loader, hologram.modelPath, isMountedRef).then((gltf) => {
          if (!isMountedRef.current) return;
          scene.add(gltf.scene);
          applyTransform(gltf.scene, hologram);
          if (hologram.isHologram) {
            applyHologramMaterial(gltf.scene);
          }
          hologramGroup = gltf.scene;
        }),
      ]).then(() => {
        if (!isMountedRef.current) return;
        buildBeam();
      }).catch((error) => {
        console.error('HeroScene: failed to load models', error);
      });
    });

    // Animation loop
    const clock = new THREE.Clock();
    let animationFrameId = null;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (hologramGroup) {
        hologramGroup.rotation.y += 0.005;
      }

      const flickerOpacity = 0.7 + Math.random() * 0.1;
      if (hologramGroup) {
        hologramGroup.traverse((node) => {
          if (node.isMesh && node.material) {
            node.material.opacity = flickerOpacity;
          }
        });
      }

      if (beamMesh) {
        beamMesh.material.opacity = 0.45 + Math.random() * 0.1;
        if (gridTexture) {
          gridTexture.offset.y -= delta * 0.4;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }

      scene.traverse((node) => {
        if (node.isMesh) {
          node.geometry?.dispose();
          if (Array.isArray(node.material)) {
            node.material.forEach((m) => m.dispose());
          } else {
            node.material?.dispose();
          }
        }
      });
      if (gridTexture) {
        gridTexture.dispose();
      }
      renderer.dispose();
      if (renderer.domElement.parentNode === mountNode) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, [emitter, hologram, beam]);

  return <div ref={mountRef} className="three-container" />;
}

export default HeroScene;
