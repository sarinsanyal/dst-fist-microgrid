"use client";

import { useState } from "react";

type Task = {
  id: string;
  title: string;
  description: string | null;
  frequency: "daily" | "weekly" | "bi_weekly" | "monthly" | "half-yearly";
  due_date: string | null;
  status: "todo" | "in_progress" | "completed";
  completed_at: string | null;
  created_at: string;
};

type Rollup = {
  user_id: string;
  full_name: string;
  sub_group: string | null;
  total_tasks: number;
  completed_tasks: number;
  pct_complete: number | null;
};

export default function UserProgressList({ rollups }: { rollups: Rollup[] }) {
  const [list, setList] = useState(rollups);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [userTasks, setUserTasks] = useState<Record<string, Task[]>>({});
  const [loadingTasks, setLoadingTasks] = useState<string | null>(null);

  async function handleToggleExpand(userId: string) {
    if (expandedUser === userId) {
      setExpandedUser(null);
      return;
    }

    setExpandedUser(userId);

    // Fetch tasks if not already cached in local state
    if (!userTasks[userId]) {
      setLoadingTasks(userId);
      try {
        const res = await fetch(`/api/admin/user-tasks?userId=${userId}`);
        if (res.ok) {
          const data = await res.json();
          setUserTasks((prev) => ({ ...prev, [userId]: data.tasks }));
        }
      } catch (error) {
        console.error("Failed to load user tasks", error);
      } finally {
        setLoadingTasks(null);
      }
    }
  }

  async function handleRemove(userId: string) {
    if (
      !confirm(
        "Remove this user? This deletes their account and all their tasks."
      )
    )
      return;

    setRemovingId(userId);
    const res = await fetch("/api/admin/remove-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    if (res.ok) {
      setList((prev) => prev.filter((r) => r.user_id !== userId));
    } else {
      alert("Failed to remove user.");
    }
    setRemovingId(null);
  }

  // Format utility for readable timestamps
  function formatDate(dateString: string | null) {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-3">
      {list.map((r) => {
        const isExpanded = expandedUser === r.user_id;
        const tasks = userTasks[r.user_id] || [];

        return (
          <div
            key={r.user_id}
            className="bg-white border border-ink/10 rounded-xl p-4 shadow-sm space-y-3"
          >
            {/* Summary Row */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-sm text-ink">
                  {r.full_name || "Unnamed"}
                </p>
                <p className="text-xs text-ink-soft">
                  {r.sub_group ?? "No group"} · {r.completed_tasks}/
                  {r.total_tasks} done
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-bold text-ink">
                  {r.pct_complete ?? 0}%
                </span>

                <button
                  onClick={() => handleToggleExpand(r.user_id)}
                  className="text-xs text-ink-soft hover:text-ink font-medium px-2.5 py-1 rounded-md bg-ink/5"
                >
                  {isExpanded ? "Hide details" : "View details"}
                </button>

                <button
                  onClick={() => handleRemove(r.user_id)}
                  disabled={removingId === r.user_id}
                  className="text-xs text-ink-soft hover:text-red-primary disabled:opacity-50"
                >
                  {removingId === r.user_id ? "Removing..." : "Remove"}
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 bg-ink/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-primary rounded-full transition-all"
                style={{ width: `${r.pct_complete ?? 0}%` }}
              />
            </div>

            {/* Expanded User Tasks Detail View */}
            {isExpanded && (
              <div className="pt-3 border-t border-ink/10 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-ink uppercase tracking-wider">
                    Full Task Details ({tasks.length})
                  </p>
                </div>

                {loadingTasks === r.user_id ? (
                  <p className="text-xs text-ink-soft italic">
                    Fetching user tasks...
                  </p>
                ) : tasks.length === 0 ? (
                  <p className="text-xs text-ink-soft italic">
                    No issues or tasks found for this user.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-ink/5 rounded-lg p-3.5 text-xs space-y-2 border border-ink/10 flex flex-col justify-between"
                      >
                        {/* Header & Status */}
                        <div className="space-y-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-ink text-sm leading-snug">
                              {task.title}
                            </p>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide shrink-0 ${
                                task.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : task.status === "in_progress"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-gray-200 text-gray-700"
                              }`}
                            >
                              {task.status.replace("_", " ")}
                            </span>
                          </div>

                          {/* Full Description */}
                          {task.description ? (
                            <p className="text-ink/80 whitespace-pre-wrap leading-relaxed">
                              {task.description}
                            </p>
                          ) : (
                            <p className="text-ink-soft/60 italic">
                              No description provided
                            </p>
                          )}
                        </div>

                        {/* Metadata Footer */}
                        <div className="pt-2 border-t border-ink/10 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-ink-soft">
                          <div>
                            <span className="font-medium text-ink">Frequency:</span>{" "}
                            {/* <span className="capitalize">{task.frequency.replace("_", " ")}</span> */}
                          </div>

                          <div>
                            <span className="font-medium text-ink">Due Date:</span>{" "}
                            {task.due_date ? task.due_date : "None"}
                          </div>

                          <div>
                            <span className="font-medium text-ink">Created:</span>{" "}
                            {formatDate(task.created_at)}
                          </div>

                          <div>
                            <span className="font-medium text-ink">Completed:</span>{" "}
                            {formatDate(task.completed_at)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}