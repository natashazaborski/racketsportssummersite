// Best-effort player-name extraction from an uploaded attendance PDF.
// Uses pdf.js to pull real text content, groups items into visual lines, then
// applies light heuristics to drop obvious non-name rows. Formats vary, so the
// result is always shown to the user for review/editing before it's confirmed.
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.js?url';

interface TextItem {
  str: string;
  transform: number[];
}

/** Rows that are clearly headers/labels rather than camper names. */
const NOISE = /^(attendance|roster|sign[- ]?in|name|names|date|day|period|session|camp|group|time|sport|tennis|pickleball|badminton|total|page)\b/i;

function cleanLine(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/^[\s.\-–•*]+/, '') // leading bullets/dashes
    .replace(/^\d+[).\]\s]+/, '') // leading "1." / "12)" numbering
    .trim();
}

function looksLikeName(line: string): boolean {
  if (line.length < 2) return false;
  if (!/[A-Za-z]/.test(line)) return false; // must contain a letter
  if (/^\d+$/.test(line)) return false; // pure number
  if (NOISE.test(line)) return false;
  if (line.length > 60) return false; // a paragraph, not a name
  return true;
}

/** Group text items on a page into lines by their vertical position. */
function itemsToLines(items: TextItem[]): string[] {
  const rows = new Map<number, { x: number; str: string }[]>();
  for (const it of items) {
    if (!it.str) continue;
    const y = Math.round(it.transform[5]); // baseline y
    // Bucket near-equal y values together (±2px) onto an existing row.
    let key = y;
    for (const existing of rows.keys()) {
      if (Math.abs(existing - y) <= 2) {
        key = existing;
        break;
      }
    }
    const row = rows.get(key) ?? [];
    row.push({ x: it.transform[4], str: it.str });
    rows.set(key, row);
  }

  return [...rows.entries()]
    .sort((a, b) => b[0] - a[0]) // top of page first (PDF y grows upward)
    .map(([, parts]) =>
      parts
        .sort((a, b) => a.x - b.x)
        .map((p) => p.str)
        .join(' '),
    );
}

export async function extractNamesFromPdf(file: File): Promise<string[]> {
  // Dynamic import keeps the ~350KB pdf.js core out of the main bundle.
  // pdf.js v3 is a UMD build; depending on interop, its API may sit on the
  // namespace or under `.default`, so resolve whichever exposes getDocument.
  const mod = (await import('pdfjs-dist/legacy/build/pdf')) as any;
  const pdfjs = mod.getDocument ? mod : mod.default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

  const data = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data }).promise;

  const names: string[] = [];
  const seen = new Set<string>();
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const lines = itemsToLines(content.items as TextItem[]);
    for (const line of lines) {
      const name = cleanLine(line);
      if (!looksLikeName(name)) continue;
      const dedupeKey = name.toLowerCase();
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      names.push(name);
    }
  }
  return names;
}
