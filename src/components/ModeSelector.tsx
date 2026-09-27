// Breakpoint strategy:
// - Mobile (< 640px): vaul Drawer bottom sheet (`sm:hidden` wrapper)
// - Desktop (≥ 640px): centered modal (`hidden sm:flex` wrapper)
// No window.innerWidth or useIsMobile — CSS classes only.
import { Type, Pencil, X } from 'lucide-react';
import { Drawer as DrawerPrimitive } from 'vaul';
import { NoteType } from '@/types/note';

interface ModeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: NoteType) => void;
}

// Shared option buttons used in both mobile drawer and desktop modal
function NoteTypeOptions({ onSelect, onClose }: { onSelect: (type: NoteType) => void; onClose: () => void }) {
  return (
    <div className="space-y-3">
      <button
        onClick={() => onSelect('typed')}
        className="w-full flex items-center gap-4 p-4 min-h-[56px] rounded-xl bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 border-2 border-transparent transition-all group"
      >
        <div className="w-12 h-12 rounded-xl bg-white group-hover:bg-indigo-100 flex items-center justify-center transition-colors flex-shrink-0">
          <Type className="w-6 h-6 text-gray-700 group-hover:text-indigo-600" />
        </div>
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-900">Type Note</h3>
          <p className="text-sm text-gray-600">Create a text-based note</p>
        </div>
      </button>

      <button
        onClick={() => onSelect('drawing')}
        className="w-full flex items-center gap-4 p-4 min-h-[56px] rounded-xl bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 border-2 border-transparent transition-all group"
      >
        <div className="w-12 h-12 rounded-xl bg-white group-hover:bg-indigo-100 flex items-center justify-center transition-colors flex-shrink-0">
          <Pencil className="w-6 h-6 text-gray-700 group-hover:text-indigo-600" />
        </div>
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-900">Draw Note</h3>
          <p className="text-sm text-gray-600">Create a handwritten note</p>
        </div>
      </button>
    </div>
  );
}

export default function ModeSelector({ isOpen, onClose, onSelect }: ModeSelectorProps) {
  if (!isOpen) return null;

  const handleSelect = (type: NoteType) => {
    onSelect(type);
    onClose();
  };

  return (
    <>
      {/* ── Mobile: vaul Drawer bottom sheet (hidden on desktop) ── */}
      <div className="sm:hidden">
        <DrawerPrimitive.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
          <DrawerPrimitive.Portal>
            <DrawerPrimitive.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" />
            <DrawerPrimitive.Content className="fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white rounded-t-3xl px-6 pb-8 pt-2">
              {/* Drag handle */}
              <div className="mx-auto mt-3 mb-4 h-1.5 w-12 rounded-full bg-gray-300" />
              <div className="flex items-center justify-between mb-5">
                <DrawerPrimitive.Title className="text-xl font-semibold text-gray-900">
                  Create New Note
                </DrawerPrimitive.Title>
                <DrawerPrimitive.Close asChild>
                  <button
                    aria-label="Close"
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </DrawerPrimitive.Close>
              </div>
              <NoteTypeOptions onSelect={handleSelect} onClose={onClose} />
            </DrawerPrimitive.Content>
          </DrawerPrimitive.Portal>
        </DrawerPrimitive.Root>
      </div>

      {/* ── Desktop: centered modal (hidden on mobile) ── */}
      <div className="hidden sm:flex fixed inset-0 z-50 items-center justify-center">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          style={{ animation: 'fade-in 0.2s ease-out' }}
        />
        {/* Modal */}
        <div
          className="relative bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
          style={{ animation: 'slide-up 0.3s ease-out' }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Create New Note</h2>
          <NoteTypeOptions onSelect={handleSelect} onClose={onClose} />
        </div>

        <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slide-up {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    </>
  );
}
