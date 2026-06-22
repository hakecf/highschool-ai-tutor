import { db } from "./index";
import type { KnowledgePoint } from "@/types";

export async function getKnowledgePointsByTextbook(
  textbookId: string
): Promise<KnowledgePoint[]> {
  return db.knowledgePoints
    .where({ textbookId })
    .sortBy("level");
}

export async function getKnowledgePointsByChapter(
  textbookId: string,
  chapterId: string
): Promise<KnowledgePoint[]> {
  return db.knowledgePoints
    .where("[textbookId+chapterId]")
    .equals([textbookId, chapterId])
    .sortBy("order");
}

export async function bulkCreateKnowledgePoints(
  points: Omit<KnowledgePoint, "createdAt">[]
): Promise<void> {
  const now = Date.now();
  await db.knowledgePoints.bulkAdd(
    points.map((kp) => ({ ...kp, createdAt: now }))
  );
}

export async function deleteKnowledgePointsByTextbook(
  textbookId: string
): Promise<void> {
  await db.knowledgePoints.where({ textbookId }).delete();
}

/**
 * 将扁平知识点列表构建为树状结构
 */
export function buildKnowledgeTree(
  points: KnowledgePoint[]
): KnowledgePoint[] {
  const map = new Map<string, KnowledgePoint & { children?: KnowledgePoint[] }>();
  const roots: KnowledgePoint[] = [];

  // 初始化所有节点
  for (const p of points) {
    map.set(p.id, { ...p, children: [] });
  }

  // 构建父子关系
  for (const p of points) {
    const node = map.get(p.id)!;
    if (p.parentId && map.has(p.parentId)) {
      map.get(p.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
