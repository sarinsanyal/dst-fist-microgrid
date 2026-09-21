"use client";

import { useState, useMemo, ComponentProps } from "react";
import UserProgressList from "@/components/admin/UserProgressList";
import AdminCalendar from "@/components/admin/AdminCalender";
import AdminUsersTab from "@/components/admin/AdminUsersTab";
import AdminProjectsTab from "@/components/admin/AdminProjectsTab";
import AdminPublicationsTab from "@/components/admin/AdminPublicationsTab";
import AdminOpportunitiesTab from "@/components/admin/AdminOpportunitiesTab";
import AdminNewsTab from "@/components/admin/AdminNewsTab";
import AdminCoursesTab from "@/components/admin/AdminCoursesTab";
import type { Task } from "@/types/task";

type Rollups = ComponentProps<typeof UserProgressList>["rollups"];

type PendingUser = {
  id: string;
  full_name: string;
  email?: string;
  specialties?: string[];
  avatar_url?: string | null;
  created_at?: string;
  groups?: { name: string }[] | null;
};

type TabType =
  | "overview"
  | "calendar"
  | "team"
  | "users"
  | "projects"
  | "publications"
  | "opportunities"
  | "news"
  | "courses";

const TABS: { key: TabType; label: string }[] = [
  { key: "overview", label: "Analytics" },
  { key: "calendar", label: "Calendar" },
  { key: "team", label: "Team Progress" },
  { key: "users", label: "Users" },
  { key: "projects", label: "Projects" },
  { key: "publications", label: "Publications" },
  { key: "opportunities", label: "Opportunities" },
  { key: "news", label: "News" },
  { key: "courses", label: "Courses" },
];

export default function AdminDashboardClient({
  initialTasks,
  rollups,
  pendingUsers,
}: {
  initialTasks: Task[];
  rollups: Rollups;
  pendingUsers: PendingUser[];
}) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const { totalTasks, completionRate, overdue, completedTasks } = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const overdueCount = tasks.filter(
      (t) => t.due_date && t.due_date < today && t.status !== "completed"
    ).length;
    return { totalTasks: total, completedTasks: completed, completionRate: rate, overdue: overdueCount };
  }, [tasks]);

  const approachingDeadlines = useMemo(() => {
    return [...tasks]
      .filter((t) => t.due_date && t.status !== "completed")
      .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1))
      .slice(0, 6);
  }, [tasks]);

  const userWorkloadStats = useMemo(() => {
    const map = new Map<string, { name: string; avatarUrl?: string | null; total: number; completed: number }>();
    tasks.forEach((t) => {
      const name = t.profiles?.full_name ?? "Unassigned";
      const avatarUrl = t.profiles?.avatar_url;
      const current = map.get(name) || { name, avatarUrl, total: 0, completed: 0 };
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
      <div>
        <h1 className="font-serif text-4xl font-bold text-red-primary mb-2">Admin</h1>
        <p className="text-ink-soft">Lab-wide management — tasks, members, and content.</p>
      </div>

      <div className="flex border-b border-ink/10 gap-1 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 px-4 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.key
                ? "border-red-primary text-red-primary"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {tab.label}
            {tab.key === "users" && pendingUsers.length > 0 && (
              <span className="ml-1.5 bg-red-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {pendingUsers.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Kpi label="Total tasks" value={totalTasks} />
            <Kpi label="Completion rate" value={`${completionRate}%`} />
            <Kpi label="Overdue" value={overdue} accent={overdue > 0} />
            <Kpi label="Active users" value={activeUsers} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-ink">Teammate Workload</h3>
                <p className="text-xs text-ink-soft">Total vs completed tasks per member</p>
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
                        <div className="flex justify-between items-center text-xs font-semibold">
                          <div className="flex items-center gap-2">
                            {item.avatarUrl ? (
                              <img src={item.avatarUrl} alt={item.name} className="w-5 h-5 rounded-full object-cover border border-ink/10" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-red-primary/10 text-red-primary font-bold text-[10px] flex items-center justify-center">
                                {item.name[0]?.toUpperCase()}
                              </div>
                            )}
                            <span className="text-ink">{item.name}</span>
                          </div>
                          <span className="text-ink-soft">{item.completed} / {item.total} ({completedPct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                          <div style={{ width: `${widthPct}%` }} className="bg-red-primary/80 h-full rounded-full transition-all duration-500" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-ink">Approaching Deadlines</h3>
                <p className="text-xs text-ink-soft">Upcoming pending tasks by due date</p>
              </div>
              <div className="space-y-3 pt-1 max-h-80 overflow-y-auto pr-1">
                {approachingDeadlines.length === 0 ? (
                  <p className="text-xs text-ink-soft italic">No upcoming deadlines.</p>
                ) : (
                  approachingDeadlines.map((task) => (
                    <div key={task.id} className="border border-ink/10 rounded-lg p-3 bg-slate-50/50 flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-ink truncate">{task.title}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${task.status === "completed" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                            {task.status.replace("_", " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-ink-soft">
                          <span>Due: {task.due_date}</span>
                          {task.summary_url && (
                            <a href={task.summary_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800 font-medium cursor-pointer">
                              Summary
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {task.profiles?.avatar_url ? (
                          <img src={task.profiles.avatar_url} alt={task.profiles.full_name || "User"} className="w-7 h-7 rounded-full object-cover border border-ink/10" />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-red-primary/10 text-red-primary font-bold text-xs flex items-center justify-center border border-red-primary/20">
                            {task.profiles?.full_name ? task.profiles.full_name[0].toUpperCase() : "U"}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif font-bold text-base text-ink">Overall Task Health</h3>
                <p className="text-xs text-ink-soft">Completed, pending, and overdue</p>
              </div>
              <div className="text-xs font-bold text-ink">{completedTasks} of {totalTasks} Completed</div>
            </div>
            <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
              <div style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%` }} className="bg-emerald-500 h-full transition-all duration-500" />
              <div style={{ width: `${totalTasks > 0 ? (overdue / totalTasks) * 100 : 0}%` }} className="bg-red-primary h-full transition-all duration-500" />
            </div>
            <div className="flex gap-6 text-xs font-medium text-ink-soft pt-1">
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span>Completed ({completedTasks})</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-primary" /><span>Overdue ({overdue})</span></div>
              <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-200" /><span>Pending ({Math.max(0, totalTasks - completedTasks - overdue)})</span></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "calendar" && <div className="animate-in fade-in duration-200"><AdminCalendar tasks={tasks} setTasks={setTasks} /></div>}
      {activeTab === "team" && <div className="animate-in fade-in duration-200"><UserProgressList rollups={rollups} /></div>}
      {activeTab === "users" && <div className="animate-in fade-in duration-200"><AdminUsersTab initialPending={pendingUsers} /></div>}
      {activeTab === "projects" && <div className="animate-in fade-in duration-200"><AdminProjectsTab /></div>}
      {activeTab === "publications" && <div className="animate-in fade-in duration-200"><AdminPublicationsTab /></div>}
      {activeTab === "opportunities" && <div className="animate-in fade-in duration-200"><AdminOpportunitiesTab /></div>}
      {activeTab === "news" && <div className="animate-in fade-in duration-200"><AdminNewsTab /></div>}
      {activeTab === "courses" && <div className="animate-in fade-in duration-200"><AdminCoursesTab /></div>}
    </main>
  );
}

function Kpi({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="bg-white border border-ink/10 rounded-xl p-5 shadow-sm">
      <p className="text-xs text-ink-soft mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-red-primary" : "text-ink"}`}>{value}</p>
    </div>
  );
}