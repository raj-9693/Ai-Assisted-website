import { useState, useEffect } from "react";
import { Note, ViewMode, NoteType, DateFilter } from "@/types/note";
import { storage } from "@/lib/storage";
import { seedSampleData } from "@/lib/seedData";
import Sidebar from "./Sidebar";
import SearchBar from "./SearchBar";
import ViewToggle from "./ViewToggle";
import NoteCard from "./NoteCard";
import FloatingActionButton from "./FloatingActionButton";
import ModeSelector from "./ModeSelector";
import TypedEditor from "./TypedEditor";
import DrawingCanvas from "./DrawingCanvas";
import EmptyState from "./EmptyState";
import NoteOptionsSheet from "./NoteOptionsSheet";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import CalendarView from "./CalendarView";
import DailyTaskDashboard from "./DailyTaskDashboard";
import BottomNav from "./BottomNav";
import MobileHeader from "./MobileHeader";
import { Menu, User, X, Calendar, ArrowLeft } from "lucide-react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

const NOTE_COLORS = ["#FFF4CC", "#E6F0FF", "#E9F7EF", "#FDECEF", "#F1EEFF"];

function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [activeSection, setActiveSection] = useState("notes");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [selectedNoteForOptions, setSelectedNoteForOptions] =
    useState<Note | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  useEffect(() => {
    seedSampleData(); // Seed sample data on first load
    setNotes(storage.getNotes());
  }, []);

  // Filter notes by search query and selected date
  const filteredNotes = notes.filter((note) => {
    // Section filter - show only pinned notes when in pinned section
    if (activeSection === "pinned") {
      return note.isPinned === true;
    }

    // For other sections, exclude pinned notes from normal view
    // (they should only appear in the pinned section)
    if (activeSection === "notes" && note.isPinned) {
      return false;
    }

    // Search filter
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());

    // If calendar date is selected, ignore quick filters
    if (selectedDate) {
      const noteDate = format(new Date(note.timestamp), "yyyy-MM-dd");
      const filterDate = format(selectedDate, "yyyy-MM-dd");
      return matchesSearch && noteDate === filterDate;
    }

    // Quick date filter logic
    if (dateFilter !== "all") {
      const noteDate = new Date(note.timestamp);
      const today = new Date();
      const normalizeDate = (date: Date) => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return normalized;
      };

      switch (dateFilter) {
        case "today": {
          const normalizedNoteDate = format(normalizeDate(noteDate), "yyyy-MM-dd");
          const normalizedToday = format(normalizeDate(today), "yyyy-MM-dd");
          if (normalizedNoteDate !== normalizedToday) return false;
          break;
        }
        case "week": {
          const weekStart = startOfWeek(today, { weekStartsOn: 0 });
          const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
          if (!isWithinInterval(noteDate, { start: weekStart, end: weekEnd })) {
            return false;
          }
          break;
        }
        case "month": {
          const monthStart = startOfMonth(today);
          const monthEnd = endOfMonth(today);
          if (!isWithinInterval(noteDate, { start: monthStart, end: monthEnd })) {
            return false;
          }
          break;
        }
      }
    }

    return matchesSearch;
  });

  const handleCreateNote = (type: NoteType) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "",
      content: "",
      type,
      color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
      timestamp: new Date(),
    };
    setEditingNote(newNote);
    setShowModeSelector(false);
  };

  /**
   * Check if a note has meaningful content (non-empty title or body).
   * TipTap can produce empty markup like "<p></p>" so we strip HTML tags.
   */
  const isNoteEmpty = (note: Note): boolean => {
    const titleTrimmed = (note.title ?? '').trim();
    // Drawing notes: if content is a data URL, it has drawing content
    if (note.type === 'drawing') {
      const hasDrawingContent = (note.content ?? '').startsWith('data:');
      return !hasDrawingContent && titleTrimmed.length === 0;
    }
    const contentText = (note.content ?? '')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();
    return titleTrimmed.length === 0 && contentText.length === 0;
  };

  const handleSaveNote = (note: Note) => {
    // Only save if the note has actual content
    if (isNoteEmpty(note)) return;
    storage.saveNote(note);
    setNotes(storage.getNotes());
  };

  const handleCloseEditor = () => {
    // If the note being edited is empty, remove it from storage (discard)
    if (editingNote) {
      const currentInStorage = storage.getNotes().find(n => n.id === editingNote.id);
      if (currentInStorage && isNoteEmpty(currentInStorage)) {
        storage.deleteNote(currentInStorage.id);
        setNotes(storage.getNotes());
      }
    }
    setEditingNote(null);
  };

  const handleDeleteNote = (note: Note) => {
    setNoteToDelete(note);
    setShowDeleteConfirm(true);
    setSelectedNoteForOptions(null);
  };

  const handlePinNote = (note: Note) => {
    const updatedNote = { ...note, isPinned: !note.isPinned };
    storage.saveNote(updatedNote);
    setNotes(storage.getNotes());
    setSelectedNoteForOptions(null);
  };

  const confirmDeleteNote = () => {
    if (noteToDelete) {
      storage.deleteNote(noteToDelete.id);
      setNotes(storage.getNotes());
      setNoteToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const handleConfirmDelete = () => {
    confirmDeleteNote();
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar — desktop only */}
      <div className="hidden sm:flex flex-shrink-0">
        <Sidebar
          onNewNote={() => setShowModeSelector(true)}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onCalendarClick={() => setShowCalendar(true)}
        />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header — visible below sm breakpoint */}
        <MobileHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

        {/* Desktop search bar — hidden on mobile */}
        <div className="hidden sm:block">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Scrollable content — padded for MobileHeader top + BottomNav bottom */}
        <div className="flex-1 overflow-y-auto pt-14 sm:pt-0 pb-16 sm:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                {(activeSection === "pinned" || activeSection === "tasks") && (
                  <button
                    onClick={() => setActiveSection("notes")}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-700" />
                    <span className="text-sm font-medium text-gray-700">Back</span>
                  </button>
                )}
                <h1 className="text-3xl font-semibold text-gray-900">
                  {activeSection === "pinned" ? "PINNED NOTES" : activeSection === "tasks" ? "DAILY TASKS" : "MY NOTES"}
                </h1>
                {selectedDate && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-600">
                      {format(selectedDate, "MMM d, yyyy")}
                    </span>
                    <button
                      onClick={() => setSelectedDate(null)}
                      className="p-0.5 hover:bg-indigo-100 rounded-full transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-indigo-600" />
                    </button>
                  </div>
                )}
              </div>
              {activeSection !== "tasks" && (
                <div className="flex items-center gap-4">
                  <ViewToggle mode={viewMode} onToggle={setViewMode} />
                  <button className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="text-sm font-medium text-gray-700">Sayef mahmud</span>
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                  </button>
                  <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                    <Menu className="w-6 h-6 text-gray-700" />
                  </button>
                </div>
              )}
            </div>

            {/* Daily Task Dashboard - shown only in tasks section */}
            {activeSection === "tasks" && (
              <section>
                <DailyTaskDashboard />
              </section>
            )}

            {/* My Notes - hidden when in tasks view */}
            {activeSection !== "tasks" && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {activeSection === "pinned" 
                    ? "Pinned Notes" 
                    : selectedDate 
                    ? `Notes for ${format(selectedDate, "MMMM d, yyyy")}` 
                    : "My Notes"}
                </h2>
                {!selectedDate && activeSection === "notes" && (
                  <div className="flex gap-4 text-sm">
                    <button 
                      onClick={() => {
                        setDateFilter("all");
                        setSelectedDate(null);
                      }}
                      className={dateFilter === "all" ? "text-gray-900 font-medium border-b-2 border-gray-900 pb-1" : "text-gray-500 hover:text-gray-700"}
                    >
                      All
                    </button>
                    <button 
                      onClick={() => {
                        setDateFilter("today");
                        setSelectedDate(null);
                      }}
                      className={dateFilter === "today" ? "text-gray-900 font-medium border-b-2 border-gray-900 pb-1" : "text-gray-500 hover:text-gray-700"}
                    >
                      Today
                    </button>
                    <button 
                      onClick={() => {
                        setDateFilter("week");
                        setSelectedDate(null);
                      }}
                      className={dateFilter === "week" ? "text-gray-900 font-medium border-b-2 border-gray-900 pb-1" : "text-gray-500 hover:text-gray-700"}
                    >
                      This Week
                    </button>
                    <button 
                      onClick={() => {
                        setDateFilter("month");
                        setSelectedDate(null);
                      }}
                      className={dateFilter === "month" ? "text-gray-900 font-medium border-b-2 border-gray-900 pb-1" : "text-gray-500 hover:text-gray-700"}
                    >
                      This Month
                    </button>
                  </div>
                )}
              </div>

              {filteredNotes.length === 0 ? (
                <EmptyState
                  title={
                    activeSection === "pinned"
                      ? 'No pinned notes'
                      : selectedDate 
                      ? `No notes for ${format(selectedDate, "MMMM d, yyyy")}` 
                      : searchQuery 
                      ? 'No notes found' 
                      : 'Your notes will appear here'
                  }
                  description={
                    activeSection === "pinned"
                      ? 'Pin notes to keep them here for quick access'
                      : selectedDate
                      ? 'Try selecting a different date or create a new note'
                      : searchQuery
                      ? 'Try a different search query'
                      : 'Click the + button to create your first note'
                  }
                />
              ) : (
                <div
                  className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                      : 'space-y-3'
                  }
                >
                  {filteredNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onClick={() => setEditingNote(note)}
                      onMenuClick={(e) => {
                        e.stopPropagation();
                        setSelectedNoteForOptions(note);
                      }}
                      viewMode={viewMode}
                    />
                  ))}
                  {viewMode === 'grid' && !selectedDate && activeSection === 'notes' && (
                    <div className="hidden sm:block">
                      <div 
                        onClick={() => setShowModeSelector(true)}
                        className="p-6 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all min-h-[200px]"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                          <Menu className="w-6 h-6 text-gray-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-600">New Note</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
            )}
          </div>
        </div>
      </div>

      {activeSection !== "tasks" && (
        <FloatingActionButton onClick={() => setShowModeSelector(true)} />
      )}
      {/* Bottom Navigation — mobile only */}
      <BottomNav
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onCalendarClick={() => setShowCalendar(true)}
      />
      <ModeSelector
        isOpen={showModeSelector}
        onClose={() => setShowModeSelector(false)}
        onSelect={handleCreateNote}
      />
      {editingNote && (() => {
        // Debug log for troubleshooting
        console.log('Opening editor for note:', editingNote);
        
        // Validate note object - ensure it has required fields
        const validatedNote: Note = {
          ...editingNote,
          id: editingNote.id || Date.now().toString(),
          title: editingNote.title ?? "",
          content: editingNote.content ?? "",
          type: editingNote.type || "typed",
          color: editingNote.color || "#FFF4CC",
          timestamp: editingNote.timestamp instanceof Date ? editingNote.timestamp : new Date(editingNote.timestamp || Date.now()),
        };
        
        console.log('Validated note:', validatedNote);
        
        return validatedNote.type === "drawing" ? (
          <DrawingCanvas
            key={`drawing-${validatedNote.id}`}
            note={validatedNote}
            onSave={handleSaveNote}
            onClose={handleCloseEditor}
          />
        ) : (
          <TypedEditor
            key={`typed-${validatedNote.id}`}
            note={validatedNote}
            onSave={handleSaveNote}
            onClose={handleCloseEditor}
          />
        );
      })()}
      {/* Note Options Bottom Sheet */}
      <NoteOptionsSheet
        isOpen={!!selectedNoteForOptions}
        onClose={() => setSelectedNoteForOptions(null)}
        onOpen={() => {
          if (selectedNoteForOptions) {
            setEditingNote(selectedNoteForOptions);
            setSelectedNoteForOptions(null);
          }
        }}
        onDelete={() => {
          if (selectedNoteForOptions) {
            handleDeleteNote(selectedNoteForOptions);
          }
        }}
        onPin={() => {
          if (selectedNoteForOptions) {
            handlePinNote(selectedNoteForOptions);
          }
        }}
        isPinned={selectedNoteForOptions?.isPinned}
      />
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setNoteToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      {/* Calendar View */}
      <CalendarView
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        notes={notes}
        selectedDate={selectedDate || new Date()}
        onSelectDate={(date) => {
          setSelectedDate(date);
          setDateFilter("all"); // Reset quick filter when calendar date selected
          setActiveSection("notes");
        }}
      />
    </div>
  );
}

export default Home;
