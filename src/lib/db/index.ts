import Dexie, { type Table } from "dexie";
import type {
  Textbook,
  Chapter,
  KnowledgePoint,
  MindMap,
  ChatSession,
  ChatMessage,
} from "@/types";

export class LearningAssistantDB extends Dexie {
  textbooks!: Table<Textbook, string>;
  chapters!: Table<Chapter, string>;
  knowledgePoints!: Table<KnowledgePoint, string>;
  mindMaps!: Table<MindMap, string>;
  chatSessions!: Table<ChatSession, string>;
  chatMessages!: Table<ChatMessage, string>;

  constructor() {
    super("LearningAssistantDB");
    this.version(1).stores({
      textbooks:
        "id, subject, status, createdAt",
      chapters:
        "id, textbookId, order, status, [textbookId+order]",
      knowledgePoints:
        "id, textbookId, chapterId, parentId, level, [textbookId+chapterId], [textbookId+level]",
      mindMaps:
        "id, textbookId, chapterId",
      chatSessions:
        "id, textbookId, updatedAt",
      chatMessages:
        "id, sessionId, createdAt, [sessionId+createdAt]",
    });
  }
}

export const db = new LearningAssistantDB();
