"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Brain,
  ArrowLeft,
  Trash2,
  AlertCircle,
} from "lucide-react";
import type { Textbook } from "@/types";
import * as textbookDB from "@/lib/db/textbook-db";
import { useTextbook } from "@/hooks/use-textbook";
import { useAnalysisStore } from "@/stores/analysis-store";
import { AnalysisProgress } from "@/components/textbooks/analysis-progress";
import { TextbookKnowledgeView } from "@/components/textbooks/textbook-knowledge-view";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { formatFileSize, formatDate } from "@/lib/utils/format";

const subjectLabels: Record<string, string> = {
  math: "数学",
  physics: "物理",
  chemistry: "化学",
};

export default function TextbookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { analyzeTextbook } = useTextbook();
  const { jobs } = useAnalysisStore();

  const [textbook, setTextbook] = useState<Textbook | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      const tb = await textbookDB.getTextbookById(id);
      setTextbook(tb || null);
      setIsLoading(false);
    };
    load();
  }, [id]);

  const handleAnalyze = () => {
    if (textbook) {
      analyzeTextbook(textbook.id);
    }
  };

  const handleDelete = async () => {
    if (!textbook) return;
    const { deleteTextbook } = useTextbook();
    await deleteTextbook(textbook.id);
    router.push("/textbooks");
  };

  // Loading
  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  // Not found
  if (!textbook) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-medium">教材未找到</h2>
          <p className="text-sm text-muted-foreground mt-1">
            该教材可能已被删除
          </p>
          <Button className="mt-4" variant="outline" onClick={() => router.push("/textbooks")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回教材列表
          </Button>
        </div>
      </div>
    );
  }

  const job = jobs[textbook.id];
  const showProgress =
    job &&
    job.status !== "idle" &&
    textbook.status !== "ready";

  return (
    <div className="p-6 max-w-4xl">
      {/* 返回按钮 */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => router.push("/textbooks")}
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        返回
      </Button>

      {/* 教材信息 */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{textbook.name}</h1>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="secondary">{subjectLabels[textbook.subject]}</Badge>
              <Badge variant="secondary">{textbook.version}</Badge>
              <Badge variant="secondary">{textbook.grade}</Badge>
              <Badge variant="outline">{textbook.fileType.toUpperCase()}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatFileSize(textbook.fileSize)} · 上传于{" "}
              {formatDate(textbook.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {textbook.status === "processing" && (
            <Button onClick={handleAnalyze} className="gap-2">
              <Brain className="h-4 w-4" />
              开始 AI 分析
            </Button>
          )}
          {textbook.status === "error" && (
            <Button onClick={handleAnalyze} className="gap-2">
              <Brain className="h-4 w-4" />
              重新分析
            </Button>
          )}
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 分析进度 */}
      {showProgress && (
        <div className="mt-6">
          <AnalysisProgress
            status={job.status}
            message={job.message}
            totalChapters={job.totalChapters}
            completedChapters={job.completedChapters}
            error={job.error}
            onRetry={handleAnalyze}
          />
        </div>
      )}

      {/* 分析完成 — 知识树 + 章节总结 */}
      {textbook.status === "ready" && (
        <TextbookKnowledgeView textbookId={textbook.id} />
      )}
    </div>
  );
}
