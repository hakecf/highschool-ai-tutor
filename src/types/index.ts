// 教材
export interface Textbook {
  id: string;
  name: string;
  subject: "math" | "physics" | "chemistry";
  version: string; // e.g. "人教版", "苏教版"
  grade: string; // e.g. "高一", "高二", "高三"
  fileType: "pdf" | "docx" | "image";
  fileName: string;
  fileSize: number;
  rawContent: string; // 完整提取文本
  status: "processing" | "analyzing" | "ready" | "error";
  errorMessage?: string;
  chapterCount: number;
  createdAt: number; // timestamp
  updatedAt: number;
}

// 章节
export interface Chapter {
  id: string;
  textbookId: string;
  title: string;
  order: number;
  rawContent: string;
  summary?: string;
  keyPoints?: string; // JSON array
  difficultPoints?: string; // JSON array of {title, explanation}
  status: "pending" | "analyzed";
  createdAt: number;
  updatedAt: number;
}

// 知识点
export interface KnowledgePoint {
  id: string;
  textbookId: string;
  chapterId?: string;
  parentId?: string; // 自引用：父知识点
  name: string;
  description: string;
  level: number; // 层级深度，0 = 根
  order: number;
  createdAt: number;
}

// 思维导图缓存
export interface MindMap {
  id: string;
  textbookId: string;
  chapterId?: string;
  data: string; // markdown 格式
  createdAt: number;
  updatedAt: number;
}

// 对话会话
export interface ChatSession {
  id: string;
  textbookId?: string;
  chapterId?: string;
  title: string; // 由第一条消息自动生成
  createdAt: number;
  updatedAt: number;
}

// 对话消息
export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}
