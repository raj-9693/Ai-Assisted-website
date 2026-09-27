import { Note, Task } from '@/types/note';

const NOTES_KEY = 'mino_notes';
const TASKS_KEY = 'mino_tasks';

// ============================================
// STORAGE API
// ============================================

export const storage = {
  // ========== NOTES ==========
  getNotes: (): Note[] => {
    try {
      const data = localStorage.getItem(NOTES_KEY);
      if (!data) return [];
      const notes = JSON.parse(data);
      return notes.map((rawNote: any): Note => ({
        id: rawNote.id,
        title: rawNote.title || '',
        content: rawNote.content || '',
        type: rawNote.type || 'typed',
        color: rawNote.color || '#FFF4CC',
        timestamp: new Date(rawNote.timestamp),
        isPinned: rawNote.isPinned,
        background: rawNote.background,
      }));
    } catch (error) {
      console.error('Failed to load notes:', error);
      return [];
    }
  },

  saveNote: (note: Note) => {
    try {
      const notes = storage.getNotes();
      const index = notes.findIndex(n => n.id === note.id);
      if (index >= 0) {
        notes[index] = note;
      } else {
        notes.push(note);
      }
      try {
        localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
      } catch (quotaError) {
        // If quota exceeded (common with drawing notes), try saving without large content
        console.warn('localStorage quota exceeded, saving drawing reference only');
        const compressedNotes = notes.map(n =>
          n.type === 'drawing' && n.id !== note.id
            ? { ...n, content: n.content?.substring(0, 100) || '' }
            : n
        );
        localStorage.setItem(NOTES_KEY, JSON.stringify(compressedNotes));
      }
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  },

  deleteNote: (noteId: string) => {
    try {
      const notes = storage.getNotes().filter(n => n.id !== noteId);
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  },

  // ========== TASKS ==========
  getTasks: (): Task[] => {
    try {
      const data = localStorage.getItem(TASKS_KEY);
      if (!data) return [];
      const tasks = JSON.parse(data) as any[];
      // Migrate old tasks that don't have priority
      return tasks.map(t => ({
        ...t,
        priority: t.priority || 'medium',
      })) as Task[];
    } catch (error) {
      console.error('Failed to load tasks:', error);
      return [];
    }
  },

  saveTask: (task: Task) => {
    try {
      const tasks = storage.getTasks();
      const index = tasks.findIndex(t => t.id === task.id);
      if (index >= 0) {
        tasks[index] = task;
      } else {
        tasks.push(task);
      }
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  },

  saveTasks: (tasks: Task[]) => {
    try {
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  },

  deleteTask: (taskId: string) => {
    try {
      const tasks = storage.getTasks().filter(t => t.id !== taskId);
      localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  },
};
