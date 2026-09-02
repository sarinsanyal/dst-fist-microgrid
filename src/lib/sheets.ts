// src/lib/sheets.ts
import Papa from "papaparse";
import { NewsItem, Member, Project, Publication, Award, Opportunity } from "@/types/data";

async function fetchSheet<T>(url: string): Promise<T[]> {
  if (!url) return [];
  const res = await fetch(url, { cache: "no-store" }); // ISR: refetch hourly
  if (!res.ok) {
    console.error(`Failed to fetch sheet: ${url} (${res.status})`);
    return [];
  }
  const csv = await res.text();
  const { data } = Papa.parse<T>(csv, {
    header: true,
    skipEmptyLines: true,
  });
  return data;
}

// ---------- Getters ----------

export const getNews = () =>
  fetchSheet<NewsItem>(process.env.NEXT_PUBLIC_SHEET_NEWS!);

export const getMembers = () =>
  fetchSheet<Member>(process.env.NEXT_PUBLIC_SHEET_MEMBERS!);

export const getProjects = () =>
  fetchSheet<Project>(process.env.NEXT_PUBLIC_SHEET_PROJECTS!);

export const getPublications = () =>
  fetchSheet<Publication>(process.env.NEXT_PUBLIC_SHEET_PUBLICATIONS!);

export const getAwards = () =>
  fetchSheet<Award>(process.env.NEXT_PUBLIC_SHEET_AWARDS!);

export const getOpportunities = () =>
  fetchSheet<Opportunity>(process.env.NEXT_PUBLIC_SHEET_OPPORTUNITIES!);