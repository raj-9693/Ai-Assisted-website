export type NoteType = 'typed' | 'drawing';

export type NoteBackgroundType = 'solid' | 'grid' | 'gradient' | 'image';

export interface NoteBackground {
  type: NoteBackgroundType;
  value: string; // color code, gradient CSS, or image URL/base64
}

// ============================================
// NOTE MODEL
// ============================================

export interface Note {
  id: string;
  title: string;
  content: string;
  type: NoteType;
  color: string;
  timestamp: Date;
  isPinned?: boolean;
  background?: NoteBackground;
}

export type ViewMode = 'grid' | 'list';

export type DateFilter = 'all' | 'today' | 'week' | 'month';

// ============================================
// TASK MODEL
// ============================================

export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  date: string; // ISO date string (YYYY-MM-DD)
  createdAt: string; // ISO datetime string
}

export interface TaskDaySummary {
  date: string;
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
}

export interface TaskWeekSummary {
  weekStart: string;
  weekEnd: string;
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}

export interface TaskMonthSummary {
  month: string; // YYYY-MM
  total: number;
  completed: number;
  missed: number;
  productivity: number;
}
