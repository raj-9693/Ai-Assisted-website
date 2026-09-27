import { Folder as FolderIcon, MoreVertical } from 'lucide-react';
import { Folder } from '@/types/note';
import { format } from 'date-fns';

interface FolderCardProps {
  folder: Folder;
  onClick: () => void;
  onMenuClick: (e: React.MouseEvent) => void;
}

export default function FolderCard({ folder, onClick, onMenuClick }: FolderCardProps) {
  return (
    <div
      onClick={onClick}
      className="relative p-6 rounded-xl cursor-pointer transition-all hover:shadow-md group"
      style={{ backgroundColor: folder.color }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-white/40 flex items-center justify-center">
          <FolderIcon className="w-6 h-6 text-gray-700" />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMenuClick(e);
          }}
          className="p-1 rounded-lg hover:bg-white/40 transition-colors opacity-0 group-hover:opacity-100"
        >
          <MoreVertical className="w-5 h-5 text-gray-700" />
        </button>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{folder.name}</h3>
      <p className="text-sm text-gray-600">{format(folder.timestamp, 'MM/dd/yyyy')}</p>
    </div>
  );
}
