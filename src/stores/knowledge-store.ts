import { create } from "zustand";
import type { KnowledgePoint, Chapter } from "@/types";

interface KnowledgeState {
  // 选中状态
  selectedTextbookId: string | null;
  selectedChapterId: string | null;
  selectedKnowledgePointId: string | null;
  expandedNodeIds: Set<string>;

  // 数据缓存
  knowledgePoints: KnowledgePoint[];
  chapters: Chapter[];

  // Actions
  setSelectedTextbook: (id: string | null) => void;
  setSelectedChapter: (id: string | null) => void;
  selectKnowledgePoint: (id: string | null) => void;
  toggleExpanded: (id: string) => void;
  setKnowledgePoints: (points: KnowledgePoint[]) => void;
  setChapters: (chapters: Chapter[]) => void;
  reset: () => void;
}

export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  selectedTextbookId: null,
  selectedChapterId: null,
  selectedKnowledgePointId: null,
  expandedNodeIds: new Set<string>(),
  knowledgePoints: [],
  chapters: [],

  setSelectedTextbook: (id) =>
    set({
      selectedTextbookId: id,
      selectedChapterId: null,
      selectedKnowledgePointId: null,
      expandedNodeIds: new Set(),
      knowledgePoints: [],
      chapters: [],
    }),

  setSelectedChapter: (id) =>
    set({
      selectedChapterId: id,
      selectedKnowledgePointId: null,
    }),

  selectKnowledgePoint: (id) =>
    set({ selectedKnowledgePointId: id }),

  toggleExpanded: (id) =>
    set((state) => {
      const newSet = new Set(state.expandedNodeIds);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return { expandedNodeIds: newSet };
    }),

  setKnowledgePoints: (points) => set({ knowledgePoints: points }),
  setChapters: (chapters) => set({ chapters }),

  reset: () =>
    set({
      selectedTextbookId: null,
      selectedChapterId: null,
      selectedKnowledgePointId: null,
      expandedNodeIds: new Set(),
      knowledgePoints: [],
      chapters: [],
    }),
}));
