import { useState, useRef, useCallback } from 'react';
import { X, Upload, Check } from 'lucide-react';
import { NoteBackground, NoteBackgroundType } from '@/types/note';

interface BackgroundThemeSheetProps {
  isOpen: boolean;
  onClose: () => void;
  currentBackground?: NoteBackground;
  onSelectBackground: (background: NoteBackground) => void;
}

const SOLID_COLORS = [
  '#FFFFFF', // White (default)
  '#FFF4CC', // Soft yellow
  '#E6F0FF', // Soft blue
  '#E9F7EF', // Soft green
  '#FDECEF', // Soft pink
  '#F1EEFF', // Soft purple
  '#FEF3C7', // Warm cream
  '#FECACA', // Light coral
  '#D9F99D', // Light lime
  '#A7F3D0', // Mint
  '#BFDBFE', // Sky blue
  '#DDD6FE', // Lavender
];

const GRID_PATTERNS = [
  { name: 'Small Grid', value: 'grid-small' },
  { name: 'Medium Grid', value: 'grid-medium' },
  { name: 'Large Grid', value: 'grid-large' },
  { name: 'Dotted', value: 'dotted' },
  { name: 'Lined', value: 'lined' },
];

const GRADIENTS = [
  { name: 'Sunrise', value: 'linear-gradient(135deg, #FEF3C7 0%, #FECACA 100%)' },
  { name: 'Ocean', value: 'linear-gradient(135deg, #BFDBFE 0%, #A7F3D0 100%)' },
  { name: 'Lavender', value: 'linear-gradient(135deg, #DDD6FE 0%, #FBCFE8 100%)' },
  { name: 'Forest', value: 'linear-gradient(135deg, #A7F3D0 0%, #D9F99D 100%)' },
  { name: 'Sunset', value: 'linear-gradient(135deg, #FED7AA 0%, #FDECEF 100%)' },
  { name: 'Night', value: 'linear-gradient(135deg, #E6F0FF 0%, #F1EEFF 100%)' },
];

const DEFAULT_BACKGROUND: NoteBackground = { type: 'solid', value: '#FFFFFF' };

