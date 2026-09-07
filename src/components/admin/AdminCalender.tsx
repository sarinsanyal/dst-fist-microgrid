"use client";

import { useState, useMemo, Dispatch, SetStateAction } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import { createClient } from "../../../lib/supabase/client";
import type { Task } from "@/types/task";

export default function AdminCalendar({
  tasks,
  setTasks,
}: {
  tasks: Task[];
  setTasks: Dispatch<SetStateAction<Task[]>>;
}) {
  const supabase = createClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>("all");

  const teamMembers = useMemo(() => {
    const map = new Map<string, string>();
    tasks.forEach((t) => {
      if (t.assigned_to) {
        map.set(t.assigned_to, t.profiles?.full_name ?? "Unknown User");
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    if (selectedUserFilter === "all") return tasks;
    return tasks.filter((t) => t.assigned_to === selectedUserFilter);
  }, [tasks, selectedUserFilter]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

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

  async function handleToggleTask(task: Task) {
    const nextStatus = task.status === "completed" ? "todo" : "completed";
    const completedAt = nextStatus === "completed" ? new Date().toISOString() : null;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, status: nextStatus, completed_at: completedAt } : t
      )
    );

    await supabase
      .from("tasks")
      .update({ status: nextStatus, completed_at: completedAt })
      .eq("id", task.id);
  }

  async function handleDeleteTask(taskId: string) {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    await supabase.from("tasks").delete().eq("id", taskId);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-ink/10 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="font-serif text-xl font-bold text-ink">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <div className="flex items-center gap-1 border border-ink/10 rounded-lg p-0.5 bg-slate-50">
            <button
              onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
              className="px-2.5 py-1 text-xs text-ink-soft hover:text-ink font-medium rounded hover:bg-white"
            >
              ← Prev
            </button>
            <button
              onClick={() => setCurrentMonth(new Date())}
              className="px-2.5 py-1 text-xs text-ink-soft hover:text-ink font-medium rounded hover:bg-white"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
              className="px-2.5 py-1 text-xs text-ink-soft hover:text-ink font-medium rounded hover:bg-white"
            >
              Next →
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-ink-soft whitespace-nowrap">
            Filter Teammate:
          </label>
          <select
            value={selectedUserFilter}
            onChange={(e) => setSelectedUserFilter(e.target.value)}
            className="border border-ink/10 rounded-lg px-3 py-1.5 text-xs text-ink font-semibold focus:outline-none focus:ring-2 focus:ring-red-primary/40 bg-white min-w-45"
          >
            <option value="all">All Teammates ({tasks.length} tasks)</option>
            {teamMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-ink/10 rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-ink/10 bg-slate-50 text-center text-xs font-semibold text-ink-soft py-2.5">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 divide-x divide-y divide-ink/10 bg-ink/5">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDate[key] ?? [];
            const inMonth = isSameMonth(day, currentMonth);

            return (
              <div
                key={key}
                onClick={() => setSelectedDate(day)}
                className={`bg-white min-h-30 p-2 flex flex-col justify-start cursor-pointer transition-colors hover:bg-red-primary/2 ${
                  !inMonth ? "bg-slate-50/50 opacity-40" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-semibold h-6 w-6 rounded-full flex items-center justify-center ${
                      isToday(day)
                        ? "bg-red-primary text-white"
                        : "text-ink"
                    }`}
                  >
                    {format(day, "d")}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-medium text-ink-soft bg-slate-100 px-1.5 py-0.5 rounded-full">
                      {dayTasks.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 overflow-y-auto max-h-21.25 pr-0.5">
                  {dayTasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className={`text-[11px] p-1.5 rounded-md border flex flex-col gap-0.5 transition-all ${
                        task.status === "completed"
                          ? "bg-slate-50 border-slate-200 text-ink-soft line-through"
                          : "bg-white border-ink/10 text-ink shadow-2xs"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-medium truncate flex-1">
                          {task.title}
                        </span>
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            task.status === "completed"
                              ? "bg-emerald-500"
                              : "bg-amber-500"
                          }`}
                        />
                      </div>

                      {task.profiles?.full_name && (
                        <span className="text-[9px] font-semibold text-red-primary bg-red-primary/10 px-1 py-0.2 rounded w-fit max-w-full truncate">
                          {task.profiles.full_name}
                        </span>
                      )}
                    </div>
                  ))}

                  {dayTasks.length > 3 && (
                    <p className="text-[10px] font-medium text-ink-soft text-center">
                      +{dayTasks.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white border border-ink/10 rounded-xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-ink/10 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-ink">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </h3>
                <p className="text-xs text-ink-soft">
                  {selectedDateTasks.length} task(s) for this day
                </p>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-sm font-semibold text-ink-soft hover:text-ink px-2 py-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {selectedDateTasks.length === 0 ? (
                <p className="text-xs text-ink-soft py-4 text-center italic">
                  No tasks scheduled for this day.
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
                        onChange={() => handleToggleTask(task)}
                        className="mt-0.5 h-4 w-4 accent-red-primary shrink-0"
                      />
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`text-xs font-semibold truncate ${
                              task.status === "completed"
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
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-xs text-ink-soft hover:text-red-primary shrink-0"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="pt-2 border-t border-ink/10 flex justify-end">
              <button
                onClick={() => setSelectedDate(null)}
                className="bg-slate-100 border border-ink/10 text-ink font-semibold text-xs rounded-lg px-4 py-2 hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}