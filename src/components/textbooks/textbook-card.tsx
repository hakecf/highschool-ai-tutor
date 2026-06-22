"use client";

import Link from "next/link";
import { FileText, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Textbook } from "@/types";
import { cn } from "@/lib/utils";
import { formatFileSize, formatDate } from "@/lib/utils/format";

const subjectColors: Record<string, string> = {
  math: "bg-blue-100 text-blue-700",
  physics: "bg-emerald-100 text-emerald-700",
  chemistry: "bg-violet-100 text-violet-700",
};

const subjectLabels: Record<string, string> = {
  math: "数学",
  physics: "物理",
  chemistry: "化学",
};

const statusConfig: Record<string, { icon: typeof CheckCircle2; label: string; className: string }> = {
  processing: {
    icon: AlertCircle,
    label: "待分析",
    className: "text-blue-600",
  },
  analyzing: {
    icon: Loader2,
    label: "分析中",
    className: "text-amber-600",
  },
  ready: {
    icon: CheckCircle2,
    label: "已完成",
    className: "text-emerald-600",
  },
  error: {
    icon: AlertCircle,
    label: "出错",
    className: "text-red-600",
  },
};

interface TextbookCardProps {
  textbook: Textbook;
}

export function TextbookCard({ textbook }: TextbookCardProps) {
  const status = statusConfig[textbook.status] || statusConfig.error;
  const StatusIcon = status.icon;

  return (
    <Link href={`/textbooks/${textbook.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer border-border/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* 文件图标 */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm truncate">
                  {textbook.name}
                </h3>
                <StatusIcon
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    status.className,
                    textbook.status === "analyzing" && "animate-spin"
                  )}
                />
              </div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                <Badge
                  variant="secondary"
                  className={cn("text-xs", subjectColors[textbook.subject])}
                >
                  {subjectLabels[textbook.subject]}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {textbook.version}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {textbook.grade}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatFileSize(textbook.fileSize)} ·{" "}
                {formatDate(textbook.createdAt)}
              </p>
              {textbook.status === "error" && textbook.errorMessage && (
                <p className="mt-1 text-xs text-red-500 truncate">
                  {textbook.errorMessage}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
