"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/utils/format";

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // bytes
}

export function FileDropZone({
  onFileSelect,
  accept = ".pdf,.docx,.png,.jpg,.jpeg,.webp,.bmp",
  maxSize = 15 * 1024 * 1024, // 15MB
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSelect = useCallback(
    (file: File) => {
      setError(null);
      if (file.size > maxSize) {
        setError(`文件过大（${formatFileSize(file.size)}），最大支持 15MB`);
        return;
      }
      setSelectedFile(file);
      onFileSelect(file);
    },
    [maxSize, onFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSelect(file);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
  };

  return (
    <div className="space-y-2">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 cursor-pointer transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50",
          error && "border-destructive/50"
        )}
      >
        {selectedFile ? (
          <>
            <FileText className="h-8 w-8 text-primary" />
            <p className="text-sm font-medium text-foreground">
              {selectedFile.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              拖拽文件到此处，或点击选择
            </p>
            <p className="text-xs text-muted-foreground">
              支持 PDF、DOCX、图片格式，最大 15MB
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
