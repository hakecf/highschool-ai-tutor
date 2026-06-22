"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, Download, Database } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { db } from "@/lib/db/index";

export default function SettingsPage() {
  const [isClearing, setIsClearing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [storageInfo, setStorageInfo] = useState<string>("计算中...");

  // 估算存储使用
  const checkStorage = async () => {
    try {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const quota = estimate.quota || 0;
        setStorageInfo(
          `${(used / 1024 / 1024).toFixed(1)} MB / ${(quota / 1024 / 1024).toFixed(1)} MB`
        );
      } else {
        const textbooks = await db.textbooks.count();
        const chapters = await db.chapters.count();
        const kps = await db.knowledgePoints.count();
        const sessions = await db.chatSessions.count();
        const messages = await db.chatMessages.count();
        setStorageInfo(
          `${textbooks} 本教材, ${chapters} 章, ${kps} 个知识点, ${sessions} 个对话, ${messages} 条消息`
        );
      }
    } catch {
      setStorageInfo("无法获取存储信息");
    }
  };

  // 初始化时检查
  useEffect(() => {
    checkStorage();
  }, []);

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      await db.textbooks.clear();
      await db.chapters.clear();
      await db.knowledgePoints.clear();
      await db.mindMaps.clear();
      await db.chatSessions.clear();
      await db.chatMessages.clear();
      toast.success("所有数据已清除");
      checkStorage();
    } catch {
      toast.error("清除失败，请重试");
    } finally {
      setIsClearing(false);
    }
  };

  const handleExportChats = async () => {
    setIsExporting(true);
    try {
      const sessions = await db.chatSessions.toArray();
      const allMessages = await db.chatMessages.toArray();

      const exportData = sessions.map((s) => ({
        ...s,
        messages: allMessages.filter((m) => m.sessionId === s.id),
      }));

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat-history-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("对话记录已导出");
    } catch {
      toast.error("导出失败，请重试");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-foreground">设置</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        管理应用配置和本地数据
      </p>

      <div className="mt-6 space-y-6">
        {/* API 配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI 服务配置</CardTitle>
            <CardDescription>
              在项目根目录的{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                .env.local
              </code>{" "}
              中配置 ANTHROPIC_API_KEY 以启用 AI 功能。
              获取 Key:{" "}
              <a
                href="https://console.anthropic.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                console.anthropic.com
              </a>
            </CardDescription>
          </CardHeader>
        </Card>

        <Separator />

        {/* 存储信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Database className="h-4 w-4" />
              存储信息
            </CardTitle>
            <CardDescription>
              所有数据存储在浏览器本地 (IndexedDB)，不会上传到任何云端服务器
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{storageInfo}</p>
          </CardContent>
        </Card>

        <Separator />

        {/* 数据管理 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">数据管理</CardTitle>
            <CardDescription>
              导出对话记录或清除所有本地数据
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportChats}
              disabled={isExporting}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "导出中..." : "导出对话记录"}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleClearAll}
              disabled={isClearing}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isClearing ? "清除中..." : "清除所有数据"}
            </Button>
          </CardContent>
        </Card>

        <Separator />

        {/* 关于 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">关于</CardTitle>
            <CardDescription>
              高中生学习助手 Demo v0.1.0
              <br />
              支持学科：数学、物理、化学
              <br />
              技术栈：Next.js 16 + React 19 + Claude API
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
