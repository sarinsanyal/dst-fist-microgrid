"use client";

import { useState, useMemo, ComponentProps } from "react";
import UserProgressList from "@/components/admin/UserProgressList";
import AdminCalendar from "@/components/admin/AdminCalender";
import type { Task } from "@/types/task";

type Rollups = ComponentProps<typeof UserProgressList>["rollups"];
type TabType = "overview" | "calendar" | "team";

export default function AdminDashboardClient({
  initialTasks,
  rollups,
}: {
  initialTasks: Task[];
  rollups: Rollups;
}) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // States computed live from tasks state
  const { totalTasks, completionRate, overdue, completedTasks } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const overdueCount = tasks.filter(
      (t) => t.due_date && t.due_date < today && t.status !== "completed"
    ).length;

    return {
      totalTasks: total,
      completedTasks: completed,
      completionRate: rate,
      overdue: overdueCount,
    };
  }, [tasks]);

  // Analytics derived for bar graphs
  const frequencyStats = useMemo(() => {
    const counts: Record<string, number> = {
      daily: 0,
      weekly: 0,
      bi_weekly: 0,
      monthly: 0,
      "half-yearly": 0,
    };
    tasks.forEach((t) => {
      if (counts[t.frequency] !== undefined) counts[t.frequency]++;
    });
    const max = Math.max(...Object.values(counts), 1);
    return { counts, max };
  }, [tasks]);

  const userWorkloadStats = useMemo(() => {
    const map = new Map<string, { name: string; total: number; completed: number }>();

    tasks.forEach((t) => {
      const name = t.profiles?.full_name ?? "Unassigned";
      const current = map.get(name) || { name, total: 0, completed: 0 };
      current.total++;
      if (t.status === "completed") current.completed++;
      map.set(name, current);
    });

    const list = Array.from(map.values()).sort((a, b) => b.total - a.total);
    const maxTotal = Math.max(...list.map((u) => u.total), 1);
    return { list, maxTotal };
  }, [tasks]);

  const activeUsers = rollups.length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-12 min-h-screen space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-4xl font-bold text-red-primary mb-2">
          Admin overview
        </h1>
        <p className="text-ink-soft">
          Lab-wide task activity, visual analytics, and schedule.
        </p>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex border-b border-ink/10 gap-1 sm:gap-4">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 cursor-pointer ${
            activeTab === "overview"
              ? "border-red-primary text-red-primary"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          Analytics & Overview
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 cursor-pointer ${
            activeTab === "calendar"
              ? "border-red-primary text-red-primary"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          Big Calendar
        </button>
        <button
          onClick={() => setActiveTab("team")}
          className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 cursor-pointer ${
            activeTab === "team"
              ? "border-red-primary text-red-primary"
              : "border-transparent text-ink-soft hover:text-ink"
          }`}
        >
          Per Person Progress ({activeUsers})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & BAR GRAPHS */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Kpi label="Total tasks" value={totalTasks} />
            <Kpi label="Completion rate" value={`${completionRate}%`} />
            <Kpi label="Overdue" value={overdue} accent={overdue > 0} />
            <Kpi label="Active users" value={activeUsers} />
          </div>

          {/* Bar Chart Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Bar Graph 1: Workload Distribution by Teammate */}
            <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-ink">
                  Teammate Workload
                </h3>
                <p className="text-xs text-ink-soft">
                  Total vs completed tasks assigned to each member
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {userWorkloadStats.list.length === 0 ? (
                  <p className="text-xs text-ink-soft italic">No tasks found.</p>
                ) : (
                  userWorkloadStats.list.map((item) => {
                    const widthPct = Math.round((item.total / userWorkloadStats.maxTotal) * 100);
                    const completedPct = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;

                    return (
                      <div key={item.name} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-ink">{item.name}</span>
                          <span className="text-ink-soft">
                            {item.completed} / {item.total} ({completedPct}%)
                          </span>
                        </div>
                        {/* Bar */}
                        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden flex">
                          <div
                            style={{ width: `${widthPct}%` }}
                            className="bg-red-primary/80 h-full rounded-full transition-all duration-500"
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bar Graph 2: Tasks by Frequency */}
            <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-ink">
                  Task Cadence
                </h3>
                <p className="text-xs text-ink-soft">
                  Distribution of tasks across frequencies
                </p>
              </div>

              <div className="flex items-end justify-between gap-3 h-48 pt-6 pb-2">
                {Object.entries(frequencyStats.counts).map(([freq, count]) => {
                  const heightPct = Math.round((count / frequencyStats.max) * 100);
                  const labels: Record<string, string> = {
                    daily: "Daily",
                    weekly: "Weekly",
                    bi_weekly: "Bi-Weekly",
                    monthly: "Monthly",
                    "half-yearly": "6-Month",
                  };

                  return (
                    <div key={freq} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <span className="text-xs font-bold text-ink">{count}</span>
                      <div className="w-full bg-slate-100 rounded-t-lg h-36 flex items-end overflow-hidden p-1">
                        <div
                          style={{ height: `${heightPct}%` }}
                          className="w-full bg-red-primary rounded-md transition-all duration-500"
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-ink-soft text-center truncate w-full">
                        {labels[freq] ?? freq}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bar Graph 3: Status Breakdown Banner */}
          <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif font-bold text-base text-ink">
                  Overall Task Health
                </h3>
                <p className="text-xs text-ink-soft">Proportion of completed, pending, and overdue tasks</p>
              </div>
              <div className="text-xs font-bold text-ink">
                {completedTasks} of {totalTasks} Completed
              </div>
            </div>

            {/* Segmented Progress Bar */}
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title="Completed"
              />
              <div
                style={{ width: `${totalTasks > 0 ? (overdue / totalTasks) * 100 : 0}%` }}
                className="bg-red-primary h-full transition-all duration-500"
                title="Overdue"
              />
            </div>

            {/* Legend */}
            <div className="flex gap-6 text-xs font-medium text-ink-soft pt-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Completed ({completedTasks})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-primary" />
                <span>Overdue ({overdue})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <span>Pending ({Math.max(0, totalTasks - completedTasks - overdue)})</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BIG CALENDAR */}
      {activeTab === "calendar" && (
        <div className="animate-in fade-in duration-200">
          <AdminCalendar tasks={tasks} setTasks={setTasks} />
        </div>
      )}

      {/* TAB 3: PER PERSON PROGRESS */}
      {activeTab === "team" && (
        <div className="animate-in fade-in duration-200 space-y-4">
          <UserProgressList rollups={rollups} />
        </div>
      )}
    </main>
  );
}

function Kpi({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="bg-white border border-ink/10 rounded-xl p-5 shadow-sm">
      <p className="text-xs text-ink-soft mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-red-primary" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}