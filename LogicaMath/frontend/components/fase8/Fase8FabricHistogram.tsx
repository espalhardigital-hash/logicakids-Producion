import React, { useEffect, useRef } from 'react';
import { fabric } from 'fabric';

interface HistogramConfig {
  labels: string[];
  initialValues: number[];
  maxLimit?: number;
}

interface Fase8FabricHistogramProps {
  /**
   * JSON configuration containing labels and initial numeric values.
   * Example: { labels: ['A', 'B', 'C'], initialValues: [3, 8, 5], maxLimit: 10 }
   */
  datos_numericos: HistogramConfig;
  onStateChange?: (currentValues: number[]) => void;
}

export const Fase8FabricHistogram: React.FC<Fase8FabricHistogramProps> = ({
  datos_numericos,
  onStateChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // 1. Setup dimensions and math variables
    const canvasWidth = 500;
    const canvasHeight = 400;
    const chartBottomY = 300;
    const chartTopY = 80;
    const chartHeightRange = chartBottomY - chartTopY; // 220px

    const maxLimit = datos_numericos.maxLimit ?? 10;
    const labels = datos_numericos.labels || ['A', 'B', 'C'];
    const initialValues = datos_numericos.initialValues || [0, 0, 0];

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: '#0f172a', // slate-900
      selection: false
    });
    fabricCanvasRef.current = canvas;

    // Draw baseline axes
    const axisLine = new fabric.Line(
      [50, chartBottomY, canvasWidth - 50, chartBottomY],
      {
        stroke: '#475569', // slate-600
        strokeWidth: 2,
        selectable: false,
        evented: false
      }
    );
    canvas.add(axisLine);

    // Draw Y-axis gridlines
    for (let i = 0; i <= 4; i++) {
      const gridY = chartBottomY - (i / 4) * chartHeightRange;
      const gridVal = Math.round((i / 4) * maxLimit);

      // Label text
      const gridText = new fabric.Text(gridVal.toString(), {
        left: 20,
        top: gridY - 8,
        fontSize: 12,
        fill: '#94a3b8',
        fontFamily: 'sans-serif',
        selectable: false,
        evented: false
      });
      canvas.add(gridText);

      // Dotted horizontal line
      const gridLine = new fabric.Line([50, gridY, canvasWidth - 50, gridY], {
        stroke: '#334155',
        strokeWidth: 1,
        strokeDashArray: [5, 5],
        selectable: false,
        evented: false
      });
      canvas.add(gridLine);
    }

    const numBars = labels.length;
    const chartAreaWidth = canvasWidth - 100;
    const spacing = chartAreaWidth / numBars;
    const barWidth = Math.min(60, spacing * 0.6);

    const bars: fabric.Rect[] = [];
    const handles: fabric.Circle[] = [];
    const textLabels: fabric.Text[] = [];

    // Helper to calculate height and value conversion
    const valueToY = (val: number) => {
      const ratio = val / maxLimit;
      return chartBottomY - ratio * chartHeightRange;
    };

    const yToValue = (y: number) => {
      const ratio = (chartBottomY - y) / chartHeightRange;
      return Math.min(maxLimit, Math.max(0, Math.round(ratio * maxLimit)));
    };

    // Draw labels under bars
    labels.forEach((label, idx) => {
      const posX = 50 + idx * spacing + spacing / 2;

      const labelText = new fabric.Text(label, {
        left: posX,
        top: chartBottomY + 12,
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#cbd5e1',
        fontFamily: 'sans-serif',
        originX: 'center',
        selectable: false,
        evented: false
      });
      canvas.add(labelText);

      // Create Bar Rectangle
      const startVal = initialValues[idx] ?? 0;
      const startY = valueToY(startVal);
      const barHeight = chartBottomY - startY;

      const bar = new fabric.Rect({
        left: posX - barWidth / 2,
        top: startY,
        width: barWidth,
        height: Math.max(2, barHeight), // Minimum 2px height
        fill: '#3b82f6', // Bright blue
        rx: 4, // Rounded top corners
        ry: 4,
        selectable: false,
        evented: false
      });
      canvas.add(bar);
      bars.push(bar);

      // Create interactive top handle circle
      const handle = new fabric.Circle({
        left: posX,
        top: startY,
        radius: 12,
        fill: '#ffffff',
        stroke: '#3b82f6',
        strokeWidth: 3,
        originX: 'center',
        originY: 'center',
        hasControls: false,
        hasBorders: false,
        lockMovementX: true, // Only allow vertical dragging
        hoverCursor: 'ns-resize'
      });

      // Attach custom references
      (handle as any).barIndex = idx;
      canvas.add(handle);
      handles.push(handle);

      // Create value text label on top of handle
      const valText = new fabric.Text(startVal.toString(), {
        left: posX,
        top: startY - 24,
        fontSize: 12,
        fontWeight: 'bold',
        fill: '#3b82f6',
        fontFamily: 'sans-serif',
        originX: 'center',
        selectable: false,
        evented: false
      });
      canvas.add(valText);
      textLabels.push(valText);
    });

    // 2. Setup dragging listeners
    const handleMoving = (e: fabric.IEvent) => {
      const target = e.target as any;
      if (!target || target.barIndex === undefined) return;

      const idx = target.barIndex;
      const bar = bars[idx];
      const valText = textLabels[idx];

      // Bound Y movement between chart range limits
      let currentY = target.top ?? chartBottomY;
      if (currentY < chartTopY) {
        currentY = chartTopY;
        target.top = chartTopY;
      }
      if (currentY > chartBottomY) {
        currentY = chartBottomY;
        target.top = chartBottomY;
      }

      // Update Bar Height and Top
      const barHeight = chartBottomY - currentY;
      bar.set({
        top: currentY,
        height: Math.max(2, barHeight)
      });

      // Update Value Label
      const currentVal = yToValue(currentY);
      valText.set({
        top: currentY - 24,
        text: currentVal.toString()
      });

      canvas.requestRenderAll();
    };

    const handleMouseUp = () => {
      // Collect values from all handles
      const currentValues = handles.map((h) => {
        const topY = h.top ?? chartBottomY;
        return yToValue(topY);
      });

      if (onStateChange) {
        onStateChange(currentValues);
      }

      /**
       * ═══════════════════════════════════════════════════════════════════════
       * 🔍 VALIDATION HOOK FOR DB COMPARISON
       * 
       * Triggered here on `mouse:up` (when the child releases the bar handle).
       * Check if the generated values array matches `respuesta_correcta`.
       * 
       * Example:
       * const arraysEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
       * const isCorrect = arraysEqual(currentValues, JSON.parse(question.respuesta_correcta));
       * if (isCorrect) {
       *     onAnswerSubmit(isCorrect);
       * }
       * ═══════════════════════════════════════════════════════════════════════
       */
    };

    // Run initial state update
    if (onStateChange) {
      onStateChange(initialValues);
    }

    canvas.on('object:moving', handleMoving);
    canvas.on('mouse:up', handleMouseUp);

    // Cleanup
    return () => {
      canvas.off('object:moving', handleMoving);
      canvas.off('mouse:up', handleMouseUp);
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [datos_numericos, onStateChange]);

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
      <div className="text-sm font-semibold text-slate-400 mb-2 uppercase tracking-wider">
        Ajusta los valores arrastrando la parte superior de cada barra
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-700/50 shadow-2xl">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};

export default Fase8FabricHistogram;
