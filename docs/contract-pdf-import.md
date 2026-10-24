# Text-based contract PDF import

## User flow
New deal → Choose PDF → preview extracted text → Use extracted text → check/edit the contract → Analyze contract → inspect source quotes/page labels → confirm terms.

Import never starts an AI call or a payment. Existing contract text requires a separate Replace current text action. Import failure, cancellation or discard leaves existing text intact. AI review and human confirmation use the existing signed review workflow.

## Scope and limits
- Text-based PDFs only; 5 MB, 20 pages and 12,000 total imported characters including page labels. Files exceeding limits are rejected without partial import.
- Mozilla PDF.js 6.4.299 runs in the browser with a locally served matching worker. The PDF file is not sent to the app server, Groq, a CDN or persistent storage. Extracted text enters the existing contract draft/analysis workflow; Groq receives it only on Analyze.
- No OCR, document classification or PDF viewer is included. A page without readable text produces an import error rather than silently omitting terms. Password-protected and unreadable files require another text-based copy or pasted text.
- PDF reading order can differ from visual layout, particularly with columns, tables or unusual fonts. Users must compare imported text with their original document.

## Page references and persistence
The source text includes sequential page labels under a CreatorPay PDF-text header. Exact evidence quotes resolve to matching page ranges; repeated quotes use the first occurrence, as the existing source highlighter does. Missing quotes never get invented citations. The contract draft and confirmed deal already store the whole source string, so page labels survive reload without a schema migration.

These labels describe imported text. They do not verify the file's authenticity or signatures. The review explicitly identifies imported text and asks users to check against the PDF. Manually editing imported text removes page labels and invalidates the current AI review, so new clarifications are not attributed to an original PDF page.

## Setup
`npm ci` prepares the local worker via postinstall. `npm run dev` and `npm run build` prepare it again. Generated assets under `public/pdfjs/` are ignored; the script copies the PDF.js Apache-2.0 license beside the worker. No CDN configuration or extra credentials are required.

## Validation
57 automated checks passed, including real PDF.js extraction of a two-page in-memory contract, exact page references, persistence round-trip, invalid signatures, page/character/size limits, and existing contract/payment/ownership tests. Tests do not call live Groq or PayPal.

Manual browser acceptance remains necessary: choose a text PDF, preview/cancel, replace existing text, analyze, select source terms, save/reload draft and reopen the confirmed deal. Verify that page labels persist and no import starts payment. Fresh visual verification was not claimed because the earlier browser security restriction was respected.

Implementation reference: [Mozilla PDF.js examples](https://mozilla.github.io/pdf.js/examples/).

Production build and strict type checks passed. Local preview: http://127.0.0.1:3056.
