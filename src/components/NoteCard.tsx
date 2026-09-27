import { MoreVertical, Clock, Edit } from 'lucide-react';
import { Note } from '@/types/note';
import { format } from 'date-fns';
import { useMemo } from 'react';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onMenuClick: (e: React.MouseEvent) => void;
  viewMode: 'grid' | 'list';
}

// Helper function to strip HTML tags and get plain text preview
function getPlainTextPreview(content: string): string {
  if (!content) return 'No content';

  // Truncate base64 image strings for display
  if (content.startsWith('data:image')) {
    return content.slice(0, 26) + '...';
  }
  
  // Create a temporary div to parse HTML
  const div = document.createElement('div');
  div.innerHTML = content;
  
  // Get text content
  const text = div.textContent || div.innerText || '';
  
  return text.trim() || 'No content';
}

export default function NoteCard({ note, onClick, onMenuClick, viewMode }: NoteCardProps) {
  const isDrawing = note.type === 'drawing';
  
  // Get plain text preview for rich text content
  const contentPreview = useMemo(() => getPlainTextPreview(note.content), [note.content]);

  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className="relative p-4 rounded-xl cursor-pointer transition-all hover:shadow-md group flex items-center gap-4"
        style={{ backgroundColor: note.color }}
      >
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{note.title || 'Untitled'}</h3>
            </div>
            {isDrawing && <Edit className="w-4 h-4 text-gray-600 flex-shrink-0" />}
          </div>
          <p className="text-sm text-gray-700 line-clamp-1 mb-2">
            {contentPreview}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Clock className="w-3.5 h-3.5" />
            <span>{format(note.timestamp, 'hh:mm a, EEEE')}</span>
          </div>
        </div>
        <button
          onClick={onMenuClick}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <MoreVertical className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="relative p-6 rounded-xl cursor-pointer transition-all hover:shadow-md group"
      style={{ backgroundColor: note.color }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{note.title || 'Untitled'}</h3>
        </div>
        <div className="flex items-center gap-1">
          {isDrawing && <Edit className="w-4 h-4 text-gray-600" />}
          <button
            onClick={onMenuClick}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-black/5 transition-colors opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <MoreVertical className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-700 line-clamp-3 mb-4">
        {contentPreview}
      </p>
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <Clock className="w-3.5 h-3.5" />
        <span>{format(note.timestamp, 'hh:mm a, EEEE')}</span>
      </div>
    </div>
  );
}
