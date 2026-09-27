import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, Check, Palette } from 'lucide-react';
import { Note, NoteBackground } from '@/types/note';
import RichTextEditor from '@/components/RichTextEditor';
import BackgroundThemeSheet from '@/components/BackgroundThemeSheet';

/**
 * Check if a note has meaningful content (non-empty title or body).
 * TipTap can produce empty markup like "<p></p>" so we strip HTML tags.
 */
function isNoteEmpty(note: Note): boolean {
  const titleTrimmed = (note.title ?? '').trim();
  const contentText = (note.content ?? '')
    .replace(/<[^>]*>/g, '')  // strip HTML tags
    .replace(/&nbsp;/g, ' ')  // replace &nbsp;
    .trim();
  return titleTrimmed.length === 0 && contentText.length === 0;
}

interface TypedEditorProps {
  note: Note;
  onSave: (note: Note) => void;
  onClose: () => void;
}

export default function TypedEditor({ note: initialNote, onSave, onClose }: TypedEditorProps) {
  const [note, setNote] = useState(initialNote);
  const [saved, setSaved] = useState(false);
  const [showBackgroundSheet, setShowBackgroundSheet] = useState(false);
  const noteRef = useRef(note);
  
  // Sync note state when initialNote prop changes
  useEffect(() => {
    setNote(initialNote);
  }, [initialNote.id]);
  
  // Keep ref in sync with state
  useEffect(() => {
    noteRef.current = note;
  }, [note]);

  // Auto-save every 2 seconds — only if the note has content
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isNoteEmpty(noteRef.current)) {
        onSave(noteRef.current);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [onSave]);

  // Save on close — only if the note has content
  const handleClose = useCallback(() => {
    if (!isNoteEmpty(noteRef.current)) {
      onSave(noteRef.current);
    }
    onClose();
  }, [onSave, onClose]);

  const handleContentChange = useCallback((content: string) => {
    setNote(prev => ({ ...prev, content }));
  }, []);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNote(prev => ({ ...prev, title: e.target.value }));
  }, []);

  const handleBackgroundChange = useCallback((background: NoteBackground) => {
    setNote(prev => ({ ...prev, background }));
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <button
          onClick={handleClose}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>

        <div className="flex items-center gap-2">
          {/* Background Theme Button */}
          <button
            onClick={() => setShowBackgroundSheet(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Change Background"
          >
            <Palette className="w-5 h-5 text-gray-700" />
          </button>
          
          {saved && (
            <div className="flex items-center gap-2 text-sm text-green-600 animate-in fade-in slide-in-from-right-2">
              <Check className="w-4 h-4" />
              <span>Saved</span>
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="max-w-4xl mx-auto w-full px-8 pt-8">
        <input
          type="text"
          placeholder="Enter title"
          value={note.title}
          onChange={handleTitleChange}
          className="w-full text-4xl font-semibold text-gray-900 placeholder-gray-300 border-none focus:outline-none mb-4"
        />
      </div>

      {/* Rich Text Editor */}
      <div className="flex-1 overflow-hidden max-w-4xl mx-auto w-full">
        <RichTextEditor
          key={note.id}
          content={note.content}
          onChange={handleContentChange}
          placeholder="Start typing..."
          background={note.background}
        />
      </div>

      {/* Background Theme Sheet */}
      <BackgroundThemeSheet
        isOpen={showBackgroundSheet}
        onClose={() => setShowBackgroundSheet(false)}
        currentBackground={note.background}
        onSelectBackground={handleBackgroundChange}
      />
    </div>
  );
}
