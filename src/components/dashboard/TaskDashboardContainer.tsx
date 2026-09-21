"use client";

import { useState, useEffect } from "react";
import TaskBoard from "@/components/dashboard/TaskBoard";
import ReportGenerator from "@/components/dashboard/ReportGenerator";
import UserProjectsTab, {
  type DashboardProject,
  type MemberOption,
} from "@/components/dashboard/UserProjectsTab";
import type { Task } from "@/types/task";

type ProfileProps = {
  full_name: string;
  role: string;
  avatar_url: string | null;
  specialties: string[];
  group_name: string | null;
};

type Tab = "tasks" | "projects";

export default function TaskDashboardContainer({
  initialTasks,
  initialProjects,
  memberOptions,
  profile,
  userId,
  isAdmin,
}: {
  initialTasks: Task[];
  initialProjects: DashboardProject[];
  memberOptions: MemberOption[];
  profile: ProfileProps;
  userId: string;
  isAdmin: boolean;
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [tab, setTab] = useState<Tab>("tasks");

  // Keep state synced if server re-renders
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const tabClass = (active: boolean) =>
    `text-sm font-semibold px-4 py-2.5 -mb-px border-b-2 cursor-pointer transition-colors ${
      active
        ? "border-red-primary text-red-primary"
        : "border-transparent text-ink-soft hover:text-ink"
    }`;

  return (
    <div className="space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-2 border-b border-ink/10">
        <button onClick={() => setTab("tasks")} className={tabClass(tab === "tasks")}>
          Tasks
        </button>
        <button
          onClick={() => setTab("projects")}
          className={tabClass(tab === "projects")}
        >
          Projects
        </button>
      </div>

      {/* Tasks tab */}
      <div className={tab === "tasks" ? "space-y-6" : "hidden"}>
        <div className="flex justify-end">
          {/* ReportGenerator receives live state */}
          <ReportGenerator tasks={tasks} profile={profile as any} />
        </div>

        {/* TaskBoard receives current tasks and update handler */}
        <TaskBoard
          initialTasks={tasks}
          userId={userId}
          isAdmin={isAdmin}
          onTasksChange={setTasks}
        />
      </div>

      {/* Projects tab */}
      <div className={tab === "projects" ? "block" : "hidden"}>
        <UserProjectsTab
          initialProjects={initialProjects}
          memberOptions={memberOptions}
          userId={userId}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}