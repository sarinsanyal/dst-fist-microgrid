"use client";

import { useState } from "react";
import type { Task } from "@/types/task";

type TaskListViewProps = {
  tasks: Task[];
  onAdd: (
    title: string,
    description: string | null,
    frequency: Task["frequency"],
    dueDate: string | null
  ) => Promise<void>;
  onToggle: (task: Task) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSelectTask: (task: Task) => void;
};

export default function TaskListView({
  tasks,
  onAdd,
  onToggle,
  onDelete,
  onSelectTask,
}: TaskListViewProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<Task["frequency"]>("daily");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await onAdd(
      title,
      description.trim() ? description : null,
      frequency,
      dueDate || null
    );

    setTitle("");
    setDescription("");
    setDueDate("");
    setFrequency("daily");
    setIsSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-ink/10 rounded-xl p-5 shadow-sm space-y-3"
      >
        <input
          type="text"
          required
          placeholder="Task title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-ink/10 rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-red-primary/40"
        />

        <textarea
          placeholder="Description / details (optional)..."
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-ink/10 rounded-lg px-3 py-2 text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-red-primary/40 resize-none"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Task["frequency"])}
            className="w-full border border-ink/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40 bg-white"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="bi_weekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
            <option value="half-yearly">Half-yearly</option>
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border border-ink/10 rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-red-primary/40"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="w-full bg-red-primary text-white font-semibold text-sm rounded-lg py-2.5 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? "Adding..." : "Add task"}
        </button>
      </form>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-white border border-ink/10 rounded-xl p-4 shadow-sm flex items-start justify-between gap-3"
          >
            <div className="flex items-start gap-3 flex-1 cursor-pointer" onClick={() => onSelectTask(task)}>
              <input
                type="checkbox"
                checked={task.status === "completed"}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggle(task);
                }}
                className="mt-1 h-4 w-4 rounded border-ink/20 text-red-primary focus:ring-red-primary/40 cursor-pointer"
              />
              <div className="space-y-1">
                <p
                  className={`text-sm font-semibold text-ink ${
                    task.status === "completed" ? "line-through text-ink-soft" : ""
                  }`}
                >
                  {task.title}
                </p>

                {task.description && (
                  <p className="text-xs text-ink-soft whitespace-pre-wrap">
                    {task.description}
                  </p>
                )}

                <div className="flex gap-2 text-[11px] text-ink-soft pt-1">
                  <span className="capitalize bg-ink/5 px-2 py-0.5 rounded">
                    {task.frequency.replace("_", " ")}
                  </span>
                  {task.due_date && (
                    <span className="bg-ink/5 px-2 py-0.5 rounded">
                      Due: {task.due_date}
                    </span>
                  )}
                  {task.summary_url && (
                    <span className="bg-emerald-100 text-emerald-800 font-medium px-2 py-0.5 rounded">
                      📄 Summary Attached
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => onDelete(task.id)}
              className="text-xs text-ink-soft hover:text-red-primary shrink-0 cursor-pointer"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}