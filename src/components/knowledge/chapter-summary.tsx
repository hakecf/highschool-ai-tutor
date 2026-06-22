"use client";

import { Lightbulb, AlertTriangle, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Chapter } from "@/types";

interface ChapterSummaryProps {
  chapter: Chapter;
}

export function ChapterSummary({ chapter }: ChapterSummaryProps) {
  let keyPoints: string[] = [];
  let difficultPoints: { title: string; explanation: string }[] = [];

  try {
    keyPoints = chapter.keyPoints ? JSON.parse(chapter.keyPoints) : [];
  } catch { /* ignore parse error */ }
  try {
    difficultPoints = chapter.difficultPoints
      ? JSON.parse(chapter.difficultPoints)
      : [];
  } catch { /* ignore parse error */ }

  return (
    <div className="space-y-4">
      {/* 章节总结 */}
      {chapter.summary && (
        <Card className="border-sky-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              章节总结
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {chapter.summary}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 重点知识 */}
      {keyPoints.length > 0 && (
        <Card className="border-sky-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Star className="h-4 w-4 text-blue-500" />
              重点知识
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Badge variant="secondary" className="shrink-0 mt-0.5 text-xs h-5 w-5 rounded-full flex items-center justify-center p-0">
                    {i + 1}
                  </Badge>
                  <span className="text-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 难点解析 */}
      {difficultPoints.length > 0 && (
        <Card className="border-amber-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              难点解析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {difficultPoints.map((dp, i) => (
                <li key={i} className="text-sm">
                  <p className="font-medium text-foreground">{dp.title}</p>
                  <p className="mt-0.5 text-muted-foreground">
                    {dp.explanation}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* 未分析 */}
      {!chapter.summary && !keyPoints.length && !difficultPoints.length && (
        <p className="text-sm text-muted-foreground text-center py-8">
          该章节尚未完成 AI 分析
        </p>
      )}
    </div>
  );
}
