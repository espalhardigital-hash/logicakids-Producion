import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

interface ShapeConfig {
  type: 'circle' | 'square' | 'triangle' | 'pentagon' | 'hexagon';
  color: string;
  radius?: number;
  width?: number;
  height?: number;
  left?: number;
  top?: number;
}

interface Fase4FabricVisualizerProps {
  /**
   * JSON payload from database `preguntas.datos_numericos`
   * Example: { shapes: [{ type: 'circle', radius: 50, color: 'red', left: 100, top: 100 }] }
   */
  datos_numericos: {
    shapes?: ShapeConfig[];
    [key: string]: any;
  };
  onStateChange?: (currentState: any) => void;
}

// Helper to calculate points for regular N-sided polygon
const getRegularPolygonPoints = (sides: number, radius: number) => {
  const points = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
    points.push({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle)
    });
  }
  return points;
};

export const Fase4FabricVisualizer: React.FC<Fase4FabricVisualizerProps> = ({
  datos_numericos,
  onStateChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. Initialize Fabric.js Canvas
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 600,
      height: 400,
      backgroundColor: '#0f172a', // slate-900 background matching the theme
      selection: false // Disable multi-selection box for children simplicity
    });
    fabricCanvasRef.current = canvas;

    // 2. Parse shapes from JSON props
    const shapes = datos_numericos?.shapes || [];
    
    shapes.forEach((cfg) => {
      let fabricObj: fabric.Object | null = null;

      const baseOpts: fabric.IObjectOptions = {
        fill: cfg.color || '#3b82f6',
        left: cfg.left ?? Math.random() * 400 + 50,
        top: cfg.top ?? Math.random() * 250 + 50,
        // Make draggable but lock scaling/rotation for simplicity in 2D shape identification
        hasControls: false,
        hasBorders: false,
        lockRotation: true,
        lockScalingX: true,
        lockScalingY: true
      };

      if (cfg.type === 'circle') {
        fabricObj = new fabric.Circle({
          ...baseOpts,
          radius: cfg.radius || 40
        });
      } else if (cfg.type === 'square') {
        const size = cfg.width || (cfg.radius ? cfg.radius * 2 : 80);
        fabricObj = new fabric.Rect({
          ...baseOpts,
          width: size,
          height: size
        });
      } else if (cfg.type === 'triangle') {
        fabricObj = new fabric.Triangle({
          ...baseOpts,
          width: cfg.width || 80,
          height: cfg.height || 80
        });
      } else if (cfg.type === 'pentagon') {
        const radius = cfg.radius || 40;
        fabricObj = new fabric.Polygon(getRegularPolygonPoints(5, radius), baseOpts);
      } else if (cfg.type === 'hexagon') {
        const radius = cfg.radius || 40;
        fabricObj = new fabric.Polygon(getRegularPolygonPoints(6, radius), baseOpts);
      }

      if (fabricObj) {
        canvas.add(fabricObj);
      }
    });

    // 3. Setup event listeners for drag tracking
    const handleStateChange = () => {
      const objectsState = canvas.getObjects().map((obj) => ({
        type: obj.type,
        left: obj.left,
        top: obj.top,
        fill: obj.fill
      }));

      if (onStateChange) {
        onStateChange(objectsState);
      }

      /**
       * ═══════════════════════════════════════════════════════════════════════
       * 🔍 VALIDATION HOOK FOR DB COMPARISON
       * 
       * Here you should invoke a validation method comparing the current state 
       * of objects (objectsState) with the database's `respuesta_correcta`.
       * 
       * For example:
       * const isCorrect = validatePositions(objectsState, question.respuesta_correcta);
       * if (isCorrect) {
       *     onAnswerSubmit(isCorrect);
       * }
       * ═══════════════════════════════════════════════════════════════════════
       */
    };

    canvas.on('object:moving', handleStateChange);
    canvas.on('object:modified', handleStateChange);

    // Initial state trigger
    handleStateChange();

    // 4. Cleanup on unmount
    return () => {
      canvas.off('object:moving', handleStateChange);
      canvas.off('object:modified', handleStateChange);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [datos_numericos, onStateChange]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
      <div className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
        Interactúa arrastrando las figuras
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-700/50 shadow-2xl">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default Fase4FabricVisualizer;
