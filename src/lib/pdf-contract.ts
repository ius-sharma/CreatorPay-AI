export const PDF_MAX_BYTES = 5 * 1024 * 1024;
export const PDF_MAX_PAGES = 20;
export const CONTRACT_MAX_CHARS = 12000;
const header = '[[CreatorPay PDF text v1]]';

export function validatePdfFile(name: string, size: number, bytes: Uint8Array) {
  if (!/\.pdf$/i.test(name) || size <= 0 || size > PDF_MAX_BYTES) throw new Error('Choose a PDF up to 5 MB.');
  if (String.fromCharCode(...Array.from(bytes.slice(0, 5))) !== '%PDF-') throw new Error('This file is not a readable PDF. Choose another file.');
}

export function pageText(items: readonly unknown[]): string {
  return items.map(item => {
    if (!item || typeof item !== 'object' || !('str' in item) || typeof item.str !== 'string') return '';
    return item.str + ('hasEOL' in item && item.hasEOL ? '\n' : ' ');
  }).join('').replace(/[ \t]+\n/g, '\n').trim();
}

export function pdfContractText(pages: string[]): string {
  if (!pages.length || pages.length > PDF_MAX_PAGES) throw new Error('Choose a PDF with 1–20 pages.');
  const empty = pages.findIndex(page => !page.trim());
  if (empty >= 0) throw new Error(`No readable text on page ${empty + 1}. Choose a text-based PDF or paste the complete contract.`);
  const text = header + '\n' + pages.map((page, i) => `[[PDF page ${i + 1}]]\n${page.trim()}`).join('\n\n');
  if (text.length > CONTRACT_MAX_CHARS) throw new Error('This PDF exceeds the 12,000-character contract limit. Choose a shorter agreement or paste the relevant agreed terms. Nothing was imported.');
  if (pages.join('').trim().length < 20) throw new Error('This PDF contains too little contract text. Paste at least 20 characters.');
  return text;
}

// These are labels in editable imported text, not proof of PDF authenticity.
export function pdfPageRanges(source: string) {
  if (!source.startsWith(header + '\n')) return [];
  const matches = Array.from(source.matchAll(/^\[\[PDF page (\d+)\]\]\n/gm));
  if (!matches.length || matches.length > PDF_MAX_PAGES || matches.some((m, i) => Number(m[1]) !== i + 1)) return [];
  return matches.map((m, i) => ({ page: i + 1, start: m.index! + m[0].length, end: matches[i + 1]?.index ?? source.length }));
}

export function evidencePages(source: string, quote: string): number[] {
  if (!quote.trim()) return [];
  const start = source.indexOf(quote);
  if (start < 0) return [];
  return pdfPageRanges(source).filter(page => page.start < start + quote.length && page.end > start).map(page => page.page);
}

export function stripPdfPageLabels(source: string): string {
  if (!source.startsWith(header + '\n')) return source;
  return source.slice(header.length + 1).replace(/^\[\[PDF page \d+\]\]\n/gm, '').trim();
}
