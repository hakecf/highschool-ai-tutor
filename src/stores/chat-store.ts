import { create } from "zustand";
import type { ChatSession, ChatMessage } from "@/types";
import * as chatDB from "@/lib/db/chat-db";

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;

  // Actions
  loadSessions: () => Promise<void>;
  createSession: (data: Omit<ChatSession, "createdAt" | "updatedAt">) => Promise<string>;
  deleteSession: (id: string) => Promise<void>;
  setCurrentSession: (id: string | null) => void;
  loadMessages: (sessionId: string) => Promise<void>;
  addMessage: (msg: ChatMessage) => void;
  appendToLastMessage: (text: string) => void;
  setStreaming: (streaming: boolean) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  messages: [],
  isStreaming: false,

  loadSessions: async () => {
    const sessions = await chatDB.getAllChatSessions();
    set({ sessions });
  },

  createSession: async (data) => {
    const id = await chatDB.createChatSession(data);
    const session: ChatSession = {
      ...data,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({ sessions: [session, ...s.sessions], currentSessionId: id }));
    return id;
  },

  deleteSession: async (id) => {
    await chatDB.deleteChatSession(id);
    set((s) => ({
      sessions: s.sessions.filter((ss) => ss.id !== id),
      currentSessionId:
        s.currentSessionId === id ? null : s.currentSessionId,
      messages:
        s.currentSessionId === id ? [] : s.messages,
    }));
  },

  setCurrentSession: (id) => {
    set({ currentSessionId: id });
  },

  loadMessages: async (sessionId) => {
    const messages = await chatDB.getMessagesBySession(sessionId);
    set({ messages });
  },

  addMessage: (msg) => {
    set((s) => ({ messages: [...s.messages, msg] }));
    // 持久化
    chatDB.addChatMessage(msg);
    // 更新会话时间
    if (get().currentSessionId) {
      chatDB.updateChatSession(get().currentSessionId!, {
        updatedAt: Date.now(),
      });
      // 如果是第一条用户消息，用它的内容作为会话标题
      if (
        msg.role === "user" &&
        get().messages.filter((m) => m.role === "user").length === 0
      ) {
        const title =
          msg.content.slice(0, 30) + (msg.content.length > 30 ? "..." : "");
        chatDB.updateChatSession(get().currentSessionId!, { title });
        set((s) => ({
          sessions: s.sessions.map((ss) =>
            ss.id === get().currentSessionId ? { ...ss, title } : ss
          ),
        }));
      }
    }
  },

  appendToLastMessage: (text) => {
    set((s) => {
      const msgs = [...s.messages];
      const last = msgs[msgs.length - 1];
      if (last && last.role === "assistant") {
        msgs[msgs.length - 1] = {
          ...last,
          content: last.content + text,
        };
      }
      return { messages: msgs };
    });
  },

  setStreaming: (streaming) => set({ isStreaming: streaming }),
}));
