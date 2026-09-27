// Breakpoint strategy: visible only below sm (640px) using `flex sm:hidden`
// Layout switching is CSS-only — no window.innerWidth or useIsMobile in render logic.
import { Home, LayoutDashboard, Pin, Calendar } from 'lucide-react';

interface BottomNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onCalendarClick: () => void;
}

const navItems = [
  { id: 'notes', label: 'Home', Icon: Home },
  { id: 'tasks', label: 'Tasks', Icon: LayoutDashboard },
  { id: 'pinned', label: 'Pinned', Icon: Pin },
  { id: 'calendar', label: 'Calendar', Icon: Calendar },
];

export default function BottomNav({ activeSection, onSectionChange, onCalendarClick }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex sm:hidden bg-white border-t border-gray-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {navItems.map(({ id, label, Icon }) => {
        const isActive = activeSection === id;
        const handleClick = () => {
          if (id === 'calendar') {
            onCalendarClick();
          } else {
            onSectionChange(id);
          }
        };

        return (
          <button
            key={id}
            onClick={handleClick}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            className={`min-h-[56px] flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors ${
              isActive ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon
              className="w-5 h-5"
              strokeWidth={isActive ? 2.5 : 1.75}
              style={isActive ? { fill: 'currentColor', fillOpacity: 0.15 } : undefined}
            />
            <span className="text-[10px] font-medium leading-none">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
