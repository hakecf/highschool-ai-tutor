import { create } from "zustand";

export type AnalysisStatus =
  | "idle"
  | "extracting_chapters"
  | "analyzing_chapters"
  | "ready"
  | "error";

interface AnalysisJob {
  textbookId: string;
  status: AnalysisStatus;
  message: string;
  totalChapters: number;
  completedChapters: number;
  error?: string;
}

interface AnalysisState {
  jobs: Record<string, AnalysisJob>;

  startAnalysis: (textbookId: string) => void;
  updateJob: (textbookId: string, changes: Partial<AnalysisJob>) => void;
  removeJob: (textbookId: string) => void;
  getJob: (textbookId: string) => AnalysisJob | undefined;
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  jobs: {},

  startAnalysis: (textbookId) => {
    set((state) => ({
      jobs: {
        ...state.jobs,
        [textbookId]: {
          textbookId,
          status: "extracting_chapters",
          message: "正在提取章节结构...",
          totalChapters: 0,
          completedChapters: 0,
        },
      },
    }));
  },

  updateJob: (textbookId, changes) => {
    set((state) => ({
      jobs: {
        ...state.jobs,
        [textbookId]: {
          ...(state.jobs[textbookId] || { textbookId, status: "idle", message: "", totalChapters: 0, completedChapters: 0 }),
          ...changes,
        },
      },
    }));
  },

  removeJob: (textbookId) => {
    set((state) => {
      const newJobs = { ...state.jobs };
      delete newJobs[textbookId];
      return { jobs: newJobs };
    });
  },

  getJob: (textbookId) => {
    return get().jobs[textbookId];
  },
}));
