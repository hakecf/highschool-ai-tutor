"use client";

import { useEffect, useState } from "react";
import { BookOpen, Upload } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { UploadDialog } from "@/components/textbooks/upload-dialog";
import { TextbookCard } from "@/components/textbooks/textbook-card";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useTextbookStore } from "@/stores/textbook-store";

export default function TextbooksPage() {
  const { textbooks, isLoading, loadTextbooks } = useTextbookStore();
  const [uploadOpen, setUploadOpen] = useState(false);

  useEffect(() => {
    loadTextbooks();
  }, [loadTextbooks]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">教材管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            上传你的教材，让 AI 帮你分析整理知识体系
          </p>
        </div>
        {textbooks.length > 0 && (
          <Button onClick={() => setUploadOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" />
            上传教材
          </Button>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner label="加载教材列表..." />
      ) : textbooks.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="还没有教材"
          description="上传你的第一本教材，开始构建专属知识库。支持 PDF、Word 文档和图片。"
          action={{
            label: "上传教材",
            onClick: () => setUploadOpen(true),
          }}
        />
      ) : (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {textbooks.map((tb) => (
            <TextbookCard key={tb.id} textbook={tb} />
          ))}
        </div>
      )}

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
