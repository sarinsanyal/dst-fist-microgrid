export type Task = {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  frequency: string;
  due_date?: string | null;
  summary_url?: string | null;
  completed_at?: string | null;
  created_at?: string;
  assigned_to?: string | null;
  profiles?: {
    full_name?: string | null;
    avatar_url?: string | null;
  } | null;
};