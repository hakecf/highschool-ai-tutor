"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Brain,
  Network,
  MessageCircle,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { label: "教材管理", href: "/textbooks", icon: BookOpen },
  { label: "知识浏览", href: "/knowledge", icon: Brain },
  { label: "思维导图", href: "/mindmap", icon: Network },
  { label: "AI 对话", href: "/chat", icon: MessageCircle },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-60 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <BookOpen className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sidebar-foreground text-sm">
          高中生学习助手
        </span>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-10",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            </Button>
          );
        })}
      </nav>

      <Separator />

      {/* Settings */}
      <div className="p-3">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-10",
            pathname === "/settings" && "bg-sidebar-accent"
          )}
          asChild
        >
          <Link href="/settings">
            <Settings className="h-4 w-4 shrink-0" />
            <span>设置</span>
          </Link>
        </Button>
      </div>
    </aside>
  );
}
