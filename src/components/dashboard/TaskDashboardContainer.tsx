"use client";

import { useState, useEffect } from "react";
import TaskBoard from "@/components/dashboard/TaskBoard";
import ReportGenerator from "@/components/dashboard/ReportGenerator";
import type { Task } from "@/types/task";

type ProfileProps = {
  full_name: string;
  role: string;
  avatar_url: string | null;
  specialties: string[];
  group_name: string | null;
};

export default function TaskDashboardContainer({
  initialTasks,
  profile,
  userId,
  isAdmin,
}: {
  initialTasks: Task[];
  profile: ProfileProps;
  userId: string;
  isAdmin: boolean;
}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Keep state synced if server re-renders
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  return (
    <div className="space-y-6">
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
  );
}