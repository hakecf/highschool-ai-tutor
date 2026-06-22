import { db } from "./index";
import type { ChatSession, ChatMessage } from "@/types";

// ── Sessions ──

export async function getAllChatSessions(): Promise<ChatSession[]> {
  return db.chatSessions.orderBy("updatedAt").reverse().toArray();
}

export async function getChatSessionById(
  id: string
): Promise<ChatSession | undefined> {
  return db.chatSessions.get(id);
}

export async function createChatSession(
  data: Omit<ChatSession, "createdAt" | "updatedAt">
): Promise<string> {
  const now = Date.now();
  await db.chatSessions.add({ ...data, createdAt: now, updatedAt: now });
  return data.id;
}

export async function updateChatSession(
  id: string,
  changes: Partial<ChatSession>
): Promise<void> {
  await db.chatSessions.update(id, { ...changes, updatedAt: Date.now() });
}

export async function deleteChatSession(id: string): Promise<void> {
  await db.chatMessages.where({ sessionId: id }).delete();
  await db.chatSessions.delete(id);
}

// ── Messages ──

export async function getMessagesBySession(
  sessionId: string
): Promise<ChatMessage[]> {
  return db.chatMessages
    .where({ sessionId })
    .sortBy("createdAt");
}

export async function addChatMessage(
  data: Omit<ChatMessage, "createdAt">
): Promise<string> {
  await db.chatMessages.add({ ...data, createdAt: Date.now() });
  return data.id;
}

export async function addChatMessages(
  messages: Omit<ChatMessage, "createdAt">[]
): Promise<void> {
  const now = Date.now();
  await db.chatMessages.bulkAdd(
    messages.map((m) => ({ ...m, createdAt: now }))
  );
}
