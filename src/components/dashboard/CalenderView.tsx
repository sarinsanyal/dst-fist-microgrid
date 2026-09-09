"use client";

import { useState, useMemo } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import type { Task } from "@/types/task";

export default function CalendarView({
  tasks,
  onAdd,
  onToggle,
  onDelete,
  onSelectTask, // 1. Destructure onSelectTask here
}: {
  tasks: Task[];
  onAdd: (
    title: string,
    description: string | null,
    frequency: Task["frequency"],
    dueDate: string | null
  ) => Promise<void> | void;
  onToggle: (task: Task) => void;
  onDelete: (id: string) => void;
  onSelectTask?: (task: Task) => void; // 2. Add prop type definition here
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [userFilter, setUserFilter] = useState<string>("all");

  // Modal form states
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newFrequency, setNewFrequency] = useState<Task["frequency"]>("daily");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract unique team members from tasks
  const teamMembers = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach((t) => {
      if (t.assigned_to) {
        map.set(t.assigned_to, t.profiles?.full_name ?? "Unassigned User");
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [tasks]);

  // Filter tasks by selected user
  const filteredTasks = useMemo(() => {
    if (userFilter === "all") return tasks;
    return tasks.filter((t) => t.assigned_to === userFilter);
  }, [tasks, userFilter]);

  // Generate grid calendar days
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  // Map tasks by date key (yyyy-MM-dd)
  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    filteredTasks.forEach((t) => {
      if (!t.due_date) return;
      map[t.due_date] = map[t.due_date] || [];
      map[t.due_date].push(t);
    });
    return map;
  }, [filteredTasks]);

  const selectedKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const selectedDateTasks = selectedKey ? tasksByDate[selectedKey] ?? [] : [];

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !selectedKey || isSubmitting) return;

    setIsSubmitting(true);
    await onAdd(
      newTitle,
      newDescription.trim() || null,
      newFrequency,
      selectedKey
    );

    setNewTitle("");
    setNewDescription("");
    setNewFrequency("daily");
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-4">
      {/* Admin Controls Header */}
      <div className="bg-white border border-ink/10 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <h2 className="font-serif text-xl font-bold text-ink">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <div className="flex items-center gap-1 border border-ink/10 rounded-lg p-0.5">
            <button
              onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
              className="px-2 py-1 text-xs text-ink-soft hover:text-ink font-medium rounded hover:bg-ink/5 cursor-pointer"
            >
              ← Prev
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-2 py-1 text-xs text-ink-soft hover:text-ink font-medium rounded hover:bg-ink/5 cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
              className="px-2 py-1 text-xs text-ink-soft hover:text-ink font-medium rounded hover:bg-ink/5 cursor-pointer"
            >
              Next →
            </button>
          </div>
        </div>

        {/* User Filter Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-ink-soft whitespace-nowrap">
            Filter User:
          </label>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="border border-ink/10 rounded-lg px-3 py-1.5 text-xs text-ink font-medium focus:outline-none focus:ring-2 focus:ring-red-primary/40 bg-white min-w-40"
          >
            <option value="all">All Team Members ({tasks.length} tasks)</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Big Calendar Grid */}
      <div className="bg-white border border-ink/10 rounded-xl shadow-sm overflow-hidden">
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 border-b border-ink/10 bg-ink/5 text-center text-xs font-semibold text-ink-soft py-2.5">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Day Cells Grid */}
        <div className="grid grid-cols-7 divide-x divide-y divide-ink/10 bg-ink/10">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDate[key] ?? [];
            const inMonth = isSameMonth(day, currentMonth);

            return (
              <div
                key={key}
                onClick={() => setSelectedDate(day)}
                className={`bg-white min-h-30 p-2 flex flex-col justify-start cursor-pointer transition-colors hover:bg-red-primary/2 ${!inMonth ? "bg-slate-50/60 opacity-40" : ""
                  }`}
              >
                {/* Date Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-semibold h-6 w-6 rounded-full flex items-center justify-center ${isToday(day)
                        ? "bg-red-primary text-white"
                        : "text-ink"
                      }`}
                  >
                    {format(day, "d")}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-medium text-ink-soft bg-ink/5 px-1.5 py-0.5 rounded-full">
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                {/* Tasks List inside Day Cell */}
                <div className="space-y-1 overflow-y-auto max-h-21.25 pr-0.5 scrollbar-none">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(task);
                      }}
                      className={`text-[11px] p-1.5 rounded-md border flex flex-col gap-0.5 transition-all ${task.status === "completed"
                          ? "bg-slate-100 border-slate-200 text-ink-soft line-through"
                          : "bg-white border-ink/10 text-ink hover:border-red-primary/40 shadow-2xs"
                        }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-medium truncate flex-1">
                          {task.title}
                        </span>
                        <input
                          type="checkbox"
                          checked={task.status === "completed"}
                          onChange={() => { }} // Handled by parent click
                          className="h-3 w-3 accent-red-primary shrink-0"
                        />
                      </div>

                      {/* User Badge on Task Card */}
                      {task.profiles?.full_name && (
                        <span className="text-[9px] font-semibold text-red-primary/90 bg-red-primary/10 px-1 py-0.2 rounded w-fit max-w-full truncate">
                          {task.profiles.full_name}
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Overflow indicator if more than 3 tasks */}
                  {dayTasks.length > 3 && (
                    <p className="text-[10px] font-medium text-ink-soft text-center pt-0.5">
                      +{dayTasks.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Modal / Details Drawer */}
      {selectedDate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-ink/10 rounded-xl max-w-md w-full p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-ink">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </h3>
                <p className="text-xs text-ink-soft">
                  {selectedDateTasks.length} task(s) scheduled
                </p>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-sm font-semibold text-ink-soft hover:text-ink px-2 py-1 rounded-lg cursor-pointer hover:bg-ink/5"
              >
                ✕
              </button>
            </div>

            {/* Task List for Selected Date */}
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {selectedDateTasks.length === 0 ? (
                <p className="text-xs text-ink-soft py-2 text-center italic">
                  No tasks assigned for this date.
                </p>
              ) : (
                selectedDateTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start justify-between gap-3 border border-ink/10 rounded-lg p-3 bg-slate-50/50"
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={task.status === "completed"}
                        onChange={() => onToggle(task)}
                        className="mt-0.5 h-4 w-4 accent-red-primary shrink-0"
                      />
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-xs font-semibold truncate ${task.status === "completed"
                                ? "line-through text-ink-soft"
                                : "text-ink"
                              }`}
                          >
                            {task.title}
                          </p>
                          {task.profiles?.full_name && (
                            <span className="text-[10px] bg-red-primary/10 text-red-primary font-semibold px-1.5 py-0.5 rounded shrink-0">
                              {task.profiles.full_name}
                            </span>
                          )}
                        </div>
                        {task.description && (
                          <p className="text-[11px] text-ink-soft line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="text-xs text-ink-soft cursor-pointer hover:text-red-primary shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Quick Add Form */}
            <form onSubmit={handleAddTask} className="space-y-3 pt-3 border-t border-ink/10">
              <p className="text-xs font-bold text-ink">Add Task for this Day</p>

              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Task title..."
                className="w-full border border-ink/10 rounded-lg px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40"
              />

              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description / details (optional)..."
                rows={2}
                className="w-full border border-ink/10 rounded-lg px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40 resize-none"
              />

              <select
                value={newFrequency}
                onChange={(e) =>
                  setNewFrequency(e.target.value as Task["frequency"])
                }
                className="w-full border border-ink/10 rounded-lg px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40 bg-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="bi_weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="half-yearly">Half-yearly</option>
              </select>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="flex-1 border border-ink/10 text-ink-soft cursor-pointer font-semibold text-xs rounded-lg py-2 hover:bg-ink/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim()}
                  className="flex-1 bg-red-primary text-white cursor-pointer font-semibold text-xs rounded-lg py-2 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting ? "Adding..." : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}