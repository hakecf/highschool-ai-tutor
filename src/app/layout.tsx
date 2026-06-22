import type { Metadata } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "高中生学习助手 - AI 智能辅导",
  description:
    "上传教材，AI 分析知识点，构建思维导图，智能问答。支持数学、物理、化学三科，让学习更加系统高效。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider>
          {children}
        </TooltipProvider>
        <Toaster richColors closeButton />
      </body>
    </html>
  );
}
