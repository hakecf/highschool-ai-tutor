"use client";

import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { AnalysisStatus } from "@/stores/analysis-store";
import { cn } from "@/lib/utils";

interface AnalysisProgressProps {
  status: AnalysisStatus;
  message: string;
  totalChapters: number;
  completedChapters: number;
  error?: string;
  onRetry?: () => void;
}

export function AnalysisProgress({
  status,
  message,
  totalChapters,
  completedChapters,
  error,
  onRetry,
}: AnalysisProgressProps) {
  const progress =
    totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : status === "extracting_chapters"
        ? 10
        : 0;

  return (
    <Card className="border-sky-100">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          {status === "error" ? (
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
          ) : status === "ready" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
          ) : (
            <Loader2 className="h-5 w-5 text-primary animate-spin shrink-0" />
          )}

          <div className="flex-1 min-w-0">
            <p
              className={cn(
                "text-sm font-medium",
                status === "error" && "text-red-600",
                status === "ready" && "text-emerald-600"
              )}
            >
              {message}
            </p>
            {status !== "idle" && status !== "ready" && status !== "error" && (
              <div className="mt-2">
                <Progress value={progress} className="h-1.5" />
                <p className="mt-1 text-xs text-muted-foreground">
                  {progress}%
                </p>
              </div>
            )}
            {status === "error" && error && (
              <p className="mt-1 text-xs text-red-500">{error}</p>
            )}
          </div>

          {status === "error" && onRetry && (
            <Button variant="outline" size="sm" onClick={onRetry}>
              重试
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
