"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { KnowledgeNode } from "@/components/knowledge/knowledge-node";
import { ChapterSummary } from "@/components/knowledge/chapter-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useKnowledge } from "@/hooks/use-knowledge";
import { useKnowledgeStore } from "@/stores/knowledge-store";
import type { Chapter } from "@/types";

interface Props {
  textbookId: string;
}

export function TextbookKnowledgeView({ textbookId }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChapterData, setSelectedChapterData] = useState<Chapter | null>(null);

  const {
    chapters,
    selectedChapterId,
    setSelectedChapter,
  } = useKnowledgeStore();

  const {
    loadTextbookKnowledge,
    getChapterKnowledgeTree,
    getChapterData,
  } = useKnowledge();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await loadTextbookKnowledge(textbookId);
      setIsLoading(false);
    };
    load();
  }, [textbookId, loadTextbookKnowledge]);

  useEffect(() => {
    if (selectedChapterId) {
      setSelectedChapterData(getChapterData(selectedChapterId) || null);
    } else {
      setSelectedChapterData(null);
    }
  }, [selectedChapterId, chapters, getChapterData]);

  const tree = getChapterKnowledgeTree(selectedChapterId || "");

  if (isLoading) {
    return <LoadingSpinner label="加载知识结构..." />;
  }

  return (
    <div className="mt-6 flex flex-col lg:flex-row gap-6">
      {/* 章节列表 + 知识树 */}
      <div className="lg:w-[340px] shrink-0 space-y-4">
        {chapters.length > 0 ? (
          <>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              章节列表 ({chapters.length})
            </p>
            <div className="space-y-1">
              {chapters.map((ch) => (
                <Button
                  key={ch.id}
                  variant={
                    selectedChapterId === ch.id ? "secondary" : "ghost"
                  }
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={() => setSelectedChapter(ch.id)}
                >
                  <Badge
                    variant="outline"
                    className="mr-2 shrink-0 text-xs w-6 h-5 flex items-center justify-center"
                  >
                    {ch.order}
                  </Badge>
                  <span className="truncate text-sm">{ch.title}</span>
                  {ch.status === "analyzed" && (
                    <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </Button>
              ))}
            </div>

            {/* 知识树 */}
            {selectedChapterId && (
              <div className="border rounded-lg p-2 max-h-[50vh] overflow-y-auto">
                {tree.length > 0 ? (
                  tree.map((node) => (
                    <KnowledgeNode key={node.id} node={node} level={0} />
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    该章节暂无知识点
                  </p>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">未找到章节数据</p>
        )}
      </div>

      {/* 章节总结 */}
      <div className="flex-1">
        {selectedChapterData ? (
          <ChapterSummary chapter={selectedChapterData} />
        ) : (
          <div className="flex items-center justify-center py-16 text-muted-foreground border-2 border-dashed rounded-xl border-muted-foreground/20">
            <p className="text-sm">选择左侧章节查看 AI 生成的总结与重难点</p>
          </div>
        )}
      </div>
    </div>
  );
}
