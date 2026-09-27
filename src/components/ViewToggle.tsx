import { Grid3x3, List } from 'lucide-react';
import { ViewMode } from '@/types/note';

interface ViewToggleProps {
  mode: ViewMode;
  onToggle: (mode: ViewMode) => void;
}

export default function ViewToggle({ mode, onToggle }: ViewToggleProps) {
  return (
    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
      <button
        onClick={() => onToggle('grid')}
        className={`p-2 rounded-md transition-all ${
          mode === 'grid'
            ? 'bg-white shadow-sm text-gray-900'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Grid3x3 className="w-5 h-5" />
      </button>
      <button
        onClick={() => onToggle('list')}
        className={`p-2 rounded-md transition-all ${
          mode === 'list'
            ? 'bg-white shadow-sm text-gray-900'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <List className="w-5 h-5" />
      </button>
    </div>
  );
}
