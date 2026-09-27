import { Circle, Calendar, Plus, Pin, LayoutDashboard, Home } from 'lucide-react';

interface SidebarProps {
  onNewNote: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  onCalendarClick: () => void;
}

export default function Sidebar({ onNewNote, activeSection, onSectionChange, onCalendarClick }: SidebarProps) {
  const sections: { id: string; label: string; icon: typeof Calendar; onClick?: () => void }[] = [
    { id: 'notes', label: 'Home', icon: Home },
    { id: 'tasks', label: 'Tasks', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendar', icon: Calendar, onClick: onCalendarClick },
    { id: 'pinned', label: 'Pinned', icon: Pin },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col p-6">
      {/* Logo */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
          <Circle className="w-5 h-5 text-white fill-white" />
        </div>
        <span className="text-xl font-semibold text-gray-900">MINO</span>
      </div>

      {/* Add New Button */}
      <button
        onClick={onNewNote}
        className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors mb-6 group"
      >
        <Plus className="w-5 h-5 text-gray-700" />
        <span className="text-sm font-medium text-gray-700">Add new</span>
        <div className="flex gap-1 ml-auto">
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-pink-400" />
          <div className="w-2 h-2 rounded-full bg-blue-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
      </button>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => {
                if (section.onClick) {
                  section.onClick();
                } else {
                  onSectionChange(section.id);
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-150 ease-out ${
                isActive
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <Icon className={`w-5 h-5 transition-colors duration-150 ${isActive ? 'text-blue-600' : ''}`} />
              <span className="text-sm font-medium">{section.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
