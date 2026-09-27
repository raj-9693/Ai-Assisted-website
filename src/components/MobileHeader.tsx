// Breakpoint strategy: visible only below sm (640px) using `flex sm:hidden`
// Layout switching is CSS-only — no window.innerWidth or useIsMobile in render logic.
import { useState, useRef, useEffect } from 'react';
import { Search, X, User, Circle } from 'lucide-react';

interface MobileHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

export default function MobileHeader({ searchQuery, onSearchChange }: MobileHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when search expands
  useEffect(() => {
    if (isSearchOpen) {
      inputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    onSearchChange('');
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 flex sm:hidden h-14 bg-white border-b border-gray-200 items-center px-2"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      {isSearchOpen ? (
        /* Expanded search state */
        <>
          <div className="flex-1 flex items-center gap-2 px-2">
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="search"
              placeholder="Search notes…"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
              aria-label="Search notes"
            />
          </div>
          <button
            onClick={handleCloseSearch}
            aria-label="Cancel search"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-sm font-medium text-indigo-600"
          >
            Cancel
          </button>
        </>
      ) : (
        /* Default state: logo + icons */
        <>
          {/* Logo */}
          <div className="flex items-center gap-2 flex-1 px-2">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center">
              <Circle className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">NotepadX</span>
          </div>

          {/* Actions */}
          <div className="flex items-center">
            <button
              onClick={handleOpenSearch}
              aria-label="Open search"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              aria-label="User profile"
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-600"
            >
              <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            </button>
          </div>
        </>
      )}
    </header>
  );
}
