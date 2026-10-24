import { PDF_MAX_BYTES, PDF_MAX_PAGES, CONTRACT_MAX_CHARS, pageText, pdfContractText, validatePdfFile } from './pdf-contract';

export async function readContractPdf(file: File, signal: AbortSignal): Promise<{ text: string; pages: number }> {
  if (file.size > PDF_MAX_BYTES || !/\.pdf$/i.test(file.name)) throw new Error('Choose a PDF up to 5 MB.');
  const bytes = new Uint8Array(await file.arrayBuffer());
  validatePdfFile(file.name, file.size, bytes);
  if (signal.aborted) throw new Error('PDF import cancelled.');
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  if (signal.aborted) throw new Error('PDF import cancelled.');
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs';
  const task = pdfjs.getDocument({ data: bytes, stopAtErrors: true, useWorkerFetch: false, useWasm: false, disableFontFace: true });
  const cancel = () => { void task.destroy(); };
  signal.addEventListener('abort', cancel, { once: true });
  const timeout = setTimeout(cancel, 30000);
  try {
    const pdf = await task.promise;
    if (signal.aborted) throw new Error('PDF import cancelled.');
    if (pdf.numPages > PDF_MAX_PAGES) throw new Error('Choose a PDF with 1–20 pages.');
    const pages: string[] = [];
    let length = 0;
    for (let number = 1; number <= pdf.numPages; number++) {
      if (signal.aborted) throw new Error('PDF import cancelled.');
      const page = await pdf.getPage(number);
      const content = await page.getTextContent();
      const text = pageText(content.items);
      length += text.length;
      if (length > CONTRACT_MAX_CHARS) throw new Error('This PDF exceeds the 12,000-character contract limit. Nothing was imported.');
      pages.push(text);
      page.cleanup();
    }
    return { text: pdfContractText(pages), pages: pages.length };
  } catch (error) {
    if (signal.aborted) throw new Error('PDF import cancelled.');
    if (error instanceof Error && error.name === 'PasswordException') throw new Error('Password-protected PDFs are not supported. Choose an unlocked copy.');
    if (error instanceof Error && /^(Choose|No readable|This PDF)/.test(error.message)) throw error;
    throw new Error('Could not read this PDF. Choose another text-based PDF or paste the contract.');
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', cancel);
    await task.destroy();
  }
}
