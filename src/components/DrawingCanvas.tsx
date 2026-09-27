import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Pencil, Eraser, Trash2, Save, Circle, Palette } from 'lucide-react';
import { Note, NoteBackground } from '@/types/note';
import BackgroundThemeSheet, { getBackgroundStyle } from '@/components/BackgroundThemeSheet';

interface DrawingCanvasProps {
  note: Note;
  onSave: (note: Note) => void;
  onClose: () => void;
}

const colors = ['#000000', '#4F46E5', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6','#dc49b3ff'];
const strokeSizes = [2, 4, 8, 12];

type CurrentMode = 'draw' | 'erase';

export default function DrawingCanvas({ note: initialNote, onSave, onClose }: DrawingCanvasProps) {
  // Single canvas for drawing strokes — background is handled purely via CSS on the container
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Tracks whether content loaded onto canvas is a legacy composite (background baked in).
  // True = old note with background baked into note.content pixels.
  // False = current session strokes only (transparent PNG).
  const isLegacyContent = useRef(!initialNote.background && !!initialNote.content);

  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [strokeSize, setStrokeSize] = useState(4);
  const [currentMode, setCurrentMode] = useState<CurrentMode>('draw');
  const [note, setNote] = useState(initialNote);
  const [showBackgroundSheet, setShowBackgroundSheet] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(!!initialNote.content);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);

  const eraserSize = strokeSize * 6;

  // Reset state when a different note is opened
  useEffect(() => {
    setNote(initialNote);
    setHasDrawn(!!initialNote.content);
    setCurrentMode('draw');
    setColor('#000000');
    setStrokeSize(4);
    setCursorPos(null);
    isLegacyContent.current = !initialNote.background && !!initialNote.content;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNote.id]);

  const initializeCanvas = useCallback(() => {
    const dc = drawCanvasRef.current;
    const container = containerRef.current;
    if (!dc || !container) return;

    const width = container.offsetWidth || 800;
    const height = container.offsetHeight || 600;

    dc.width = width;
    dc.height = height;

    const ctx = dc.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Load existing strokes (transparent PNG)
    if (note.content && note.content.startsWith('data:')) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, width, height);
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

  const getCanvasPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const dc = drawCanvasRef.current;
    if (!dc) return { x: 0, y: 0 };
    const rect = dc.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = getDrawCtx();
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const { x, y } = getCanvasPos(e);

    if (currentMode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.clearRect(x - eraserSize / 2, y - eraserSize / 2, eraserSize, eraserSize);
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

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const ctx = getDrawCtx();
    if (ctx) ctx.globalCompositeOperation = 'source-over';
  };

  const handleMouseLeaveCanvas = () => {
    stopDrawing();
    setCursorPos(null);
  };

  const clearCanvas = () => {
    const dc = drawCanvasRef.current;
    if (!dc) return;
    const ctx = dc.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, dc.width, dc.height);
  };

  const handleSave = () => {
    const dc = drawCanvasRef.current;
    if (!dc) return;

    if (!hasDrawn && !note.title?.trim()) {
      onClose();
      return;
    }

    // Save only the transparent strokes as PNG — background is stored separately in note.background
    // and applied via CSS on load. This keeps future background changes clean.
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
    // Update CSS background instantly.
    // If this note was loaded from old storage where background was baked into the PNG,
    // we must clear the canvas once so those old background pixels don't show through.
    // New strokes drawn this session are already transparent — no clear needed.
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

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 sm:px-6 py-4">
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
            {/* Pencil / Eraser */}
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentMode('draw')}
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
                onClick={() => setCurrentMode('erase')}
                title="Eraser"
                className={`p-3 rounded-lg transition-all ${
                  currentMode === 'erase'
                    ? 'bg-red-100 text-red-600 ring-2 ring-red-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Eraser className="w-5 h-5" />
              </button>
            </div>

            {/* Stroke colors */}
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => { setColor(c); setCurrentMode('draw'); }}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c && currentMode === 'draw'
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
      <div className="flex sm:hidden items-center gap-2 px-3 py-2 bg-white border-b border-gray-100 overflow-x-auto">
        {/* Draw / Erase toggle */}
        <button
          onClick={() => setCurrentMode('draw')}
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
          onClick={() => setCurrentMode('erase')}
          title="Eraser"
          className={`min-w-[44px] min-h-[44px] p-2.5 rounded-lg flex-shrink-0 transition-all ${
            currentMode === 'erase'
              ? 'bg-red-100 text-red-600 ring-2 ring-red-300'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          <Eraser className="w-5 h-5" />
        </button>

        <div className="w-px h-6 bg-gray-200 mx-1 flex-shrink-0" />

        {/* Color swatches */}
        {colors.map((c) => (
          <button
            key={c}
            onClick={() => { setColor(c); setCurrentMode('draw'); }}
            className={`w-8 h-8 rounded-full border-2 flex-shrink-0 transition-all ${
              color === c && currentMode === 'draw'
                ? 'border-indigo-600 scale-110'
                : 'border-gray-300'
            }`}
            style={{ backgroundColor: c, minWidth: 32, minHeight: 32 }}
          />
        ))}

        <div className="w-px h-6 bg-gray-200 mx-1 flex-shrink-0" />

        {/* Stroke sizes */}
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

        {/* Background + clear */}
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

      {/*
        Canvas area — background is applied purely via CSS (instant, no canvas repaint).
        The single canvas layer only holds the transparent strokes.
      */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative transition-all duration-300"
        style={getBackgroundStyle(note.background)}
      >
        <canvas
          ref={drawCanvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={handleMouseLeaveCanvas}
          className="absolute inset-0 w-full h-full"
          style={{ cursor: currentMode === 'erase' ? 'none' : 'crosshair', background: 'transparent', touchAction: 'none' }}
        />

        {/* Eraser cursor preview */}
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

      <BackgroundThemeSheet
        isOpen={showBackgroundSheet}
        onClose={() => setShowBackgroundSheet(false)}
        currentBackground={note.background}
        onSelectBackground={handleBackgroundChange}
      />
    </div>
  );
}
