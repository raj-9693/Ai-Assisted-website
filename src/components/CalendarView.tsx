import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Note } from "@/types/note";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";

interface CalendarViewProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export default function CalendarView({
  isOpen,
  onClose,
  notes,
  selectedDate,
  onSelectDate,
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Get dates that have notes
  const datesWithNotes = useMemo(() => {
    const dateSet = new Set<string>();
    notes.forEach((note) => {
      const noteDate = new Date(note.timestamp);
      const dateKey = format(noteDate, "yyyy-MM-dd");
      dateSet.add(dateKey);
    });
    return dateSet;
  }, [notes]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });

    // Add padding days for the start of the month
    const startDay = getDay(start);
    const paddingDays = Array(startDay).fill(null);

    return [...paddingDays, ...days];
  }, [currentMonth]);

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleDateClick = (date: Date) => {
    onSelectDate(date);
    onClose();
  };

  if (!isOpen) return null;

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        style={{ animation: "fade-in 0.2s ease-out" }}
      />
      {/* Calendar Modal */}
      <div
        className="relative bg-gradient-to-b from-indigo-100 to-white rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl"
        style={{ animation: "scale-in 0.3s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 w-[348px] h-[38px]">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-indigo-600" />
          </button>

          <h2 className="text-xl font-semibold text-gray-800">
            {format(currentMonth, "MMMM yyyy")}
          </h2>

          <button
            onClick={goToNextMonth}
            className="p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-indigo-600" />
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/50 transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const dateKey = format(day, "yyyy-MM-dd");
            const hasNotes = datesWithNotes.has(dateKey);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, today);
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <button
                key={dateKey}
                onClick={() => handleDateClick(day)}
                className={`
                  aspect-square flex items-center justify-center rounded-xl text-sm font-medium
                  transition-all duration-200 relative
                  ${!isCurrentMonth ? "text-gray-300" : "text-gray-700"}
                  ${isToday && !isSelected ? "bg-indigo-100 text-indigo-600" : ""}
                  ${isSelected ? "bg-indigo-500 text-white shadow-lg scale-110" : "hover:bg-white/70"}
                  ${hasNotes && !isSelected ? "bg-indigo-50" : ""}
                `}
              >
                {format(day, "d")}
                {hasNotes && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Has notes</span>
          </div>
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
