// ---------- Types ----------------------------------
export type NewsItem = {
  date: string;
  headline: string;
  summary: string;
  image_url: string;
  link: string;
  category: string;
};

export type Member = {
  name: string;
  role: string;
  email: string;
  achievements: string;
  google_scholar: string;
  linkedin: string;
  photoUrl: string;
};

export type Project = {
  title: string;
  description: string;
  imageUrl: string;
  status: string;
  link: string;
  funding_agency: string;
  grant_amount: string;
};

export type Publication = {
  title: string;
  authors: string;
  journal: string;
  year: string;
  doi: string;
  url: string;
};

export type Award = {
  title: string;
  recipient: string;
  organization: string;
  year: string;
  description: string; 
};

export type Opportunity = {
  role: string;
  type: string;
  description: string;
  eligibility: string;
  deadline: string;
  apply_link: string;
};