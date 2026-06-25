"use client";

type PdfCell = string | number | null | undefined;

export type PdfTableInput = {
  title: string;
  filename: string;
  columns: string[];
  rows: PdfCell[][];
  filters?: string[];
};

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 42;
const LINE_HEIGHT = 14;
const FONT_SIZE = 9;
const TITLE_SIZE = 16;
const MAX_LINE_CHARS = 96;

function pdfEscape(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function normalizeText(value: PdfCell) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function fitText(value: PdfCell, maxLength = 28) {
  const text = normalizeText(value);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, Math.max(maxLength - 1, 1))}...`;
}

function wrapLine(line: string, maxChars = MAX_LINE_CHARS) {
  if (line.length <= maxChars) return [line];
  const chunks: string[] = [];
  let current = line;
  while (current.length > maxChars) {
    const splitAt = current.lastIndexOf(" ", maxChars);
    const end = splitAt > 24 ? splitAt : maxChars;
    chunks.push(current.slice(0, end).trim());
    current = current.slice(end).trim();
  }
  if (current) chunks.push(current);
  return chunks;
}

function contentLine(x: number, y: number, text: string, fontSize = FONT_SIZE) {
  return `BT /F1 ${fontSize} Tf ${x} ${y} Td (${pdfEscape(text)}) Tj ET`;
}

function buildPages(input: PdfTableInput) {
  const pages: string[] = [];
  let y = PAGE_HEIGHT - MARGIN;
  let commands: string[] = [];

  const newPage = () => {
    if (commands.length) pages.push(commands.join("\n"));
    commands = [];
    y = PAGE_HEIGHT - MARGIN;
  };

  const write = (line: string, options?: { size?: number; x?: number; gap?: number }) => {
    if (y < MARGIN + LINE_HEIGHT) newPage();
    commands.push(contentLine(options?.x ?? MARGIN, y, line, options?.size ?? FONT_SIZE));
    y -= options?.gap ?? LINE_HEIGHT;
  };

  write(input.title, { size: TITLE_SIZE, gap: 22 });
  write(`Generated: ${new Date().toLocaleString()}`, { gap: 18 });
  for (const filter of input.filters ?? []) write(filter, { gap: 14 });
  if (input.filters?.length) y -= 6;

  const header = input.columns.map((column) => fitText(column, 20)).join(" | ");
  write(header, { gap: 16 });
  write("-".repeat(Math.min(header.length + 18, MAX_LINE_CHARS)), { gap: 14 });

  for (const row of input.rows) {
    const line = input.columns
      .map((_, index) => fitText(row[index], 24))
      .join(" | ");
    for (const chunk of wrapLine(line)) write(chunk);
    y -= 4;
  }

  if (!input.rows.length) write("No rows available.");
  if (commands.length) pages.push(commands.join("\n"));
  return pages;
}

export function exportTablePdf(input: PdfTableInput) {
  const pageContents = buildPages(input);
  const objects: string[] = [];
  const addObject = (body: string) => {
    objects.push(body);
    return objects.length;
  };

  const catalogId = addObject("<< /Type /Catalog /Pages 2 0 R >>");
  const pagesId = addObject("PAGES_PLACEHOLDER");
  const fontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const pageIds: number[] = [];

  for (const content of pageContents) {
    const stream = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
    const contentId = addObject(stream);
    const pageId = addObject(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    pageIds.push(pageId);
  }

  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = input.filename.endsWith(".pdf") ? input.filename : `${input.filename}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}
