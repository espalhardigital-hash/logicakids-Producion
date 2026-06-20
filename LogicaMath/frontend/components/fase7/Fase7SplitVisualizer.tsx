import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface Vertex2D {
  x: number;
  y: number;
}

interface SplitConfig {
  vertices: Vertex2D[];
  extrusionDepth?: number;
  color?: string;
}

interface Fase7SplitVisualizerProps {
  /**
   * JSON configuration containing initial 2D profile vertices and 3D depth parameters.
   * Example: { vertices: [{x: -50, y: -50}, {x: 50, y: -50}, {x: 50, y: 50}, {x: -50, y: 50}], extrusionDepth: 80, color: '#10b981' }
   */
  datos_numericos: SplitConfig;
  onStateChange?: (currentVertices: Vertex2D[]) => void;
}

export const Fase7SplitVisualizer: React.FC<Fase7SplitVisualizerProps> = ({
  datos_numericos,
  onStateChange
}) => {
  const fabricRef = useRef<HTMLCanvasElement | null>(null);
  const threeRef = useRef<HTMLDivElement | null>(null);

  // Keep references to share objects between Fabric and Three.js hooks/events safely
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const threeSceneRef = useRef<THREE.Scene | null>(null);
  const threeMeshRef = useRef<THREE.Mesh | null>(null);
  const extrusionDepthRef = useRef<number>(datos_numericos.extrusionDepth ?? 3);
  const colorRef = useRef<string>(datos_numericos.color ?? '#10b981');

  useEffect(() => {
    if (!fabricRef.current || !threeRef.current) return;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. THREE.JS INITIALIZATION (3D Panel)
    // ─────────────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a'); // slate-900
    threeSceneRef.current = scene;

    const threeW = threeRef.current.clientWidth || 300;
    const threeH = threeRef.current.clientHeight || 300;

    const camera = new THREE.PerspectiveCamera(45, threeW / threeH, 0.1, 1000);
    camera.position.set(0, 10, 15);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(threeW, threeH);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    threeRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 15);
    scene.add(dirLight);

    // Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // ─────────────────────────────────────────────────────────────────────────
    // 2. FABRIC.JS INITIALIZATION (2D Panel)
    // ─────────────────────────────────────────────────────────────────────────
    const canvas = new fabric.Canvas(fabricRef.current, {
      width: 300,
      height: 300,
      backgroundColor: '#1e293b', // slate-800 for contrast
      selection: false
    });
    fabricCanvasRef.current = canvas;

    const initialVertices = datos_numericos.vertices || [
      { x: -40, y: -40 },
      { x: 40, y: -40 },
      { x: 40, y: 40 },
      { x: -40, y: 40 }
    ];

    const centerX = 150;
    const centerY = 150;

    // Redraw the 3D model using the updated 2D points
    const updateThreeExtrusion = (pts: Vertex2D[]) => {
      if (!threeSceneRef.current) return;

      // Clean up previous mesh
      if (threeMeshRef.current) {
        threeSceneRef.current.remove(threeMeshRef.current);
        threeMeshRef.current.geometry.dispose();
        if (Array.isArray(threeMeshRef.current.material)) {
          threeMeshRef.current.material.forEach((mat) => mat.dispose());
        } else {
          threeMeshRef.current.material.dispose();
        }
      }

      // Create 2D Shape
      const threeShape = new THREE.Shape();
      if (pts.length > 0) {
        // We scale the points down so they fit nicely in the Three.js viewport
        const scale = 0.05;
        threeShape.moveTo(pts[0].x * scale, -pts[0].y * scale);
        for (let i = 1; i < pts.length; i++) {
          threeShape.lineTo(pts[i].x * scale, -pts[i].y * scale);
        }
        threeShape.closePath();
      }

      // Extrude Shape into 3D Space
      const extrudeSettings = {
        steps: 1,
        depth: extrusionDepthRef.current * 0.05,
        bevelEnabled: false
      };

      const geometry = new THREE.ExtrudeGeometry(threeShape, extrudeSettings);
      
      // Center the geometry so rotation happens around its local origin
      geometry.center();

      const material = new THREE.MeshStandardMaterial({
        color: colorRef.current,
        roughness: 0.3,
        metalness: 0.1,
        flatShading: true
      });

      const mesh = new THREE.Mesh(geometry, material);
      threeMeshRef.current = mesh;
      threeSceneRef.current.add(mesh);
    };

    // Keep handles updated and update extrusion
    const updatePolygonPoints = () => {
      const handles = canvas.getObjects('circle') as fabric.Circle[];
      
      // Map circles' coordinates relative to canvas center
      const currentPoints = handles.map((h) => ({
        x: (h.left ?? 0) - centerX,
        y: (h.top ?? 0) - centerY
      }));

      // Redraw the polygon connector line
      const polyLine = canvas.getObjects('polygon')[0] as fabric.Polygon;
      if (polyLine) {
        // Shift points to absolute positions for Fabric
        polyLine.points = currentPoints.map((p) => new fabric.Point(p.x, p.y));
        canvas.requestRenderAll();
      }

      // Redraw in 3D
      updateThreeExtrusion(currentPoints);

      if (onStateChange) {
        onStateChange(currentPoints);
      }

      /**
       * ═══════════════════════════════════════════════════════════════════════
       * 🔍 VALIDATION HOOK FOR DB COMPARISON
       * 
       * Triggered inside polygon updates (during/after dragging vertex handles).
       * Check if the generated shape coordinates match `respuesta_correcta`.
       * ═══════════════════════════════════════════════════════════════════════
       */
    };

    // Draw connecting polygon background
    const fabricPoly = new fabric.Polygon(
      initialVertices.map((v) => new fabric.Point(v.x, v.y)),
      {
        fill: `${colorRef.current}33`, // Transparent fill
        stroke: colorRef.current,
        strokeWidth: 2,
        left: centerX,
        top: centerY,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false
      }
    );
    canvas.add(fabricPoly);

    // Create interactive handles for each vertex
    initialVertices.forEach((v, idx) => {
      const circleHandle = new fabric.Circle({
        left: v.x + centerX,
        top: v.y + centerY,
        radius: 8,
        fill: '#ffffff',
        stroke: colorRef.current,
        strokeWidth: 2,
        hasControls: false,
        hasBorders: false,
        originX: 'center',
        originY: 'center'
      });

      canvas.add(circleHandle);

      circleHandle.on('moving', updatePolygonPoints);
    });

    // Run initial draw
    updatePolygonPoints();

    // Resize handlers
    const handleResize = () => {
      if (!threeRef.current) return;
      const w = threeRef.current.clientWidth;
      const h = threeRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // ─────────────────────────────────────────────────────────────────────────
    // 3. CLEANUP
    // ─────────────────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      
      canvas.dispose();
      controls.dispose();
      renderer.dispose();
      
      if (threeRef.current && renderer.domElement) {
        threeRef.current.removeChild(renderer.domElement);
      }
      
      if (threeMeshRef.current) {
        threeMeshRef.current.geometry.dispose();
        if (Array.isArray(threeMeshRef.current.material)) {
          threeMeshRef.current.material.forEach((m) => m.dispose());
        } else {
          threeMeshRef.current.material.dispose();
        }
      }
    };
  }, [datos_numericos, onStateChange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-950/60 border border-slate-800 rounded-3xl w-full">
      {/* 2D PANEL */}
      <div className="flex flex-col items-center justify-center bg-slate-900/40 p-4 border border-slate-800 rounded-2xl">
        <span className="text-xs font-bold text-slate-400 mb-3 tracking-widest uppercase">
          Perfil 2D (Arrastra los puntos)
        </span>
        <div className="rounded-xl border border-slate-700/50 overflow-hidden shadow-xl">
          <canvas ref={fabricRef} />
        </div>
      </div>

      {/* 3D PANEL */}
      <div className="flex flex-col items-center justify-center bg-slate-900/40 p-4 border border-slate-800 rounded-2xl">
        <span className="text-xs font-bold text-slate-400 mb-3 tracking-widest uppercase">
          Modelo Extruido 3D
        </span>
        <div 
          ref={threeRef} 
          className="w-[300px] h-[300px] rounded-xl border border-slate-700/50 overflow-hidden shadow-xl"
        />
      </div>
    </div>
  );
};

export default Fase7SplitVisualizer;
