import pdfParse from "pdf-parse";

export async function parsePDF(buffer: Buffer): Promise<{
  text: string;
  pageCount: number;
}> {
  const data = await pdfParse(buffer);
  return {
    text: data.text,
    pageCount: data.numpages,
  };
}
