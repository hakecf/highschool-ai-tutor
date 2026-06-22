"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { FileDropZone } from "@/components/common/file-drop-zone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generateId } from "@/lib/utils/id";
import { useTextbookStore } from "@/stores/textbook-store";
import * as textbookDB from "@/lib/db/textbook-db";
import { ocrImage } from "@/lib/parsers/ocr";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadDialog({ open, onOpenChange }: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [subject, setSubject] = useState<string>("");
  const [version, setVersion] = useState("");
  const [grade, setGrade] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { addTextbook, updateTextbook } = useTextbookStore();

  const handleUpload = async () => {
    if (!file || !subject || !version || !grade) {
      toast.error("请填写所有信息");
      return;
    }

    setIsUploading(true);
    const id = generateId();
    const fileType = file.name.endsWith(".pdf")
      ? "pdf"
      : file.name.endsWith(".docx")
        ? "docx"
        : "image";

    // 创建本地记录
    const textbook = {
      id,
      name: file.name.replace(/\.[^.]+$/, ""),
      subject: subject as "math" | "physics" | "chemistry",
      version,
      grade,
      fileType: fileType as "pdf" | "docx" | "image",
      fileName: file.name,
      fileSize: file.size,
      rawContent: "",
      status: "processing" as const,
      chapterCount: 0,
    };

    try {
      await textbookDB.createTextbook(textbook);
      addTextbook({ ...textbook, createdAt: Date.now(), updatedAt: Date.now() });

      let extractedText = "";

      // 图片用客户端 OCR
      if (fileType === "image") {
        toast.info("正在识别图片文字...");
        extractedText = await ocrImage(file);
      } else {
        // PDF/Word 通过 API 解析
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/parse", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || "解析失败");
        }
        extractedText = data.text;
      }

      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error("提取的文本内容过少，请检查文件质量后重试");
      }

      // 更新记录
      await textbookDB.updateTextbook(id, {
        rawContent: extractedText,
        status: "processing",
      });
      updateTextbook(id, { rawContent: extractedText, status: "processing" });

      toast.success("教材上传成功！点击进入教材开始 AI 分析");
      onOpenChange(false);
      resetForm();
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : "上传失败，请重试";
      toast.error(msg);
      await textbookDB.updateTextbook(id, {
        status: "error",
        errorMessage: msg,
      });
      updateTextbook(id, { status: "error", errorMessage: msg });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setSubject("");
    setVersion("");
    setGrade("");
  };

  const canSubmit =
    file && subject && version.trim() && grade && !isUploading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>上传教材</DialogTitle>
          <DialogDescription>
            上传你的教材文件，选择对应的学科和版本信息
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* 文件选择 */}
          <FileDropZone onFileSelect={setFile} />

          {/* 学科 */}
          <div className="space-y-1.5">
            <Label>学科</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="选择学科" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="math">数学</SelectItem>
                <SelectItem value="physics">物理</SelectItem>
                <SelectItem value="chemistry">化学</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 版本 + 年级 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>教材版本</Label>
              <Input
                placeholder="如：人教版"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>年级</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger>
                  <SelectValue placeholder="选择年级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="高一">高一</SelectItem>
                  <SelectItem value="高二">高二</SelectItem>
                  <SelectItem value="高三">高三</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 上传按钮 */}
          <Button
            className="w-full"
            disabled={!canSubmit}
            onClick={handleUpload}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {file?.type.startsWith("image/") ? "正在识别..." : "正在解析..."}
              </>
            ) : (
              "上传并解析"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
