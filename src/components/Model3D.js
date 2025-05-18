import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function Model3D({ 
  modelPath, 
  position = [0, 0, 0], 
  scale = [1, 1, 1],
  rotation = [0, 0, 0],
  isHologram = false,
  coneProps = {}
}) {
  const mountRef = useRef(null);
  const mixerRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Camera position
    camera.position.z = 10;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Add blue point light for hologram effect
    if (isHologram) {
      const blueLight = new THREE.PointLight(0x00ffff, 1, 10);
      blueLight.position.set(0, 2, 0);
      scene.add(blueLight);
    }

    // Load 3D model
    const loader = new GLTFLoader();
    console.log('Starting to load model...');
    loader.load(
      modelPath,
      (gltf) => {
        console.log('Model loaded successfully:', gltf);
        scene.add(gltf.scene);
        
        console.log('Animations:', gltf.animations);
        
        // Apply hologram effect if enabled
        if (isHologram) {
          gltf.scene.traverse((node) => {
            if (node.isMesh) {
              // Make material transparent and blue-ish
              node.material.transparent = true;
              node.material.opacity = 0.7;
              node.material.color.set(0x00ffff);
              node.material.emissive.set(0x00ffff);
              node.material.emissiveIntensity = 0.2;
            }
          });

        }

        gltf.scene.traverse((node) => {
          if (node.isMesh) {
            console.log('Mesh found:', node.name);
            console.log('Position:', node.position);
            console.log('Scale:', node.scale);
          }
        });

        gltf.scene.position.set(...position);
        gltf.scene.scale.set(...scale);
        gltf.scene.rotation.set(...rotation);
      },
      (progress) => {
        console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
      },
      (error) => {
        console.error('An error happened loading the model:', error);
      }
    );

    // Hologram blue, double-sided triangle
    const vertices = new Float32Array([
      0, 0, 0,      // Vertex 1
      1, 0, 0,      // Vertex 2
      0.5, 1, 0     // Vertex 3 (forms a triangle in the XY plane)
    ]);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.2,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    const triangle = new THREE.Mesh(geometry, material);
    triangle.position.set(2.5, -2, 5.5); // Adjust as needed
    scene.add(triangle);

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      requestAnimationFrame(animate);

      if (mixerRef.current) {
        mixerRef.current.update(clock.getDelta());
      }

      // Calculate flicker opacity ONCE
      let flickerOpacity = 0.7;
      if (isHologram) {
        flickerOpacity = 0.7 + Math.random() * 0.1;
        // Apply to all hologram meshes EXCEPT the triangle
        scene.traverse((node) => {
          // Exclude the triangle by checking reference
          if (node.isMesh && node.material && node !== triangle) {
            node.material.opacity = flickerOpacity;
          }
        });
        // Apply the SAME flicker to the triangle
        if (triangle) {
          triangle.material.opacity = flickerOpacity;
        }
      } else {
        // If not hologram, set triangle to base opacity
        if (triangle) {
          triangle.material.opacity = 0.7;
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [modelPath, position, scale, rotation, isHologram, coneProps]);

  return <div ref={mountRef} className="three-container" />;
}

export default Model3D; 