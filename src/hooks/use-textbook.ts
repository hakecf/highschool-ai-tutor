"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { generateId } from "@/lib/utils/id";
import * as textbookDB from "@/lib/db/textbook-db";
import * as chapterDB from "@/lib/db/chapter-db";
import * as knowledgeDB from "@/lib/db/knowledge-db";
import { useTextbookStore } from "@/stores/textbook-store";
import { useAnalysisStore } from "@/stores/analysis-store";

export function useTextbook() {
  const { updateTextbook } = useTextbookStore();
  const { startAnalysis, updateJob } = useAnalysisStore();

  /**
   * 触发教材 AI 分析流程
   * 1. 先提取章节
   * 2. 再逐章分析知识点
   */
  const analyzeTextbook = useCallback(
    async (textbookId: string) => {
      const textbook = await textbookDB.getTextbookById(textbookId);
      if (!textbook) {
        toast.error("找不到教材信息");
        return;
      }

      if (!textbook.rawContent || textbook.rawContent.trim().length < 100) {
        toast.error("教材文本内容不足，请重新上传");
        return;
      }

      try {
        // Step 1: 提取章节
        startAnalysis(textbookId);
        updateTextbook(textbookId, { status: "analyzing" });
        await textbookDB.updateTextbook(textbookId, { status: "analyzing" });

        const chapterRes = await fetch("/api/analyze/textbook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: textbook.rawContent,
            subject: textbook.subject,
            version: textbook.version,
          }),
        });

        const chapterData = await chapterRes.json();
        if (!chapterData.success) {
          throw new Error(chapterData.error || "章节提取失败");
        }

        const chapters = chapterData.chapters;
        if (!chapters || chapters.length === 0) {
          throw new Error("未能提取到章节，请检查教材文本格式");
        }

        // 将章节存入 IndexedDB
        const chapterRecords = chapters.map(
          (ch: { title: string; order: number; rawContent: string }) => ({
            id: generateId(),
            textbookId,
            title: ch.title,
            order: ch.order,
            rawContent: ch.rawContent,
            status: "pending" as const,
          })
        );
        await chapterDB.bulkCreateChapters(chapterRecords);

        updateJob(textbookId, {
          status: "analyzing_chapters",
          message: `正在分析第 1/${chapters.length} 章...`,
          totalChapters: chapters.length,
          completedChapters: 0,
        });
        updateTextbook(textbookId, { chapterCount: chapters.length });

        // Step 2: 逐章分析知识点
        let successCount = 0;
        for (let i = 0; i < chapterRecords.length; i++) {
          const chapter = chapterRecords[i];
          const chapterData = chapters[i];

          updateJob(textbookId, {
            message: `正在分析第 ${i + 1}/${chapters.length} 章：${chapter.title}`,
            completedChapters: i,
          });

          try {
            const kpRes = await fetch("/api/analyze/chapter", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chapterText: chapterData.rawContent,
                chapterTitle: chapterData.title,
                subject: textbook.subject,
              }),
            });

            const kpData = await kpRes.json();
            if (kpData.success) {
              // 解析知识点
              const knowledgePoints = kpData.knowledgePoints.map(
                (kp: {
                  name: string;
                  description: string;
                  parentName: string | null;
                  level: number;
                  order: number;
                }) => ({
                  id: generateId(),
                  textbookId,
                  chapterId: chapter.id,
                  parentId: undefined as string | undefined,
                  name: kp.name,
                  description: kp.description,
                  level: kp.level,
                  order: kp.order,
                })
              );

              // 建立 parentId 映射
              const nameToId = new Map<string, string>();
              for (const kp of knowledgePoints) {
                nameToId.set(kp.name, kp.id);
              }
              for (const kp of knowledgePoints) {
                const parentName = kpData.knowledgePoints.find(
                  (k: { name: string }) => k.name === kp.name
                )?.parentName;
                if (parentName && nameToId.has(parentName)) {
                  kp.parentId = nameToId.get(parentName);
                }
              }

              await knowledgeDB.bulkCreateKnowledgePoints(knowledgePoints);

              // 更新章节记录
              await chapterDB.updateChapter(chapter.id, {
                summary: kpData.summary,
                keyPoints: JSON.stringify(kpData.keyPoints),
                difficultPoints: JSON.stringify(kpData.difficultPoints),
                status: "analyzed",
              });

              successCount++;
            }
          } catch (err) {
            console.error(`Chapter ${chapter.title} analysis failed:`, err);
            // 单章失败不中断整个流程
          }

          updateJob(textbookId, {
            completedChapters: i + 1,
          });
        }

        // 完成
        await textbookDB.updateTextbook(textbookId, {
          status: "ready",
          chapterCount: successCount,
        });
        updateTextbook(textbookId, {
          status: "ready",
          chapterCount: successCount,
        });
        updateJob(textbookId, {
          status: "ready",
          message: `分析完成！共 ${successCount} 章`,
        });

        toast.success(
          `教材分析完成！成功分析 ${successCount}/${chapters.length} 个章节`
        );
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "分析过程中出现未知错误";
        toast.error(msg);
        await textbookDB.updateTextbook(textbookId, {
          status: "error",
          errorMessage: msg,
        });
        updateTextbook(textbookId, {
          status: "error",
          errorMessage: msg,
        });
        updateJob(textbookId, {
          status: "error",
          error: msg,
          message: "分析失败",
        });
      }
    },
    [updateTextbook, startAnalysis, updateJob]
  );

  const deleteTextbook = useCallback(
    async (textbookId: string) => {
      try {
        await textbookDB.deleteTextbook(textbookId);
        // store 中的 removeTextbook 也会调用 db.deleteTextbook，直接调 store
        const { removeTextbook } = useTextbookStore.getState();
        await removeTextbook(textbookId);
        toast.success("教材已删除");
      } catch (error) {
        toast.error("删除失败，请重试");
      }
    },
    []
  );

  return { analyzeTextbook, deleteTextbook };
}
