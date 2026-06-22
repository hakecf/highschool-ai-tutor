"use client";

import { useCallback } from "react";
import * as knowledgeDB from "@/lib/db/knowledge-db";
import * as chapterDB from "@/lib/db/chapter-db";
import { useKnowledgeStore } from "@/stores/knowledge-store";
import type { KnowledgePoint, Chapter } from "@/types";

export function useKnowledge() {
  const {
    selectedTextbookId,
    selectedChapterId,
    knowledgePoints,
    chapters,
    setKnowledgePoints,
    setChapters,
    setSelectedChapter,
    toggleExpanded,
    selectKnowledgePoint,
  } = useKnowledgeStore();

  /**
   * 加载某本教材的所有知识点和章节
   */
  const loadTextbookKnowledge = useCallback(
    async (textbookId: string) => {
      const [points, chs] = await Promise.all([
        knowledgeDB.getKnowledgePointsByTextbook(textbookId),
        chapterDB.getChaptersByTextbook(textbookId),
      ]);
      setKnowledgePoints(points);
      setChapters(chs);
    },
    [setKnowledgePoints, setChapters]
  );

  /**
   * 获取某章节的知识点
   */
  const getChapterKnowledge = useCallback(
    (chapterId: string): KnowledgePoint[] => {
      return knowledgePoints.filter((kp) => kp.chapterId === chapterId);
    },
    [knowledgePoints]
  );

  /**
   * 获取某章节的摘要数据
   */
  const getChapterData = useCallback(
    (chapterId: string): Chapter | undefined => {
      return chapters.find((ch) => ch.id === chapterId);
    },
    [chapters]
  );

  /**
   * 获取知识点树（顶层节点）
   */
  const getKnowledgeTree = useCallback((): KnowledgePoint[] => {
    return knowledgeDB.buildKnowledgeTree(knowledgePoints);
  }, [knowledgePoints]);

  /**
   * 按章节ID筛选知识树
   */
  const getChapterKnowledgeTree = useCallback(
    (chapterId: string): KnowledgePoint[] => {
      const chapterPoints = knowledgePoints.filter(
        (kp) => kp.chapterId === chapterId
      );
      return knowledgeDB.buildKnowledgeTree(chapterPoints);
    },
    [knowledgePoints]
  );

  return {
    selectedTextbookId,
    selectedChapterId,
    chapters,
    knowledgePoints,
    loadTextbookKnowledge,
    getChapterKnowledge,
    getChapterData,
    getKnowledgeTree,
    getChapterKnowledgeTree,
    setSelectedChapter,
    toggleExpanded,
    selectKnowledgePoint,
  };
}
