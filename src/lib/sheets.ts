// src/lib/sheets.ts
import Papa from "papaparse";
import { NewsItem, Member, Project, Publication, Award, Opportunity } from "@/types/data";

async function fetchSheet<T>(url: string): Promise<T[]> {
  if (!url) return [];

  // Round timestamp to the nearest 10-second block to sync with revalidation
  const tenSecondBlock = Math.floor(Date.now() / 10000) * 10;
  const separator = url.includes("?") ? "&" : "?";
  const cacheBustUrl = `${url}${separator}_t=${tenSecondBlock}`;

  const res = await fetch(cacheBustUrl, {
    next: { revalidate: 10 }, // Revalidate every 10 seconds
  });

  if (!res.ok) {
    console.error(`Failed to fetch sheet: ${url} (${res.status})`);
    return [];
  }

  const csv = await res.text();
  const { data } = Papa.parse<T>(csv, {
    header: true,
    skipEmptyLines: true,
  });
  // console.log(data);
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