import { Type, Pencil, X } from 'lucide-react';
import { NoteType } from '@/types/note';

interface ModeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: NoteType) => void;
}

export default function ModeSelector({ isOpen, onClose, onSelect }: ModeSelectorProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        style={{ animation: 'fade-in 0.2s ease-out' }}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl"
        style={{ animation: 'slide-up 0.3s ease-out' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Create New Note</h2>

        <div className="space-y-3">
          <button
            onClick={() => onSelect('typed')}
            className="w-full flex items-center gap-4 p-6 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 border-2 border-transparent transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-white group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
              <Type className="w-6 h-6 text-gray-700 group-hover:text-indigo-600" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">Type Note</h3>
              <p className="text-sm text-gray-600">Create a text-based note</p>
            </div>
          </button>

          <button
            onClick={() => onSelect('drawing')}
            className="w-full flex items-center gap-4 p-6 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 border-2 border-transparent transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-white group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
              <Pencil className="w-6 h-6 text-gray-700 group-hover:text-indigo-600" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">Draw Note</h3>
              <p className="text-sm text-gray-600">Create a handwritten note</p>
            </div>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
