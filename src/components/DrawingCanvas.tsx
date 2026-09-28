import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  Pencil,
  Eraser,
  Trash2,
  Save,
  Circle,
  Palette,
  Shapes,
} from 'lucide-react';
import { Note, NoteBackground } from '@/types/note';
import BackgroundThemeSheet, { getBackgroundStyle } from '@/components/BackgroundThemeSheet';

interface DrawingCanvasProps {
  note: Note;
  onSave: (note: Note) => void;
  onClose: () => void;
}

const colors = ['#000000', '#4F46E5', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#dc49b3ff'];
const strokeSizes = [2, 4, 8, 12];


const CANVAS_WIDTH = 2000;
const CANVAS_HEIGHT = 2400;

type CurrentMode = 'draw' | 'erase' | 'shape' | 'pan';



type ShapeType =
  | 'line'
  | 'curve'
  | 'circle'
  | 'square'
  | 'roundedRect'
  | 'triangle'
  | 'rightTriangle'
  | 'diamond'
  | 'pentagon'
  | 'hexagon'
  | 'arrowRight'
  | 'arrowLeft'
  | 'arrowUp'
  | 'arrowDown'
  | 'star4'
  | 'star5'
  | 'star6'
  | 'calloutRect'
  | 'calloutOval'
  | 'cloud'
  | 'heart';

interface ShapeDef {
  id: ShapeType;
  label: string;
  icon: React.ReactNode;
}

const ShapeIcon = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    {children}
  </svg>
);

const SHAPES: ShapeDef[] = [
  { id: 'line', label: 'Line', icon: <ShapeIcon><path d="M4 20 L20 4" /></ShapeIcon> },
  { id: 'curve', label: 'Curve', icon: <ShapeIcon><path d="M4 18 Q8 4 12 12 Q16 20 20 6" /></ShapeIcon> },
  { id: 'circle', label: 'Circle', icon: <ShapeIcon><circle cx="12" cy="12" r="8" /></ShapeIcon> },
  { id: 'square', label: 'Square', icon: <ShapeIcon><rect x="5" y="5" width="14" height="14" /></ShapeIcon> },
  { id: 'roundedRect', label: 'Rounded', icon: <ShapeIcon><rect x="5" y="5" width="14" height="14" rx="3" /></ShapeIcon> },
  { id: 'triangle', label: 'Triangle', icon: <ShapeIcon><path d="M12 4 L20 20 L4 20 Z" /></ShapeIcon> },
  { id: 'rightTriangle', label: 'Right Triangle', icon: <ShapeIcon><path d="M5 5 L5 19 L19 19 Z" /></ShapeIcon> },
  { id: 'diamond', label: 'Diamond', icon: <ShapeIcon><path d="M12 3 L21 12 L12 21 L3 12 Z" /></ShapeIcon> },
  { id: 'pentagon', label: 'Pentagon', icon: <ShapeIcon><path d="M12 3 L20 9 L17 19 L7 19 L4 9 Z" /></ShapeIcon> },
  { id: 'hexagon', label: 'Hexagon', icon: <ShapeIcon><path d="M8 4 L16 4 L21 12 L16 20 L8 20 L3 12 Z" /></ShapeIcon> },
  { id: 'arrowRight', label: 'Arrow Right', icon: <ShapeIcon><path d="M4 12 H18 M13 6 L19 12 L13 18" /></ShapeIcon> },
  { id: 'arrowLeft', label: 'Arrow Left', icon: <ShapeIcon><path d="M20 12 H6 M11 6 L5 12 L11 18" /></ShapeIcon> },
  { id: 'arrowUp', label: 'Arrow Up', icon: <ShapeIcon><path d="M12 20 V6 M6 11 L12 5 L18 11" /></ShapeIcon> },
  { id: 'arrowDown', label: 'Arrow Down', icon: <ShapeIcon><path d="M12 4 V18 M6 13 L12 19 L18 13" /></ShapeIcon> },
  { id: 'star4', label: '4-Point Star', icon: <ShapeIcon><path d="M12 2 L14 10 L22 12 L14 14 L12 22 L10 14 L2 12 L10 10 Z" /></ShapeIcon> },
  { id: 'star5', label: '5-Point Star', icon: <ShapeIcon><path d="M12 2 L14.5 9 H22 L16 13.5 L18.5 21 L12 16.5 L5.5 21 L8 13.5 L2 9 H9.5 Z" /></ShapeIcon> },
  { id: 'star6', label: '6-Point Star', icon: <ShapeIcon><path d="M12 2 L14 8 L20 6 L16 11 L22 14 L15 14 L16 20 L12 15 L8 20 L9 14 L2 14 L8 11 L4 6 L10 8 Z" /></ShapeIcon> },
  { id: 'calloutRect', label: 'Callout', icon: <ShapeIcon><path d="M4 4 H20 V14 H10 L6 19 V14 H4 Z" /></ShapeIcon> },
  { id: 'calloutOval', label: 'Oval Callout', icon: <ShapeIcon><ellipse cx="12" cy="10" rx="8" ry="6" /><path d="M10 15 L8 20 L14 15" /></ShapeIcon> },
  { id: 'cloud', label: 'Cloud', icon: <ShapeIcon><path d="M7 17 H17 A4 4 0 0 0 17 9 A5 5 0 0 0 8 9 A3.5 3.5 0 0 0 7 17 Z" /></ShapeIcon> },
  { id: 'heart', label: 'Heart', icon: <ShapeIcon><path d="M12 20 S4 14 4 9 A4 4 0 0 1 12 9 A4 4 0 0 1 20 9 C20 14 12 20 12 20 Z" /></ShapeIcon> },
];

