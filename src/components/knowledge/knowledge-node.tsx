"use client";

import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useKnowledgeStore } from "@/stores/knowledge-store";
import type { KnowledgePoint } from "@/types";

interface KnowledgeNodeProps {
  node: KnowledgePoint & { children?: KnowledgePoint[] };
  level: number;
}

export function KnowledgeNode({ node, level }: KnowledgeNodeProps) {
  const expandedNodeIds = useKnowledgeStore((s) => s.expandedNodeIds);
  const selectedId = useKnowledgeStore((s) => s.selectedKnowledgePointId);
  const toggleExpanded = useKnowledgeStore((s) => s.toggleExpanded);
  const selectKnowledgePoint = useKnowledgeStore((s) => s.selectKnowledgePoint);

  const isExpanded = expandedNodeIds.has(node.id);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <button
        onClick={() => selectKnowledgePoint(node.id)}
        className={cn(
          "flex items-center gap-1.5 w-full py-1.5 px-2 rounded-md text-sm transition-colors text-left",
          isSelected
            ? "bg-primary/10 text-primary font-medium"
            : "hover:bg-muted/50 text-foreground"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {/* 展开/折叠 */}
        {hasChildren ? (
          <span
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded(node.id);
            }}
            className="shrink-0 p-0.5 rounded hover:bg-muted cursor-pointer"
          >
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 transition-transform text-muted-foreground",
                isExpanded && "rotate-90"
              )}
            />
          </span>
        ) : (
          <span className="w-5" />
        )}

        {/* 层级标记 */}
        <span
          className={cn(
            "shrink-0 h-1.5 w-1.5 rounded-full",
            level === 0
              ? "bg-primary"
              : level === 1
                ? "bg-blue-400"
                : "bg-muted-foreground/40"
          )}
        />

        <span className="truncate">{node.name}</span>
      </button>

      {/* 递归子节点 */}
      {hasChildren && isExpanded &&
        node.children!.map((child) => (
          <KnowledgeNode key={child.id} node={child} level={level + 1} />
        ))}
    </div>
  );
}
