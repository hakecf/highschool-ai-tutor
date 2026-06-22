"use client";

import { useEffect, useState } from "react";
import { Network, BookOpen } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import { MindMapViewer } from "@/components/mindmap/mindmap-viewer";
import { useKnowledge } from "@/hooks/use-knowledge";
import { useKnowledgeStore } from "@/stores/knowledge-store";
import * as textbookDB from "@/lib/db/textbook-db";
import * as mindmapDB from "@/lib/db/mindmap-db";
import type { Textbook } from "@/types";
import { toast } from "sonner";
import { generateId } from "@/lib/utils/id";

export default function MindMapPage() {
  const [textbooks, setTextbooks] = useState<Textbook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [mindmapMarkdown, setMindmapMarkdown] = useState<string | null>(null);

  const { selectedTextbookId, setSelectedTextbook } = useKnowledgeStore();
  const { loadTextbookKnowledge, knowledgePoints } = useKnowledge();

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const all = await textbookDB.getAllTextbooks();
      setTextbooks(all.filter((t) => t.status === "ready"));
      setIsLoading(false);
    };
    load();
  }, []);

  // Load textbook knowledge when selected
  useEffect(() => {
    if (selectedTextbookId) {
      loadTextbookKnowledge(selectedTextbookId);
    }
  }, [selectedTextbookId, loadTextbookKnowledge]);

  const handleGenerate = async () => {
    if (!selectedTextbookId) {
      toast.error("请先选择一本教材");
      return;
    }

    // Check cache
    const cached = await mindmapDB.getMindMapByTextbook(selectedTextbookId);
    if (cached) {
      setMindmapMarkdown(cached.data);
      toast.success("已加载缓存的思维导图");
      return;
    }

    setGenerating(true);
    try {
      const kpSummary = knowledgePoints.map((kp) => ({
        name: kp.name,
        level: kp.level,
        order: kp.order,
      }));

      const res = await fetch("/api/mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          knowledgePoints: kpSummary,
          subject: textbooks.find((t) => t.id === selectedTextbookId)?.subject || "math",
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "生成失败");

      setMindmapMarkdown(data.markdown);

      // Save to cache
      await mindmapDB.saveMindMap({
        id: generateId(),
        textbookId: selectedTextbookId,
        data: data.markdown,
      });

      toast.success("思维导图已生成");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "生成失败"
      );
    } finally {
      setGenerating(false);
    }
  };

  const currentTextbook = textbooks.find((t) => t.id === selectedTextbookId);

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner label="加载中..." />
      </div>
    );
  }

  if (textbooks.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground">思维导图</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          将知识点可视化为交互式思维导图
        </p>
        <EmptyState
          icon={Network}
          title="还没有分析过的教材"
          description="先上传并分析一本教材，然后在这里生成思维导图。"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="p-4 border-b flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold">思维导图</h1>
        <div className="flex flex-wrap gap-2">
          {textbooks.map((tb) => (
            <Button
              key={tb.id}
              variant={selectedTextbookId === tb.id ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedTextbook(tb.id);
                setMindmapMarkdown(null);
              }}
            >
              <BookOpen className="mr-1 h-3.5 w-3.5" />
              {tb.name.slice(0, 12)}
            </Button>
          ))}
        </div>
        {selectedTextbookId && (
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="gap-2"
          >
            <Network className="h-4 w-4" />
            {generating ? "生成中..." : mindmapMarkdown ? "重新生成" : "生成思维导图"}
          </Button>
        )}
      </div>

      {/* Mindmap viewer */}
      <div className="flex-1 overflow-auto p-4">
        {mindmapMarkdown ? (
          <MindMapViewer markdown={mindmapMarkdown} />
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <p className="text-sm">
              {selectedTextbookId
                ? '点击"生成思维导图"按钮开始'
                : "选择一本教材后即可生成思维导图"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
