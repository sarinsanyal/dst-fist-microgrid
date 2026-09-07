"use client";

import { useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import type { Task } from "@/types/task";
import TaskListView from "./TaskListView";
import CalendarView from "./CalenderView";

export default function TaskBoard({
  initialTasks,
  userId,
}: {
  initialTasks: Task[];
  userId: string;
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [view, setView] = useState<"list" | "calendar">("list");
  const supabase = createClient();

  async function addTask(
    title: string,
    description: string | null,
    frequency: Task["frequency"],
    dueDate: string | null
  ) {
    if (!title.trim()) return;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: title.trim(),
        description: description?.trim() || null,
        frequency,
        due_date: dueDate,
        assigned_to: userId,
        status: "todo",
      })
      .select()
      .single();

    if (!error && data) {
      setTasks((prev) => [...prev, data]);
    } else if (error) {
      console.error("Error creating task:", error.message);
    }
  }

  async function toggleTask(task: Task) {
    const nowCompleted = task.status !== "completed";
    const nextStatus: Task["status"] = nowCompleted ? "completed" : "todo";
    const nextCompletedAt = nowCompleted ? new Date().toISOString() : null;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status: nextStatus,
              completed_at: nextCompletedAt,
            }
          : t
      )
    );

    await supabase
      .from("tasks")
      .update({
        status: nextStatus,
        completed_at: nextCompletedAt,
      })
      .eq("id", task.id);
  }

  async function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await supabase.from("tasks").delete().eq("id", id);
  }

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView("list")}
          className={`text-sm font-semibold px-4 py-2 rounded-lg ${
            view === "list"
              ? "bg-red-primary text-white"
              : "text-ink-soft bg-white border border-ink/10"
          }`}
        >
          List
        </button>
        <button
          onClick={() => setView("calendar")}
          className={`text-sm font-semibold px-4 py-2 rounded-lg ${
            view === "calendar"
              ? "bg-red-primary text-white"
              : "text-ink-soft bg-white border border-ink/10"
          }`}
        >
          Calendar
        </button>
      </div>

      {view === "list" ? (
        <TaskListView
          tasks={tasks}
          onAdd={addTask}
          onToggle={toggleTask}
          onDelete={deleteTask}
        />
      ) : (
        <CalendarView
          tasks={tasks}
          onAdd={addTask}
          onToggle={toggleTask}
          onDelete={deleteTask}
        />
      )}
    </div>
  );
}