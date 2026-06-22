import { db } from "./index";
import type { Chapter } from "@/types";

export async function getChaptersByTextbook(
  textbookId: string
): Promise<Chapter[]> {
  return db.chapters
    .where({ textbookId })
    .sortBy("order");
}

export async function getChapterById(id: string): Promise<Chapter | undefined> {
  return db.chapters.get(id);
}

export async function createChapter(
  data: Omit<Chapter, "createdAt" | "updatedAt">
): Promise<string> {
  const now = Date.now();
  await db.chapters.add({ ...data, createdAt: now, updatedAt: now });
  return data.id;
}

export async function bulkCreateChapters(
  chapters: Omit<Chapter, "createdAt" | "updatedAt">[]
): Promise<void> {
  const now = Date.now();
  await db.chapters.bulkAdd(
    chapters.map((ch) => ({ ...ch, createdAt: now, updatedAt: now }))
  );
}

export async function updateChapter(
  id: string,
  changes: Partial<Chapter>
): Promise<void> {
  await db.chapters.update(id, { ...changes, updatedAt: Date.now() });
}

export async function deleteChaptersByTextbook(
  textbookId: string
): Promise<void> {
  await db.chapters.where({ textbookId }).delete();
}
