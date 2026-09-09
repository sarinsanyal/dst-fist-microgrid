"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../../lib/supabase/client";
import type { Task } from "@/types/task";
import TaskListView from "./TaskListView";
import CalendarView from "./CalenderView";
import TaskModal from "./TaskModal";

type TaskBoardProps = {
  initialTasks: Task[];
  userId: string;
  isAdmin?: boolean;
  onTasksChange?: (tasks: Task[]) => void;
};

export default function TaskBoard({
  initialTasks,
  userId,
  isAdmin = false,
  onTasksChange,
}: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const supabase = createClient();

  // Keep local state updated if server props re-evaluate
  // useEffect(() => {
  //   setTasks(initialTasks);
  // }, [initialTasks]);

  // Safely updates local state and notifies parent without triggering render-phase warnings
  function updateTaskList(nextTasks: Task[]) {
    setTasks(nextTasks);
    onTasksChange?.(nextTasks);
  }

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
      .select("*, profiles:assigned_to(full_name)")
      .single();

    if (!error && data) {
      updateTaskList([...tasks, data]);
    } else if (error) {
      console.error("Error creating task:", error.message);
    }
  }

  async function toggleTask(task: Task) {
    const nowCompleted = task.status !== "completed";
    const nextStatus: Task["status"] = nowCompleted ? "completed" : "todo";
    const nextCompletedAt = nowCompleted ? new Date().toISOString() : null;

    const nextTasks = tasks.map((t) =>
      t.id === task.id
        ? { ...t, status: nextStatus, completed_at: nextCompletedAt }
        : t
    );

    updateTaskList(nextTasks);

    await supabase
      .from("tasks")
      .update({ status: nextStatus, completed_at: nextCompletedAt })
      .eq("id", task.id);
  }

  async function deleteTask(id: string) {
    const nextTasks = tasks.filter((t) => t.id !== id);
    updateTaskList(nextTasks);

    await supabase.from("tasks").delete().eq("id", id);
  }

  function handleUpdateTask(updatedTask: Task) {
    const nextTasks = tasks.map((t) =>
      t.id === updatedTask.id ? updatedTask : t
    );
    updateTaskList(nextTasks);
    setSelectedTask(updatedTask);
  }

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView("list")}
          className={`text-sm font-semibold px-4 py-2 rounded-lg cursor-pointer ${
            view === "list"
              ? "bg-red-primary text-white"
              : "text-ink-soft bg-white border border-ink/10"
          }`}
        >
          List
        </button>
        <button
          onClick={() => setView("calendar")}
          className={`text-sm cursor-pointer font-semibold px-4 py-2 rounded-lg ${
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
          onSelectTask={(task) => setSelectedTask(task)}
        />
      ) : (
        <CalendarView
          tasks={tasks}
          onAdd={addTask}
          onToggle={toggleTask}
          onDelete={deleteTask}
          onSelectTask={(task) => setSelectedTask(task)}
        />
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
        />
      )}
    </div>
  );
}