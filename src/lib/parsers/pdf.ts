import * as pdfjsLib from "pdfjs-dist";

// 禁用 worker 以在 Node.js 环境直接运行
// pdfjs-dist 4.x 需要设置 worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "";

export async function parsePDF(buffer: Buffer): Promise<{
  text: string;
  pageCount: number;
}> {
  const data = new Uint8Array(buffer);
  const pdf = await pdfjsLib.getDocument({ data }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pages.push(pageText);
  }

  return {
    text: pages.join("\n\n"),
    pageCount: pdf.numPages,
  };
}