function regularPolygon(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  rotation = -Math.PI / 2
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = rotation + (i * 2 * Math.PI) / sides;
    points.push({ x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) });
  }
  return points;
}

function starPoints(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  points: number
): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = [];
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = -Math.PI / 2 + i * step;
    result.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
  }
  return result;
}

function drawShapePath(
  ctx: CanvasRenderingContext2D,
  shape: ShapeType,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const right = Math.max(x1, x2);
  const bottom = Math.max(y1, y2);
  const w = right - left;
  const h = bottom - top;
  const cx = (left + right) / 2;
  const cy = (top + bottom) / 2;
  const r = Math.min(w, h) / 2;

  ctx.beginPath();

  switch (shape) {
    case 'line':
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      break;
    case 'curve': {
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      const dx = x2 - x1;
      const dy = y2 - y1;
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(mx - dy * 0.35, my + dx * 0.35, x2, y2);
      break;
    }
    case 'circle':
      ctx.ellipse(cx, cy, Math.max(w / 2, 1), Math.max(h / 2, 1), 0, 0, Math.PI * 2);
      break;
    case 'square': {
      const s = Math.min(w, h);
      const sx = x2 >= x1 ? left : right - s;
      const sy = y2 >= y1 ? top : bottom - s;
      ctx.rect(sx, sy, s, s);
      break;
    }
    case 'roundedRect': {
      const rr = Math.min(w, h) * 0.15;
      ctx.roundRect(left, top, w, h, rr);
      break;
    }
    case 'triangle':
      ctx.moveTo(cx, top);
      ctx.lineTo(right, bottom);
      ctx.lineTo(left, bottom);
      ctx.closePath();
      break;
    case 'rightTriangle':
      ctx.moveTo(left, top);
      ctx.lineTo(left, bottom);
      ctx.lineTo(right, bottom);
      ctx.closePath();
      break;
    case 'diamond':
      ctx.moveTo(cx, top);
      ctx.lineTo(right, cy);
      ctx.lineTo(cx, bottom);
      ctx.lineTo(left, cy);
      ctx.closePath();
      break;
    case 'pentagon':
      regularPolygon(cx, cy, r, 5).forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      break;
    case 'hexagon':
      regularPolygon(cx, cy, r, 6, 0).forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      break;
    case 'arrowRight': {
      const bodyH = h * 0.35;
      const headW = w * 0.4;
      ctx.moveTo(left, cy - bodyH / 2);
      ctx.lineTo(right - headW, cy - bodyH / 2);
      ctx.lineTo(right - headW, top);
      ctx.lineTo(right, cy);
      ctx.lineTo(right - headW, bottom);
      ctx.lineTo(right - headW, cy + bodyH / 2);
      ctx.lineTo(left, cy + bodyH / 2);
      ctx.closePath();
      break;
    }
    case 'arrowLeft': {
      const bodyH = h * 0.35;
      const headW = w * 0.4;
      ctx.moveTo(right, cy - bodyH / 2);
      ctx.lineTo(left + headW, cy - bodyH / 2);
      ctx.lineTo(left + headW, top);
      ctx.lineTo(left, cy);
      ctx.lineTo(left + headW, bottom);
      ctx.lineTo(left + headW, cy + bodyH / 2);
      ctx.lineTo(right, cy + bodyH / 2);
      ctx.closePath();
      break;
    }
    case 'arrowUp': {
      const bodyW = w * 0.35;
      const headH = h * 0.4;
      ctx.moveTo(cx - bodyW / 2, bottom);
      ctx.lineTo(cx - bodyW / 2, top + headH);
      ctx.lineTo(left, top + headH);
      ctx.lineTo(cx, top);
      ctx.lineTo(right, top + headH);
      ctx.lineTo(cx + bodyW / 2, top + headH);
      ctx.lineTo(cx + bodyW / 2, bottom);
      ctx.closePath();
      break;
    }
    case 'arrowDown': {
      const bodyW = w * 0.35;
      const headH = h * 0.4;
      ctx.moveTo(cx - bodyW / 2, top);
      ctx.lineTo(cx - bodyW / 2, bottom - headH);
      ctx.lineTo(left, bottom - headH);
      ctx.lineTo(cx, bottom);
      ctx.lineTo(right, bottom - headH);
      ctx.lineTo(cx + bodyW / 2, bottom - headH);
      ctx.lineTo(cx + bodyW / 2, top);
      ctx.closePath();
      break;
    }
    case 'star4':
      starPoints(cx, cy, r, r * 0.35, 4).forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      break;
    case 'star5':
      starPoints(cx, cy, r, r * 0.4, 5).forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      break;
    case 'star6':
      starPoints(cx, cy, r, r * 0.45, 6).forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      break;
    case 'calloutRect': {
      const tipH = h * 0.25;
      const boxBottom = bottom - tipH;
      ctx.moveTo(left, top);
      ctx.lineTo(right, top);
      ctx.lineTo(right, boxBottom);
      ctx.lineTo(left + w * 0.35, boxBottom);
      ctx.lineTo(left + w * 0.2, bottom);
      ctx.lineTo(left + w * 0.25, boxBottom);
      ctx.lineTo(left, boxBottom);
      ctx.closePath();
      break;
    }
    case 'calloutOval': {
      const tipH = h * 0.22;
      ctx.ellipse(cx, top + (h - tipH) / 2, w / 2, (h - tipH) / 2, 0, 0, Math.PI * 2);
      ctx.moveTo(cx - w * 0.1, top + (h - tipH) * 0.85);
      ctx.lineTo(cx - w * 0.2, bottom);
      ctx.lineTo(cx + w * 0.05, top + (h - tipH) * 0.9);
      break;
    }
    case 'cloud': {
      const bw = w * 0.18;
      const bh = h * 0.22;
      ctx.moveTo(left + bw, bottom - bh);
      ctx.bezierCurveTo(left - bw * 0.2, bottom - bh, left - bw * 0.2, top + h * 0.45, left + bw, top + h * 0.4);
      ctx.bezierCurveTo(left + w * 0.2, top - bh * 0.3, left + w * 0.45, top - bh * 0.3, left + w * 0.5, top + h * 0.25);
      ctx.bezierCurveTo(left + w * 0.6, top - bh * 0.2, right - bw * 0.3, top + h * 0.15, right - bw, top + h * 0.4);
      ctx.bezierCurveTo(right + bw * 0.3, top + h * 0.4, right + bw * 0.3, bottom - bh, right - bw, bottom - bh);
      ctx.closePath();
      break;
    }
    case 'heart': {
      const topY = top + h * 0.3;
      ctx.moveTo(cx, bottom);
      ctx.bezierCurveTo(left, cy + h * 0.15, left, top, cx, topY);
      ctx.bezierCurveTo(right, top, right, cy + h * 0.15, cx, bottom);
      break;
    }
  }

  ctx.stroke();
}

