import { useState, useEffect, useMemo } from "react";
import { Task, TaskStatus, TaskPriority } from "@/types/note";
import { storage } from "@/lib/storage";
import {
  Plus,
  CheckCircle2,
  Clock,
  ListTodo,
  TrendingUp,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  BarChart3,
  Calendar,
  Target,
  Flame,
  Award,
  History,
  PieChart,
  AlertCircle,
  Zap,
} from "lucide-react";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  isWithinInterval,
  parseISO,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";

type DashboardTab = "today" | "analytics" | "history";

export default function DailyTaskDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>("medium");
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<DashboardTab>("today");

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const today = new Date();

  useEffect(() => {
    setTasks(storage.getTasks());
  }, []);

  // ============================================
  // TODAY'S DATA
  // ============================================
  const todayTasks = useMemo(
    () => tasks.filter((t) => t.date === todayStr),
    [tasks, todayStr]
  );

  const sortedTodayTasks = useMemo(() => {
    const priorityOrder: Record<TaskPriority, number> = {
      high: 0,
      medium: 1,
      low: 2,
    };
    const active = todayTasks
      .filter((t) => t.status !== "completed")
      .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    const completed = todayTasks.filter((t) => t.status === "completed");
    return [...active, ...completed];
  }, [todayTasks]);

  const totalTasks = todayTasks.length;
  const completedTasks = todayTasks.filter((t) => t.status === "completed").length;
  const inProgressTasks = todayTasks.filter((t) => t.status === "in-progress").length;
  const pendingTasks = todayTasks.filter((t) => t.status === "pending").length;
  const completionPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // ============================================
  // WEEKLY DATA
  // ============================================
  const weeklyData = useMemo(() => {
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const weekTasks = tasks.filter((t) => {
      const taskDate = parseISO(t.date);
      return isWithinInterval(taskDate, { start: weekStart, end: weekEnd });
    });
    const completed = weekTasks.filter((t) => t.status === "completed").length;
    const pending = weekTasks.filter((t) => t.status !== "completed").length;
    const total = weekTasks.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const dailyBreakdown = days.map((day) => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayTasks = tasks.filter((t) => t.date === dayStr);
      const dayCompleted = dayTasks.filter((t) => t.status === "completed").length;
      return {
        date: day,
        label: format(day, "EEE"),
        total: dayTasks.length,
        completed: dayCompleted,
        isToday: isSameDay(day, today),
      };
    });

    return { total, completed, pending, completionRate, dailyBreakdown, weekStart, weekEnd };
  }, [tasks, today]);

  // ============================================
  // MONTHLY DATA
  // ============================================
  const monthlyData = useMemo(() => {
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);
    const monthTasks = tasks.filter((t) => {
      const taskDate = parseISO(t.date);
      return isWithinInterval(taskDate, { start: monthStart, end: monthEnd });
    });
    const completed = monthTasks.filter((t) => t.status === "completed").length;
    const missed = monthTasks.filter(
      (t) => t.status !== "completed" && parseISO(t.date) < today
    ).length;
    const total = monthTasks.length;
    const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, missed, productivity, monthStart };
  }, [tasks, today]);

  // ============================================
  // PRIORITY BREAKDOWN
  // ============================================
  const priorityBreakdown = useMemo(() => {
    const high = tasks.filter((t) => t.priority === "high");
    const medium = tasks.filter((t) => t.priority === "medium");
    const low = tasks.filter((t) => t.priority === "low");
    return {
      high: { total: high.length, completed: high.filter((t) => t.status === "completed").length },
      medium: { total: medium.length, completed: medium.filter((t) => t.status === "completed").length },
      low: { total: low.length, completed: low.filter((t) => t.status === "completed").length },
    };
  }, [tasks]);

  // ============================================
  // TOP / MOST COMPLETED TASKS
  // ============================================
  const topCompletedTasks = useMemo(() => {
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
    const weekCompleted = tasks.filter(
      (t) =>
        t.status === "completed" &&
        isWithinInterval(parseISO(t.date), { start: weekStart, end: weekEnd })
    );
    const titleCount: Record<string, number> = {};
    weekCompleted.forEach((t) => {
      const normalized = t.title.trim().toLowerCase();
      titleCount[normalized] = (titleCount[normalized] || 0) + 1;
    });
    return Object.entries(titleCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([title, count]) => ({ title, count }));
  }, [tasks, today]);

  // ============================================
  // HISTORY (grouped by date, excluding today)
  // ============================================
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    tasks.forEach((t) => {
      if (t.date !== todayStr) {
        if (!grouped[t.date]) grouped[t.date] = [];
        grouped[t.date].push(t);
      }
    });
    return Object.entries(grouped).sort(
      ([a], [b]) => new Date(b).getTime() - new Date(a).getTime()
    );
  }, [tasks, todayStr]);

  // ============================================
  // STREAK CALCULATION
  // ============================================
  const currentStreak = useMemo(() => {
    let streak = 0;
    let checkDate = subDays(today, 1);
    while (true) {
      const dateStr = format(checkDate, "yyyy-MM-dd");
      const dayTasks = tasks.filter((t) => t.date === dateStr);
      if (dayTasks.length === 0) break;
      const allCompleted = dayTasks.every((t) => t.status === "completed");
      if (!allCompleted) break;
      streak++;
      checkDate = subDays(checkDate, 1);
    }
    if (todayTasks.length > 0 && todayTasks.every((t) => t.status === "completed")) {
      streak++;
    }
    return streak;
  }, [tasks, today, todayTasks, todayStr]);

  // ============================================
  // HANDLERS
  // ============================================
  const refreshTasks = () => setTasks(storage.getTasks());

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      status: "pending",
      priority: newTaskPriority,
      date: todayStr,
      createdAt: new Date().toISOString(),
    };
    storage.saveTask(task);
    setNewTaskTitle("");
    setNewTaskPriority("medium");
    setShowAddForm(false);
    refreshTasks();
  };

  const handleToggleComplete = (task: Task) => {
    const updatedTask: Task = {
      ...task,
      status: task.status === "completed" ? "pending" : "completed",
    };
    storage.saveTask(updatedTask);
    refreshTasks();
  };

  const handleStatusCycle = (task: Task) => {
    const statusOrder: TaskStatus[] = ["pending", "in-progress", "completed"];
    const currentIndex = statusOrder.indexOf(task.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    storage.saveTask({ ...task, status: nextStatus });
    refreshTasks();
  };

  const handlePriorityCycle = (task: Task) => {
    const priorityOrder: TaskPriority[] = ["low", "medium", "high"];
    const currentIndex = priorityOrder.indexOf(task.priority);
    const nextPriority = priorityOrder[(currentIndex + 1) % priorityOrder.length];
    storage.saveTask({ ...task, priority: nextPriority });
    refreshTasks();
  };

  const handleDeleteTask = (taskId: string) => {
    storage.deleteTask(taskId);
    refreshTasks();
  };

  const toggleDateExpand = (date: string) => {
    setExpandedDates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(date)) newSet.delete(date);
      else newSet.add(date);
      return newSet;
    });
  };

  // ============================================
  // CONFIGS
  // ============================================
  const statusConfig: Record<
    TaskStatus,
    { label: string; color: string; bg: string; dot: string }
  > = {
    pending: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50", dot: "bg-amber-400" },
    "in-progress": { label: "In Progress", color: "text-blue-600", bg: "bg-blue-50", dot: "bg-blue-400" },
    completed: { label: "Completed", color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-400" },
  };

  const priorityConfig: Record<
    TaskPriority,
    { label: string; color: string; bg: string; border: string; icon: string }
  > = {
    high: { label: "High", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: "🔴" },
    medium: { label: "Medium", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", icon: "🟡" },
    low: { label: "Low", color: "text-green-600", bg: "bg-green-50", border: "border-green-200", icon: "🟢" },
  };

  // ============================================
  // PROGRESS BAR COMPONENT
  // ============================================
  const ProgressBar = ({
    value,
    max,
    color = "from-indigo-500 to-indigo-400",
    height = "h-2",
  }: {
    value: number;
    max: number;
    color?: string;
    height?: string;
  }) => {
    const percent = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
      <div className={`w-full ${height} bg-gray-100 rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    );
  };

  // ============================================
  // CIRCULAR PROGRESS COMPONENT
  // ============================================
  const CircularProgress = ({
    value,
    size = 80,
    strokeWidth = 6,
    color = "#4F46E5",
    bgColor = "#E5E7EB",
  }: {
    value: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    bgColor?: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;
    return (
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
    );
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="space-y-4">
      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                <ListTodo className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Daily Tasks
                </h2>
                <p className="text-xs text-gray-500">
                  {format(new Date(), "EEEE, MMMM d")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Streak Badge */}
              {currentStreak > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200">
                  <Flame className="w-3.5 h-3.5 text-orange-500" />
                  <span className="text-xs font-semibold text-orange-600">{currentStreak}</span>
                </div>
              )}
              {activeTab === "today" && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Task
                </button>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-5">
            {[
              { id: "today" as DashboardTab, label: "Today", icon: Target },
              { id: "analytics" as DashboardTab, label: "Analytics", icon: BarChart3 },
              { id: "history" as DashboardTab, label: "History", icon: History },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* ======== TODAY TAB ======== */}
          {activeTab === "today" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-3 mb-5">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-3 border border-blue-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ListTodo className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[11px] font-medium text-blue-600">Total</span>
                  </div>
                  <p className="text-xl font-bold text-blue-700">{totalTasks}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl p-3 border border-amber-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[11px] font-medium text-amber-600">Active</span>
                  </div>
                  <p className="text-xl font-bold text-amber-700">{inProgressTasks}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-3 border border-orange-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-[11px] font-medium text-orange-600">Pending</span>
                  </div>
                  <p className="text-xl font-bold text-orange-700">{pendingTasks}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-3 border border-emerald-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-[11px] font-medium text-emerald-600">Done</span>
                  </div>
                  <p className="text-xl font-bold text-emerald-700">{completedTasks}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-medium text-gray-700">Today's Progress</span>
                  </div>
                  <span className="text-xs font-semibold text-indigo-600">{completionPercent}%</span>
                </div>
                <ProgressBar value={completedTasks} max={totalTasks} />
                <p className="text-xs text-gray-500 mt-1.5">
                  {completedTasks} of {totalTasks} tasks completed today
                </p>
              </div>
            </>
          )}

          {/* ======== ANALYTICS TAB ======== */}
          {activeTab === "analytics" && (
            <div className="space-y-5">
              {/* Weekly Report */}
              <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/30 rounded-xl p-4 border border-indigo-100">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-gray-800">Week Summary</h3>
                  <span className="text-[10px] text-gray-400 ml-auto">
                    {format(weeklyData.weekStart, "MMM d")} - {format(weeklyData.weekEnd, "MMM d")}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-800">{weeklyData.total}</p>
                    <p className="text-[10px] text-gray-500">Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-600">{weeklyData.completed}</p>
                    <p className="text-[10px] text-gray-500">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-amber-600">{weeklyData.pending}</p>
                    <p className="text-[10px] text-gray-500">Pending</p>
                  </div>
                  <div className="text-center">
                    <div className="relative inline-flex items-center justify-center">
                      <CircularProgress value={weeklyData.completionRate} size={48} strokeWidth={4} />
                      <span className="absolute text-[10px] font-bold text-indigo-600">
                        {weeklyData.completionRate}%
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">Rate</p>
                  </div>
                </div>

                {/* Daily Bar Chart */}
                <div className="flex items-end gap-2 h-24 px-1">
                  {weeklyData.dailyBreakdown.map((day, i) => {
                    const maxVal = Math.max(...weeklyData.dailyBreakdown.map(d => d.total), 1);
                    const maxHeight = 72;
                    const barHeight = day.total > 0 ? Math.max(8, (day.completed / Math.max(day.total, 1)) * maxHeight) : 4;
                    const totalBarHeight = day.total > 0 ? Math.max(12, (day.total / maxVal) * maxHeight) : 4;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="relative w-full flex flex-col items-center" style={{ height: maxHeight }}>
                          <div className="absolute bottom-0 w-full flex flex-col items-center">
                            <div
                              className="w-5 bg-gray-200 rounded-t-sm"
                              style={{ height: totalBarHeight }}
                            />
                            <div
                              className={`w-5 rounded-t-sm absolute bottom-0 ${
                                day.isToday ? "bg-indigo-500" : "bg-indigo-300"
                              }`}
                              style={{ height: barHeight }}
                            />
                          </div>
                        </div>
                        <span
                          className={`text-[10px] ${
                            day.isToday ? "font-bold text-indigo-600" : "text-gray-400"
                          }`}
                        >
                          {day.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 mt-2 justify-center">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm bg-gray-200" />
                    <span className="text-[10px] text-gray-400">Total</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-sm bg-indigo-400" />
                    <span className="text-[10px] text-gray-400">Completed</span>
                  </div>
                </div>
              </div>

              {/* Monthly Report */}
              <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 rounded-xl p-4 border border-emerald-100">
                <div className="flex items-center gap-2 mb-3">
                  <PieChart className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-gray-800">Month Summary</h3>
                  <span className="text-[10px] text-gray-400 ml-auto">
                    {format(monthlyData.monthStart, "MMMM yyyy")}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/70 rounded-lg p-3 border border-emerald-100/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-800">{monthlyData.total}</p>
                        <p className="text-[11px] text-gray-500">Total Tasks</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <ListTodo className="w-5 h-5 text-blue-500" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3 border border-emerald-100/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-emerald-600">{monthlyData.completed}</p>
                        <p className="text-[11px] text-gray-500">Completed</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3 border border-emerald-100/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-red-500">{monthlyData.missed}</p>
                        <p className="text-[11px] text-gray-500">Missed</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                        <X className="w-5 h-5 text-red-500" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-white/70 rounded-lg p-3 border border-emerald-100/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-indigo-600">{monthlyData.productivity}%</p>
                        <p className="text-[11px] text-gray-500">Productivity</p>
                      </div>
                      <div className="relative">
                        <CircularProgress
                          value={monthlyData.productivity}
                          size={40}
                          strokeWidth={4}
                          color="#10B981"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Priority Breakdown */}
              <div className="bg-gradient-to-br from-orange-50/50 to-rose-50/30 rounded-xl p-4 border border-orange-100">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-orange-600" />
                  <h3 className="text-sm font-semibold text-gray-800">Priority Breakdown</h3>
                </div>
                <div className="space-y-3">
                  {(["high", "medium", "low"] as TaskPriority[]).map((priority) => {
                    const data = priorityBreakdown[priority];
                    const config = priorityConfig[priority];
                    const percent = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
                    const colorMap: Record<TaskPriority, string> = {
                      high: "from-red-500 to-red-400",
                      medium: "from-orange-500 to-orange-400",
                      low: "from-green-500 to-green-400",
                    };
                    return (
                      <div key={priority}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs">{config.icon}</span>
                            <span className="text-xs font-medium text-gray-700">{config.label} Priority</span>
                          </div>
                          <span className="text-[11px] text-gray-500">
                            {data.completed}/{data.total} ({percent}%)
                          </span>
                        </div>
                        <ProgressBar value={data.completed} max={data.total} color={colorMap[priority]} height="h-1.5" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Top Completed Tasks */}
              {topCompletedTasks.length > 0 && (
                <div className="bg-gradient-to-br from-yellow-50/50 to-amber-50/30 rounded-xl p-4 border border-yellow-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <h3 className="text-sm font-semibold text-gray-800">Top Completed This Week</h3>
                  </div>
                  <div className="space-y-2">
                    {topCompletedTasks.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 px-3 py-2 bg-white/70 rounded-lg border border-yellow-100/50"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-yellow-700">
                            {i === 0 ? "🏆" : `#${i + 1}`}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-gray-700 flex-1 capitalize truncate">
                          {item.title}
                        </span>
                        <span className="text-[11px] font-semibold text-yellow-600">
                          ×{item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======== HISTORY TAB ======== */}
          {activeTab === "history" && (
            <div className="space-y-3">
              {tasksByDate.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                    <History className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">No history yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Complete tasks to build your history
                  </p>
                </div>
              ) : (
                tasksByDate.map(([date, dateTasks]) => {
                  const isExpanded = expandedDates.has(date);
                  const dateCompleted = dateTasks.filter((t) => t.status === "completed").length;
                  const dateTotal = dateTasks.length;
                  const datePercent = Math.round((dateCompleted / dateTotal) * 100);
                  const isAllDone = dateCompleted === dateTotal;

                  return (
                    <div key={date} className="border border-gray-100 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleDateExpand(date)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50/80 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isAllDone
                                ? "bg-emerald-100"
                                : datePercent >= 50
                                ? "bg-blue-100"
                                : "bg-amber-100"
                            }`}
                          >
                            {isAllDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-600" />
                            )}
                          </div>
                          <div className="text-left">
                            <span className="text-xs font-semibold text-gray-700 block">
                              {format(new Date(date + "T00:00:00"), "EEEE, MMMM d")}
                            </span>
                            <span className="text-[11px] text-gray-400">
                              {dateCompleted} of {dateTotal} tasks completed
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              isAllDone
                                ? "bg-emerald-100 text-emerald-700"
                                : datePercent >= 50
                                ? "bg-blue-100 text-blue-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {datePercent}%
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </div>
                      </button>
                      {isExpanded && (
                        <div className="px-4 py-2 space-y-1 bg-white">
                          {dateTasks.map((task) => {
                            const isCompleted = task.status === "completed";
                            const pConfig = priorityConfig[task.priority];
                            return (
                              <div
                                key={task.id}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                    isCompleted
                                      ? "bg-emerald-500 border-emerald-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {isCompleted && (
                                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                                      <path
                                        d="M2.5 6L5 8.5L9.5 3.5"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  )}
                                </div>
                                <span
                                  className={`text-xs flex-1 ${
                                    isCompleted ? "line-through text-gray-400" : "text-gray-600"
                                  }`}
                                >
                                  {task.title}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${pConfig.bg} ${pConfig.color}`}>
                                  {pConfig.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* ======== ADD TASK FORM ======== */}
        {showAddForm && activeTab === "today" && (
          <div className="px-6 pb-4">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                  placeholder="What do you need to do today?"
                  className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder:text-gray-400"
                  autoFocus
                />
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewTaskTitle("");
                  }}
                  className="p-1 rounded-md hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-gray-500">Priority:</span>
                  {(["low", "medium", "high"] as TaskPriority[]).map((p) => {
                    const config = priorityConfig[p];
                    return (
                      <button
                        key={p}
                        onClick={() => setNewTaskPriority(p)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                          newTaskPriority === p
                            ? `${config.bg} ${config.color} ${config.border} border`
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        {config.icon} {config.label}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={handleAddTask}
                  disabled={!newTaskTitle.trim()}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-medium transition-colors"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======== TASK LIST (Today Tab) ======== */}
        {activeTab === "today" && (
          <div className="px-6 pb-5">
            {sortedTodayTasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500 font-medium">No tasks for today</p>
                <p className="text-xs text-gray-400 mt-1">Add a task to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedTodayTasks.map((task) => {
                  const isCompleted = task.status === "completed";
                  const sConfig = statusConfig[task.status];
                  const pConfig = priorityConfig[task.priority];
                  return (
                    <div
                      key={task.id}
                      className={`group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                        isCompleted
                          ? "bg-gray-50/80 border-gray-100"
                          : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
                      }`}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => handleToggleComplete(task)}
                        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-gray-300 hover:border-indigo-400"
                        }`}
                      >
                        {isCompleted && (
                          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2.5 6L5 8.5L9.5 3.5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>

                      {/* Task Info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium transition-all duration-200 ${
                            isCompleted ? "line-through text-gray-400" : "text-gray-800"
                          }`}
                        >
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-[11px] text-gray-400">
                            {format(new Date(task.createdAt), "h:mm a")}
                          </p>
                        </div>
                      </div>

                      {/* Priority Badge */}
                      <button
                        onClick={() => handlePriorityCycle(task)}
                        className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors ${pConfig.bg} ${pConfig.color} hover:opacity-80`}
                        title="Click to change priority"
                      >
                        {pConfig.icon}
                      </button>

                      {/* Status Badge */}
                      <button
                        onClick={() => handleStatusCycle(task)}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${sConfig.bg} ${sConfig.color} hover:opacity-80`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${sConfig.dot}`} />
                        {sConfig.label}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-50 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
