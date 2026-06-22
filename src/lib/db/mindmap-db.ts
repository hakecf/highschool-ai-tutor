import { db } from "./index";
import type { MindMap } from "@/types";

export async function getMindMapByTextbook(
  textbookId: string,
  chapterId?: string
): Promise<MindMap | undefined> {
  const collection = chapterId
    ? db.mindMaps.where({ textbookId, chapterId })
    : db.mindMaps.where({ textbookId });
  return collection.first();
}

export async function saveMindMap(
  data: Omit<MindMap, "createdAt" | "updatedAt">
): Promise<string> {
  const now = Date.now();
  const existing = await getMindMapByTextbook(data.textbookId, data.chapterId);
  if (existing) {
    await db.mindMaps.update(existing.id, { data: data.data, updatedAt: now });
    return existing.id;
  }
  await db.mindMaps.add({ ...data, createdAt: now, updatedAt: now });
  return data.id;
}

export async function deleteMindMapsByTextbook(
  textbookId: string
): Promise<void> {
  await db.mindMaps.where({ textbookId }).delete();
}
