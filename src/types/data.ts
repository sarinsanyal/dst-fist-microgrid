// types/data.ts

export type Member = {
    id: string;
    full_name: string;
    role: string | null;        // "user" | "admin" — permissions only
    designation: string | null; // "Professor" | "PhD Scholar" | ... — display/grouping
    email: string | null;
    specialties: string[] | null;
    google_scholar: string | null;
    linkedin: string | null;
    avatar_url: string | null;
    sub_group: string | null;
    group_id: string | null;
    status: string | null;
};

export type Project = {
  id: string;
  title: string;
  description?: string;
  status?: string;
  created_by?: string;
  group_id?: string;
  created_at?: string;
  image_url?: string;
  funding_agency?: string;
  grant_amount?: string;
  link?: string;
  project_members?: { profile_id: string }[];
};

export type Publication = {
  id: string;
  title: string;
  authors: string;
  venue?: string | null;
  publication_type: string;
  year?: number | null;
  doi?: string | null;
  url?: string | null;
  created_at?: string;
};

export type Course = {
  id: string;
  title: string;
  description?: string;
  url?: string;
  created_at?: string;
};

export type Opportunity = {
  id: string;
  title: string;
  description?: string;
  type?: string;
  deadline?: string;
  url?: string;
  created_at?: string;
};

export type NewsItem = {
  id: string;
  title: string;
  body?: string;
  published_at?: string;
  created_at?: string;
};