export type Task = {
  id: string;
  title: string;
  description: string | null;
  frequency: "daily" | "weekly" | "bi_weekly" | "monthly" | "half-yearly";
  assigned_to: string;
  due_date: string | null;
  status: "todo" | "in_progress" | "completed";
  completed_at: string | null;
  created_at: string;
  summary_url?: string | null; // Add this line
  profiles?: { full_name: string | null } | null; 
};