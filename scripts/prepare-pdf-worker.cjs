// Serve the worker matching the installed PDF.js version from this app, not a CDN.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = path.dirname(require.resolve('pdfjs-dist/package.json'));
const target = path.join(root, 'public/pdfjs');
fs.mkdirSync(target, { recursive: true });
fs.copyFileSync(path.join(source, 'legacy/build/pdf.worker.min.mjs'), path.join(target, 'pdf.worker.min.mjs'));
fs.copyFileSync(path.join(source, 'LICENSE'), path.join(target, 'LICENSE'));
console.log('Local PDF.js worker prepared.');
