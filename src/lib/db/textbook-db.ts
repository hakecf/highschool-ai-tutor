import { db } from "./index";
import type { Textbook } from "@/types";

export async function getAllTextbooks(): Promise<Textbook[]> {
  return db.textbooks.orderBy("createdAt").reverse().toArray();
}

export async function getTextbookById(id: string): Promise<Textbook | undefined> {
  return db.textbooks.get(id);
}

export async function createTextbook(data: Omit<Textbook, "createdAt" | "updatedAt">): Promise<string> {
  const now = Date.now();
  await db.textbooks.add({
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return data.id;
}

export async function updateTextbook(
  id: string,
  changes: Partial<Textbook>
): Promise<void> {
  await db.textbooks.update(id, { ...changes, updatedAt: Date.now() });
}

export async function deleteTextbook(id: string): Promise<void> {
  // 级联删除关联数据
  await db.chapters.where({ textbookId: id }).delete();
  await db.knowledgePoints.where({ textbookId: id }).delete();
  await db.mindMaps.where({ textbookId: id }).delete();
  await db.textbooks.delete(id);
}

export async function getTextbooksBySubject(
  subject: Textbook["subject"]
): Promise<Textbook[]> {
  return db.textbooks.where({ subject }).toArray();
}
