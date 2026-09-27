import { Trash2, X } from 'lucide-react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmDialog({ isOpen, onClose, onConfirm }: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        style={{ animation: 'fade-in 0.2s ease-out' }}
      />

      {/* Dialog */}
      <div
        className="relative bg-gradient-to-b from-[#f0f4f8] to-white rounded-3xl p-8 max-w-xs w-full mx-4 shadow-2xl"
        style={{ animation: 'scale-in 0.3s ease-out' }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>

        {/* Trash Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <Trash2 className="w-20 h-20 text-pink-400" strokeWidth={1.5} />
            {/* Sparkle decorations */}
            <div className="absolute -top-2 -right-2 w-2 h-2 bg-blue-300 rounded-full animate-pulse" />
            <div className="absolute top-4 -right-4 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse delay-100" />
            <div className="absolute -top-1 left-0 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-pulse delay-200" />
          </div>
        </div>

        {/* Text */}
        <p className="text-center text-lg font-medium text-gray-800 mb-8 leading-relaxed">
          Are you sure you want to<br />delete this item?
        </p>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="w-full py-4 rounded-full bg-gradient-to-r from-pink-400 to-pink-300 text-white font-semibold text-base hover:from-pink-500 hover:to-pink-400 transition-all shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Yes, Delete
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3 text-pink-400 font-medium text-base hover:text-pink-500 transition-colors"
          >
            Cancel, Keep it
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-in {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
