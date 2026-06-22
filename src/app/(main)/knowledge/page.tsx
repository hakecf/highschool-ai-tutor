"use client";

import { useEffect, useState } from "react";
import { Brain, BookOpen } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { KnowledgeNode } from "@/components/knowledge/knowledge-node";
import { ChapterSummary } from "@/components/knowledge/chapter-summary";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useKnowledgeStore } from "@/stores/knowledge-store";
import { useKnowledge } from "@/hooks/use-knowledge";
import * as textbookDB from "@/lib/db/textbook-db";
import type { Textbook, Chapter } from "@/types";

const subjectLabels: Record<string, string> = {
  math: "数学",
  physics: "物理",
  chemistry: "化学",
};

export default function KnowledgePage() {
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  const {
    selectedTextbookId,
    chapters,
    selectedChapterId,
    setSelectedTextbook,
    setSelectedChapter: selectChapter,
    setKnowledgePoints,
    setChapters,
  } = useKnowledgeStore();

  const { loadTextbookKnowledge, getChapterKnowledgeTree, getChapterData } =
    useKnowledge();

  // Load analyzed textbooks
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const all = await textbookDB.getAllTextbooks();
      const analyzed = all.filter((t) => t.status === "ready");
      setTextbooks(analyzed);
      setIsLoading(false);
    };
    load();
  }, []);

  // When selected textbook changes, load its knowledge data
  useEffect(() => {
    if (selectedTextbookId) {
      loadTextbookKnowledge(selectedTextbookId);
    }
  }, [selectedTextbookId, loadTextbookKnowledge]);

  // When selected chapter changes, get its data
  useEffect(() => {
    if (selectedChapterId) {
      setSelectedChapter(getChapterData(selectedChapterId) || null);
    } else {
      setSelectedChapter(null);
    }
  }, [selectedChapterId, chapters, getChapterData]);

  const tree = getChapterKnowledgeTree(selectedChapterId || "");

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner label="加载教材数据..." />
      </div>
    );
  }

  if (textbooks.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground">知识浏览</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          浏览已分析教材的知识点结构，查看章节总结与重难点
        </p>
        <EmptyState
          icon={Brain}
          title="还没有分析过的教材"
          description="先上传一本教材并完成 AI 分析，就可以在这里浏览知识体系了。"
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground">知识浏览</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        选择教材和章节，浏览 AI 分析的知识结构
      </p>

      <div className="mt-4 flex flex-col lg:flex-row gap-6">
        {/* Left: Textbook selector + Chapter list + Knowledge tree */}
        <div className="lg:w-[340px] shrink-0 space-y-4">
          {/* Textbook selector */}
          <div className="flex flex-wrap gap-2">
            {textbooks.map((tb) => (
              <Button
                key={tb.id}
                variant={selectedTextbookId === tb.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTextbook(tb.id)}
              >
                <BookOpen className="mr-1 h-3.5 w-3.5" />
                {tb.name.slice(0, 15)}
                {tb.name.length > 15 && "..."}
              </Button>
            ))}
          </div>

          {/* Chapter list */}
          {selectedTextbookId && chapters.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                章节列表
              </p>
              {chapters.map((ch) => (
                <Button
                  key={ch.id}
                  variant={
                    selectedChapterId === ch.id ? "secondary" : "ghost"
                  }
                  size="sm"
                  className="w-full justify-start text-left"
                  onClick={() => selectChapter(ch.id)}
                >
                  <Badge variant="outline" className="mr-2 shrink-0 text-xs w-6 h-5 flex items-center justify-center">
                    {ch.order}
                  </Badge>
                  <span className="truncate text-sm">{ch.title}</span>
                </Button>
              ))}
            </div>
          )}

          {/* Knowledge tree */}
          {selectedChapterId && (
            <div className="border rounded-lg p-2 max-h-[50vh] overflow-y-auto">
              {tree.length > 0 ? (
                tree.map((node) => (
                  <KnowledgeNode key={node.id} node={node} level={0} />
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  该章节暂无知识点数据
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: Chapter summary */}
        <div className="flex-1">
          {selectedChapter ? (
            <ChapterSummary chapter={selectedChapter} />
          ) : (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <p className="text-sm">选择左侧章节查看总结与重难点</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
