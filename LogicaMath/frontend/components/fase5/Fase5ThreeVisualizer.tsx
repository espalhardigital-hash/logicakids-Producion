import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface ThreeConfig {
  geometry: 'cone' | 'cube' | 'sphere' | 'cylinder';
  radius?: number;
  height?: number;
  width?: number;
  depth?: number;
  radiusTop?: number;
  radiusBottom?: number;
  color?: string;
}

interface Fase5ThreeVisualizerProps {
  /**
   * JSON payload from database `preguntas.payload_tokenizado`
   * Example: { geometry: 'cone', radius: 3, height: 5, color: '#f59e0b' }
   */
  payload_tokenizado: ThreeConfig;
}

export const Fase5ThreeVisualizer: React.FC<Fase5ThreeVisualizerProps> = ({
  payload_tokenizado
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // 1. Create Scene, Camera, and WebGLRenderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a'); // slate-900 matching theme

    const width = mountRef.current.clientWidth || 500;
    const height = mountRef.current.clientHeight || 400;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // 2. Add Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x3b82f6, 0.3); // Subtle blue fill light
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // 3. Create Geometry based on JSON props
    let geometry: THREE.BufferGeometry;
    const cfg = payload_tokenizado;

    switch (cfg.geometry) {
      case 'cone':
        geometry = new THREE.ConeGeometry(cfg.radius ?? 2, cfg.height ?? 4, 32);
        break;
      case 'sphere':
        geometry = new THREE.SphereGeometry(cfg.radius ?? 2, 32, 32);
        break;
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(
          cfg.radiusTop ?? cfg.radius ?? 2,
          cfg.radiusBottom ?? cfg.radius ?? 2,
          cfg.height ?? 4,
          32
        );
        break;
      case 'cube':
      default:
        geometry = new THREE.BoxGeometry(cfg.width ?? 3, cfg.height ?? 3, cfg.depth ?? 3);
        break;
    }

    // Material with shading to show 3D depth clearly
    const material = new THREE.MeshStandardMaterial({
      color: cfg.color || '#f59e0b', // Amber/orange color by default
      roughness: 0.4,
      metalness: 0.1,
      flatShading: true // Gives a nice low-poly look for easy edge detection
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 4. Orbit Controls for children interaction (rotate/zoom)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 + 0.3; // Limit looking below ground
    controls.minDistance = 4;
    controls.maxDistance = 20;

    // 5. Animation Loop
    let animationFrameId: number;
    
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      // Auto-rotation when not interacting
      if (!controls.state === -1) {
        mesh.rotation.y += 0.005;
      }
      
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();

    // 6. Handle resizing
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    /**
     * ═══════════════════════════════════════════════════════════════════════
     * 🔍 VALIDATION NOTE (FASE 5)
     * 
     * Since this is a 3D visualization component, validation typically checks 
     * whether the user selected the correct name of the 3D shape or calculated 
     * its vertices/volume.
     * 
     * The evaluation is triggered when clicking a React alternative button 
     * (e.g. "Esfera", "Cone"), matching it to the `respuesta_correcta` (e.g. "cone").
     * ═══════════════════════════════════════════════════════════════════════
     */

    // 7. Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      
      geometry.dispose();
      material.dispose();
      controls.dispose();
      renderer.dispose();
    };
  }, [payload_tokenizado]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-950/50 border border-slate-800 rounded-2xl w-full">
      <div className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
        Usa el mouse o el dedo para rotar la figura 3D
      </div>
      <div 
        ref={mountRef} 
        className="w-full h-[400px] max-w-[600px] overflow-hidden rounded-xl border border-slate-700/50 shadow-2xl" 
      />
    </div>
  );
};

export default Fase5ThreeVisualizer;
