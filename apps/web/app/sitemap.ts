import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/pageMetadata";
import { proGearProfiles } from "@/data/pro-gear";

const STATIC_PATHS = [
  "",
  "/gallery",
  "/builder",
  "/pro",
  "/category",
  "/category/pro",
  "/category/meme",
  "/category/practical",
  "/submit",
  "/about",
  "/privacy",
  "/disclosure",
];

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

async function crosshairIds(): Promise<string[]> {
  if (!PROJECT_ID) return [];
  try {
    const res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/crosshairs?pageSize=300`
    );
    if (!res.ok) return [];
    const data: { documents?: { name: string }[] } = await res.json();
    return (data.documents ?? []).map((doc) => doc.name.split("/").pop() as string);
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ids = await crosshairIds();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" || path === "/gallery" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const proEntries: MetadataRoute.Sitemap = proGearProfiles.map((profile) => ({
    url: `${SITE_URL}/pro/${profile.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const crosshairEntries: MetadataRoute.Sitemap = ids.map((id) => ({
    url: `${SITE_URL}/crosshairs/${id}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticEntries, ...proEntries, ...crosshairEntries];
}
