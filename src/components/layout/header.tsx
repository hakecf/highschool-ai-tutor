"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const pathLabels: Record<string, string> = {
  textbooks: "教材管理",
  knowledge: "知识浏览",
  mindmap: "思维导图",
  chat: "AI 对话",
  settings: "设置",
};

export function Header() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  // 构建面包屑
  const breadcrumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    // 如果是动态路由 [id]，尝试用实际标题替代（后续 Phase 会替换）
    const label =
      pathLabels[seg] || (seg.length > 30 ? "教材详情" : decodeURIComponent(seg));
    return { label, href };
  });

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/80 backdrop-blur-sm px-4">
      {/* 面包屑 */}
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-7 px-2")}
        >
          <Home className="h-3.5 w-3.5" />
        </Link>
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" />
            <Link
              href={crumb.href}
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-7 px-2 text-xs"
              )}
            >
              {crumb.label}
            </Link>
          </span>
        ))}
      </nav>
    </header>
  );
}
