import Link from "next/link";
import { BookOpen, Brain, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white">
      {/* Hero */}
      <main className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-blue-500 flex items-center justify-center">
          <BookOpen className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
          高中生学习助手
        </h1>
        <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
          AI 驱动的智能学习伙伴 — 上传数学、物理、化学教材，自动分析知识点，
          构建知识体系，随时答疑解惑
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg" className="gap-2">
            <Link href="/textbooks">
              <BookOpen className="h-5 w-5" />
              开始使用
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link href="/chat">
              <MessageCircle className="h-5 w-5" />
              直接提问
            </Link>
          </Button>
        </div>
      </main>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-sky-100 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">教材分析</CardTitle>
              <CardDescription>
                上传数学、物理、化学教材，AI 自动提取章节和知识点层级结构
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-sky-100 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-2">
                <Brain className="h-5 w-5 text-emerald-600" />
              </div>
              <CardTitle className="text-lg">知识可视化</CardTitle>
              <CardDescription>
                交互式知识树和思维导图，让知识体系一目了然，系统化学习
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-sky-100 hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center mb-2">
                <MessageCircle className="h-5 w-5 text-violet-600" />
              </div>
              <CardTitle className="text-lg">智能问答</CardTitle>
              <CardDescription>
                基于你的教材内容，AI 精准回答学科问题，对话记录本地保存
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  );
}
