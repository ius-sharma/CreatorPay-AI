const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'), ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,f);
const {validatePdfFile,pageText,pdfContractText,pdfPageRanges,evidencePages,stripPdfPageLabels,PDF_MAX_BYTES}=require('../src/lib/pdf-contract.ts');

// A tiny in-memory, text-based PDF; no external contract or service is involved.
function pdfBytes(pages){
 const objects=['<< /Type /Catalog /Pages 2 0 R >>',`<< /Type /Pages /Kids [${pages.map((_,i)=>`${4+i*2} 0 R`).join(' ')}] /Count ${pages.length} >>`,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'];
 pages.forEach((text,i)=>{
  const stream=`BT /F1 12 Tf 50 700 Td (${text.replace(/[\\()]/g,'\\$&')}) Tj ET`;
  objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${5+i*2} 0 R >>`);
  objects.push(`<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`);
 });
 let pdf='%PDF-1.7\n',offsets=[0];
 objects.forEach((object,i)=>{offsets.push(Buffer.byteLength(pdf));pdf+=`${i+1} 0 obj\n${object}\nendobj\n`;});
 const xref=Buffer.byteLength(pdf);
 pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('');
 pdf+=`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
 return new Uint8Array(Buffer.from(pdf));
}

test('file validation rejects renamed non-PDFs and oversized input',()=>{
 const bytes=pdfBytes(['Contract text']);
 assert.doesNotThrow(()=>validatePdfFile('Agreement.PDF',bytes.length,bytes));
 for(const [name,size,data] of [['x.txt',bytes.length,bytes],['x.pdf',PDF_MAX_BYTES+1,bytes],['x.pdf',4,new Uint8Array([1,2,3,4])]]) assert.throws(()=>validatePdfFile(name,size,data));
});

test('page limits and text limits reject the whole import rather than silently truncating',()=>{
 assert.throws(()=>pdfContractText(Array(21).fill('Contract text')),/1–20/);
 assert.throws(()=>pdfContractText(['x'.repeat(12000)]),/12,000/);
 assert.throws(()=>pdfContractText(['Valid contract terms for a creator','']),/page 2/);
 assert.throws(()=>pdfContractText(['tiny']),/too little/);
});

test('page citations require exact quotes and survive saved prompt round trips',()=>{
 const source=pdfContractText(['Acme offers USD 2000 for a video.','Pay 30% advance, 70% after approval.']);
 const restored=JSON.parse(JSON.stringify({prompt:source})).prompt;
 assert.deepEqual(evidencePages(restored,'Acme offers USD 2000'),[1]);
 assert.deepEqual(evidencePages(restored,'70% after approval'),[2]);
 assert.deepEqual(evidencePages(restored,'invented claim'),[]);
 assert.deepEqual(evidencePages('Ordinary pasted text','Ordinary'),[]);
 assert.deepEqual(pdfPageRanges(source.replace('[[PDF page 2]]','[[PDF page 7]]')),[]);
 const ranges=pdfPageRanges(source);
 assert.deepEqual(evidencePages(source,source.slice(ranges[0].end-10,ranges[1].start+5)),[1,2]);
 const edited=stripPdfPageLabels(source+'\nNew clarification: USD 3000.');
 assert.ok(edited.includes('New clarification: USD 3000.'));
 assert.ok(edited.includes('Acme offers USD 2000'));
 assert.deepEqual(evidencePages(edited,'USD 3000'),[]);
 assert.deepEqual(pdfPageRanges(edited),[]);
});

test('real PDF.js extraction reads a two-page contract and preserves matching source citations',async()=>{
 const pdfjs=await import('pdfjs-dist/legacy/build/pdf.mjs');
 const task=pdfjs.getDocument({data:pdfBytes(['Acme total USD 2000. Bill finance@acme.example.','Deliver one sponsor video. 30% advance, 70% after approval.']),useSystemFonts:true,useWorkerFetch:false,useWasm:false,stopAtErrors:true});
 try{
  const pdf=await task.promise;
  const pages=[];
  for(let i=1;i<=pdf.numPages;i++)pages.push(pageText((await (await pdf.getPage(i)).getTextContent()).items));
  const text=pdfContractText(pages);
  assert.equal(pdf.numPages,2);
  assert.deepEqual(evidencePages(text,'USD 2000'),[1]);
  assert.deepEqual(evidencePages(text,'70% after approval'),[2]);
  assert.ok(text.includes('finance@acme.example'));
 }finally{await task.destroy();}
});
