import { create } from "zustand";
import type { Textbook } from "@/types";
import * as textbookDB from "@/lib/db/textbook-db";

interface TextbookState {
  textbooks: Textbook[];
  currentTextbookId: string | null;
  isLoading: boolean;

  // Actions
  loadTextbooks: () => Promise<void>;
  addTextbook: (textbook: Textbook) => void;
  removeTextbook: (id: string) => Promise<void>;
  setCurrentTextbook: (id: string | null) => void;
  updateTextbook: (id: string, changes: Partial<Textbook>) => void;
}

export const useTextbookStore = create<TextbookState>((set, get) => ({
  textbooks: [],
  currentTextbookId: null,
  isLoading: false,

  loadTextbooks: async () => {
    set({ isLoading: true });
    try {
      const textbooks = await textbookDB.getAllTextbooks();
      set({ textbooks, isLoading: false });
    } catch (error) {
      console.error("Failed to load textbooks:", error);
      set({ isLoading: false });
    }
  },

  addTextbook: (textbook) => {
    set((state) => ({ textbooks: [textbook, ...state.textbooks] }));
  },

  removeTextbook: async (id) => {
    await textbookDB.deleteTextbook(id);
    set((state) => ({
      textbooks: state.textbooks.filter((t) => t.id !== id),
      currentTextbookId:
        state.currentTextbookId === id ? null : state.currentTextbookId,
    }));
  },

  setCurrentTextbook: (id) => {
    set({ currentTextbookId: id });
  },

  updateTextbook: (id, changes) => {
    set((state) => ({
      textbooks: state.textbooks.map((t) =>
        t.id === id ? { ...t, ...changes } : t
      ),
    }));
  },
}));