export default function BackgroundThemeSheet({
  isOpen,
  onClose,
  currentBackground = DEFAULT_BACKGROUND,
  onSelectBackground,
}: BackgroundThemeSheetProps) {
  const [activeTab, setActiveTab] = useState<NoteBackgroundType>(currentBackground.type);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onSelectBackground({ type: 'image', value: base64 });
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onSelectBackground]);

  const isSelected = (type: NoteBackgroundType, value: string) => {
    return currentBackground.type === type && currentBackground.value === value;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 transition-opacity"
        onClick={onClose}
      />
      
      {/* Bottom Sheet */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Note Background</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 pt-4 gap-2">
          {(['solid', 'grid', 'gradient', 'image'] as NoteBackgroundType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[400px] overflow-y-auto">
          {/* Solid Colors */}
          {activeTab === 'solid' && (
            <div className="grid grid-cols-6 gap-3">
              {SOLID_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => onSelectBackground({ type: 'solid', value: color })}
                  className={`relative w-12 h-12 rounded-xl transition-all duration-150 hover:scale-110 ${
                    isSelected('solid', color)
                      ? 'ring-2 ring-indigo-500 ring-offset-2'
                      : 'ring-1 ring-gray-200 hover:ring-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {isSelected('solid', color) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-5 h-5 text-indigo-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Grid Patterns */}
          {activeTab === 'grid' && (
            <div className="grid grid-cols-3 gap-3">
              {GRID_PATTERNS.map((pattern) => (
                <button
                  key={pattern.value}
                  onClick={() => onSelectBackground({ type: 'grid', value: pattern.value })}
                  className={`relative h-20 rounded-xl transition-all duration-150 hover:scale-105 ${
                    isSelected('grid', pattern.value)
                      ? 'ring-2 ring-indigo-500 ring-offset-2'
                      : 'ring-1 ring-gray-200 hover:ring-gray-300'
                  }`}
                  style={getGridPreviewStyle(pattern.value)}
                >
                  <span className="absolute bottom-2 left-2 text-xs font-medium text-gray-600 bg-white/80 px-2 py-0.5 rounded">
                    {pattern.name}
                  </span>
                  {isSelected('grid', pattern.value) && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-4 h-4 text-indigo-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Gradients */}
          {activeTab === 'gradient' && (
            <div className="grid grid-cols-3 gap-3">
              {GRADIENTS.map((gradient) => (
                <button
                  key={gradient.value}
                  onClick={() => onSelectBackground({ type: 'gradient', value: gradient.value })}
                  className={`relative h-20 rounded-xl transition-all duration-150 hover:scale-105 ${
                    isSelected('gradient', gradient.value)
                      ? 'ring-2 ring-indigo-500 ring-offset-2'
                      : 'ring-1 ring-gray-200 hover:ring-gray-300'
                  }`}
                  style={{ background: gradient.value }}
                >
                  <span className="absolute bottom-2 left-2 text-xs font-medium text-gray-600 bg-white/80 px-2 py-0.5 rounded">
                    {gradient.name}
                  </span>
                  {isSelected('gradient', gradient.value) && (
                    <div className="absolute top-2 right-2">
                      <Check className="w-4 h-4 text-indigo-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Image Upload */}
          {activeTab === 'image' && (
            <div className="space-y-4">
              {/* Current Image Preview */}
              {currentBackground.type === 'image' && currentBackground.value && (
                <div className="relative rounded-xl overflow-hidden h-32 ring-2 ring-indigo-500 ring-offset-2">
                  <img
                    src={currentBackground.value}
                    alt="Current background"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 rounded-full p-1">
                    <Check className="w-4 h-4 text-indigo-600" />
                  </div>
                </div>
              )}

              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
              >
                <Upload className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-500">Upload Custom Image</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />

              {/* Reset to default */}
              <button
                onClick={() => onSelectBackground({ type: 'solid', value: '#FFFFFF' })}
                className="w-full py-3 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Reset to default white background
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to generate grid preview styles
function getGridPreviewStyle(pattern: string): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
  };

  switch (pattern) {
    case 'grid-small':
      return {
        ...baseStyle,
        backgroundImage: `
          linear-gradient(#E5E7EB 1px, transparent 1px),
          linear-gradient(90deg, #E5E7EB 1px, transparent 1px)
        `,
        backgroundSize: '10px 10px',
      };
    case 'grid-medium':
      return {
        ...baseStyle,
        backgroundImage: `
          linear-gradient(#E5E7EB 1px, transparent 1px),
          linear-gradient(90deg, #E5E7EB 1px, transparent 1px)
        `,
        backgroundSize: '20px 20px',
      };
    case 'grid-large':
      return {
        ...baseStyle,
        backgroundImage: `
          linear-gradient(#E5E7EB 1px, transparent 1px),
          linear-gradient(90deg, #E5E7EB 1px, transparent 1px)
        `,
        backgroundSize: '30px 30px',
      };
    case 'dotted':
      return {
        ...baseStyle,
        backgroundImage: 'radial-gradient(#E5E7EB 1.5px, transparent 1.5px)',
        backgroundSize: '16px 16px',
      };
    case 'lined':
      return {
        ...baseStyle,
        backgroundImage: 'linear-gradient(#E5E7EB 1px, transparent 1px)',
        backgroundSize: '100% 24px',
      };
    default:
      return baseStyle;
  }
}

// Export helper function for use in editor
export function getBackgroundStyle(background?: NoteBackground): React.CSSProperties {
  if (!background) {
    return { backgroundColor: '#FFFFFF' };
  }

  switch (background.type) {
    case 'solid':
      return { backgroundColor: background.value };
    case 'gradient':
      return { background: background.value };
    case 'image':
      return {
        backgroundImage: `url(${background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    case 'grid':
      return getGridPreviewStyle(background.value);
    default:
      return { backgroundColor: '#FFFFFF' };
  }
}
