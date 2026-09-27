import { X, ExternalLink, Trash2 } from 'lucide-react';

interface FolderOptionsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onDelete: () => void;
}

export default function FolderOptionsSheet({ isOpen, onClose, onOpen, onDelete }: FolderOptionsSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        style={{ animation: 'fade-in 0.2s ease-out' }}
      />

      {/* Bottom Sheet */}
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-3xl p-6 max-w-sm w-full mx-4 shadow-2xl"
        style={{ animation: 'slide-up 0.3s ease-out' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <h3 className="text-lg font-semibold text-gray-900 mb-4">Folder Options</h3>

        <div className="space-y-1">
          <button
            onClick={() => {
              onOpen();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-5 h-5 text-gray-600" />
            <span className="text-base font-medium text-gray-700">Open</span>
          </button>

          <button
            onClick={onDelete}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left hover:bg-red-50 transition-colors group"
          >
            <Trash2 className="w-5 h-5 text-gray-600 group-hover:text-red-500" />
            <span className="text-base font-medium text-gray-700 group-hover:text-red-500">Delete</span>
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
