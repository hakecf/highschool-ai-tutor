"use client";

import { useEffect, useRef, useState } from "react";
import { LoadingSpinner } from "@/components/common/loading-spinner";

interface MindMapViewerProps {
  markdown: string;
}

export function MindMapViewer({ markdown }: MindMapViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!markdown || !containerRef.current) return;

      setIsLoading(true);
      setError(null);

      try {
        // 动态加载 markmap 库
        const { Transformer } = await import("markmap-lib");
        const { Markmap } = await import("markmap-view");

        const transformer = new Transformer();
        const { root } = transformer.transform(markdown);

        if (cancelled) return;

        // 清空容器
        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = "";

        // 渲染 SVG
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", "100%");
        svg.setAttribute("height", "100%");
        svg.style.width = "100%";
        svg.style.height = "100%";
        container.appendChild(svg);

        Markmap.create(svg, {}, root);
        setIsLoading(false);
      } catch (err) {
        if (!cancelled) {
          console.error("Mind map render error:", err);
          setError("思维导图渲染失败，请重试");
          setIsLoading(false);
        }
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [markdown]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {isLoading && <LoadingSpinner label="渲染思维导图..." />}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: "500px" }}
      />
    </div>
  );
}