export default function DrawingCanvas({ note: initialNote, onSave, onClose }: DrawingCanvasProps) {
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isLegacyContent = useRef(!initialNote.background && !!initialNote.content);

  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [strokeSize, setStrokeSize] = useState(4);
  const [currentMode, setCurrentMode] = useState<CurrentMode>('draw');
  const [note, setNote] = useState(initialNote);
  const [showBackgroundSheet, setShowBackgroundSheet] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(!!initialNote.content);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedShape, setSelectedShape] = useState<ShapeType>('circle');
  const [showShapesPanel, setShowShapesPanel] = useState(false);
  const shapeStartRef = useRef<{ x: number; y: number } | null>(null);

  const eraserSize = strokeSize * 6;

  useEffect(() => {
    setNote(initialNote);
    setHasDrawn(!!initialNote.content);
    setCurrentMode('draw');
    setColor('#000000');
    setStrokeSize(4);
    setCursorPos(null);
    setShowShapesPanel(false);
    isLegacyContent.current = !initialNote.background && !!initialNote.content;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNote.id]);

  useEffect(() => {
    if (!showShapesPanel) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('[data-shapes-panel]') || target?.closest('[data-shapes-trigger]')) return;
      setShowShapesPanel(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [showShapesPanel]);

  const initializeCanvas = useCallback(() => {
    const dc = drawCanvasRef.current;
    const oc = overlayCanvasRef.current;
    if (!dc) return;
  
    dc.width = CANVAS_WIDTH;
    dc.height = CANVAS_HEIGHT;
    if (oc) {
      oc.width = CANVAS_WIDTH;
      oc.height = CANVAS_HEIGHT;
    }
  
    const ctx = dc.getContext('2d');
    if (!ctx) return;
  
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
    if (note.content && note.content.startsWith('data:')) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = note.content;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.id]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => initializeCanvas());
    return () => cancelAnimationFrame(frame);
  }, [initializeCanvas]);

  const getDrawCtx = (): CanvasRenderingContext2D | null =>
    drawCanvasRef.current?.getContext('2d') ?? null;

  const getOverlayCtx = (): CanvasRenderingContext2D | null =>
    overlayCanvasRef.current?.getContext('2d') ?? null;

  const clearOverlay = () => {
    const oc = overlayCanvasRef.current;
    const ctx = getOverlayCtx();
    if (oc && ctx) ctx.clearRect(0, 0, oc.width, oc.height);
  };

  const getCanvasPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const dc = drawCanvasRef.current;
    if (!dc) return { x: 0, y: 0 };
    const rect = dc.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) * dc.width) / rect.width,
      y: ((e.clientY - rect.top) * dc.height) / rect.height,
    };
  };

  const selectShape = (shape: ShapeType) => {
    setSelectedShape(shape);
    setCurrentMode('shape');
    setShowShapesPanel(false);
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (currentMode === 'pan') return;
  
    const ctx = getDrawCtx();
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const { x, y } = getCanvasPos(e);

    if (currentMode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.clearRect(x - eraserSize / 2, y - eraserSize / 2, eraserSize, eraserSize);
    } else if (currentMode === 'shape') {
      shapeStartRef.current = { x, y };
      clearOverlay();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeSize;
    }
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const { x, y } = getCanvasPos(e);

    if (currentMode === 'erase') {
      setCursorPos({ x, y });
    }

    if (!isDrawing) return;

    if (currentMode === 'shape') {
      const start = shapeStartRef.current;
      const overlayCtx = getOverlayCtx();
      const oc = overlayCanvasRef.current;
      if (!start || !overlayCtx || !oc) return;
      overlayCtx.clearRect(0, 0, oc.width, oc.height);
      overlayCtx.globalCompositeOperation = 'source-over';
      overlayCtx.strokeStyle = color;
      overlayCtx.lineWidth = strokeSize;
      overlayCtx.lineCap = 'round';
      overlayCtx.lineJoin = 'round';
      drawShapePath(overlayCtx, selectedShape, start.x, start.y, x, y);
      return;
    }

    const ctx = getDrawCtx();
    if (!ctx) return;

    if (currentMode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.clearRect(x - eraserSize / 2, y - eraserSize / 2, eraserSize, eraserSize);
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeSize;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = (e?: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    if (currentMode === 'shape' && shapeStartRef.current && e) {
      const start = shapeStartRef.current;
      const { x, y } = getCanvasPos(e);
      const ctx = getDrawCtx();
      if (ctx && (Math.abs(x - start.x) > 2 || Math.abs(y - start.y) > 2)) {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
        ctx.lineWidth = strokeSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        drawShapePath(ctx, selectedShape, start.x, start.y, x, y);
      }
      clearOverlay();
      shapeStartRef.current = null;
    }

    setIsDrawing(false);
    const ctx = getDrawCtx();
    if (ctx) ctx.globalCompositeOperation = 'source-over';
  };

  const handleMouseLeaveCanvas = () => {
    if (currentMode === 'shape' && isDrawing) {
      clearOverlay();
      shapeStartRef.current = null;
    }
    stopDrawing();
    setCursorPos(null);
  };

  const clearCanvas = () => {
    const dc = drawCanvasRef.current;
    if (!dc) return;
    const ctx = dc.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, dc.width, dc.height);
    clearOverlay();
  };

  const handleSave = () => {
    const dc = drawCanvasRef.current;
    if (!dc) return;

    if (!hasDrawn && !note.title?.trim()) {
      onClose();
      return;
    }

    const dataUrl = dc.toDataURL('image/png');
    const updatedNote: Note = {
      ...note,
      title: note.title?.trim() || 'Untitled',
      content: dataUrl,
      timestamp: new Date(),
    };
    setNote(updatedNote);
    onSave(updatedNote);
    onClose();
  };

  const handleBackgroundChange = (background: NoteBackground) => {
    if (isLegacyContent.current) {
      isLegacyContent.current = false;
      const dc = drawCanvasRef.current;
      if (dc) {
        const ctx = dc.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, dc.width, dc.height);
      }
      setNote(prev => ({ ...prev, background, content: '' }));
    } else {
      setNote(prev => ({ ...prev, background }));
    }
  };

  const renderShapesPanel = () =>
    showShapesPanel ? (
      <div
        data-shapes-panel
        className="absolute top-full left-0 mt-2 z-50 bg-white rounded-xl border border-gray-200 shadow-xl p-3 w-[280px] sm:w-[320px]"
      >
        <p className="text-xs font-semibold text-gray-500 mb-2 px-1">Shapes</p>
        <div className="grid grid-cols-7 gap-1">
          {SHAPES.map((shape) => (
            <button
              key={shape.id}
              type="button"
              title={shape.label}
              onClick={() => selectShape(shape.id)}
              className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                selectedShape === shape.id && currentMode === 'shape'
                  ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-300'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {shape.icon}
            </button>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="relative z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Desktop Tools — hidden on mobile */}
          <div className="hidden sm:flex items-center gap-6">
            {/* Pencil / Eraser / Shapes */}
            <div className="flex gap-2 relative">
              <button
                onClick={() => { setCurrentMode('draw'); setShowShapesPanel(false); }}
                title="Pencil"
                className={`p-3 rounded-lg transition-all ${
                  currentMode === 'draw'
                    ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button
                onClick={() => { setCurrentMode('erase'); setShowShapesPanel(false); }}
                title="Eraser"
                className={`p-3 rounded-lg transition-all ${
                  currentMode === 'erase'
                    ? 'bg-red-100 text-red-600 ring-2 ring-red-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Eraser className="w-5 h-5" />
              </button>
              <div className="relative">
                <button
                  data-shapes-trigger
                  onClick={() => {
                    setShowShapesPanel((v) => !v);
                    setCurrentMode('shape');
                  }}
                  title="Shapes"
                  className={`p-3 rounded-lg transition-all ${
                    currentMode === 'shape'
                      ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Shapes className="w-5 h-5" />
                </button>
                {renderShapesPanel()}
              </div>
            </div>

            {/* Stroke colors */}
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    setColor(c);
                    if (currentMode === 'erase') setCurrentMode('draw');
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c && currentMode !== 'erase'
                      ? 'border-indigo-600 scale-110'
                      : 'border-gray-300 hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            {/* Stroke sizes */}
            <div className="flex items-center gap-2">
              {strokeSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setStrokeSize(size)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                    strokeSize === size
                      ? currentMode === 'erase' ? 'bg-red-100' : 'bg-indigo-100'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Circle
                    className={strokeSize === size && currentMode === 'erase' ? 'fill-red-500' : 'fill-gray-700'}
                    style={{ width: size * 2, height: size * 2 }}
                  />
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-2 ml-4 border-l border-gray-200 pl-4">
              <button
                onClick={() => setShowBackgroundSheet(true)}
                className="p-3 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all"
                title="Change Background"
              >
                <Palette className="w-5 h-5" />
              </button>
              <button
                onClick={clearCanvas}
                className="p-3 rounded-lg bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-3 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium"
              >
                <Save className="w-5 h-5" />
                Save
              </button>
            </div>
          </div>

          {/* Mobile save button — always visible */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={handleSave}
              className="min-w-[44px] min-h-[44px] px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center gap-1.5 text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Mobile toolbar — compact scrollable strip (hidden on desktop) */}
      <div className="sm:hidden">
        <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-100 overflow-x-auto">
          <button
            onClick={() => { setCurrentMode('draw'); setShowShapesPanel(false); }}
            title="Pencil"
            className={`min-w-[44px] min-h-[44px] p-2.5 rounded-lg flex-shrink-0 transition-all ${
              currentMode === 'draw'
                ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-300'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={() => { setCurrentMode('erase'); setShowShapesPanel(false); }}
            title="Eraser"
            className={`min-w-[44px] min-h-[44px] p-2.5 rounded-lg flex-shrink-0 transition-all ${
              currentMode === 'erase'
                ? 'bg-red-100 text-red-600 ring-2 ring-red-300'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Eraser className="w-5 h-5" />
          </button>
          <button
            data-shapes-trigger
            onClick={() => {
              setShowShapesPanel((v) => !v);
              setCurrentMode('shape');
            }}
            title="Shapes"
            className={`min-w-[44px] min-h-[44px] p-2.5 rounded-lg flex-shrink-0 transition-all ${
              currentMode === 'shape'
                ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-300'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Shapes className="w-5 h-5" />
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1 flex-shrink-0" />

          {colors.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                if (currentMode === 'erase') setCurrentMode('draw');
              }}
              className={`w-8 h-8 rounded-full border-2 flex-shrink-0 transition-all ${
                color === c && currentMode !== 'erase'
                  ? 'border-indigo-600 scale-110'
                  : 'border-gray-300'
              }`}
              style={{ backgroundColor: c, minWidth: 32, minHeight: 32 }}
            />
          ))}

          <div className="w-px h-6 bg-gray-200 mx-1 flex-shrink-0" />

          {strokeSizes.map((size) => (
            <button
              key={size}
              onClick={() => setStrokeSize(size)}
              className={`min-w-[44px] min-h-[44px] rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                strokeSize === size
                  ? currentMode === 'erase' ? 'bg-red-100' : 'bg-indigo-100'
                  : 'bg-gray-50'
              }`}
            >
              <Circle
                className={strokeSize === size && currentMode === 'erase' ? 'fill-red-500' : 'fill-gray-700'}
                style={{ width: size * 2, height: size * 2 }}
              />
            </button>
          ))}

          <div className="w-px h-6 bg-gray-200 mx-1 flex-shrink-0" />

          <button
            onClick={() => setShowBackgroundSheet(true)}
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-lg bg-gray-100 text-gray-600 flex-shrink-0"
            title="Background"
          >
            <Palette className="w-5 h-5" />
          </button>
          <button
            onClick={clearCanvas}
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-lg bg-gray-100 text-gray-600 flex-shrink-0"
            title="Clear"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {showShapesPanel && (
          <div data-shapes-panel className="bg-white border-b border-gray-100 px-3 py-3">
            <p className="text-xs font-semibold text-gray-500 mb-2 px-1">Shapes</p>
            <div className="grid grid-cols-7 gap-1">
              {SHAPES.map((shape) => (
                <button
                  key={shape.id}
                  type="button"
                  title={shape.label}
                  onClick={() => selectShape(shape.id)}
                  className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                    selectedShape === shape.id && currentMode === 'shape'
                      ? 'bg-indigo-100 text-indigo-600 ring-2 ring-indigo-300'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {shape.icon}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Title */}
      <div className="bg-white border-b border-gray-100 px-8 py-3">
        <input
          type="text"
          value={note.title || ''}
          onChange={(e) => setNote(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter title"
          className="text-xl font-semibold text-gray-800 placeholder-gray-300 bg-transparent outline-none focus:outline-none w-1/2 truncate"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
      </div>

      <div ref={containerRef} className="flex-1 min-h-0 overflow-auto relative bg-gray-100 drawing-scroll">
  <div
    className="relative"
    style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, ...getBackgroundStyle(note.background) }}
  >
    <canvas
      ref={drawCanvasRef}
      onPointerDown={startDrawing}
      onPointerMove={draw}
      onPointerUp={stopDrawing}
      onPointerLeave={handleMouseLeaveCanvas}
      className="absolute inset-0 w-full h-full"
      style={{
        cursor: currentMode === 'erase' ? 'none' : currentMode === 'pan' ? 'grab' : 'crosshair',
        background: 'transparent',
        touchAction: currentMode === 'pan' ? 'auto' : 'none',
      }}
    />
    <canvas
      ref={overlayCanvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ background: 'transparent' }}
    />

    {currentMode === 'erase' && cursorPos && (
      <div
        className="absolute pointer-events-none border-2 border-red-400 bg-red-100/20 rounded-sm"
        style={{
          width: eraserSize,
          height: eraserSize,
          left: cursorPos.x - eraserSize / 2,
          top: cursorPos.y - eraserSize / 2,
        }}
      />
    )}
  </div>
</div>

      <BackgroundThemeSheet
        isOpen={showBackgroundSheet}
        onClose={() => setShowBackgroundSheet(false)}
        currentBackground={note.background}
        onSelectBackground={handleBackgroundChange}
      />
    </div>
  );
}
