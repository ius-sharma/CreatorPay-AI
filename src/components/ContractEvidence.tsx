'use client';

import { evidencePages, pdfPageRanges } from '@/lib/pdf-contract';
import { useId, useRef, useState } from 'react';
import { FileText, Quote, ArrowUpLeft } from 'lucide-react';
import type { ContractExtraction } from '@/lib/contract';
import './contract-evidence.css';

type Term = { id: string; label: string; value: string; evidence: string | null };

export function ContractEvidence({ source, extraction }: { source: string; extraction: ContractExtraction }) {
  const documentId = useId();
  const documentRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Term | null>(null);
  const fields: Term[] = ([['brandName', 'Brand'], ['brandEmail', 'Billing email'], ['totalAmount', 'Total amount'], ['currency', 'Currency'], ['deadline', 'Deadline']] as const).map(([key, label]) => ({ id: key, label, value: extraction[key].value === null || extraction[key].value === '' ? 'Not provided' : String(extraction[key].value), evidence: extraction[key].evidence }));
  const groups = [
    { title: 'Key terms', terms: fields },
    { title: 'Payment milestones', terms: extraction.milestones.map((m, i) => ({ id: `milestone-${i}`, label: m.name, value: [m.percentage === null ? null : `${m.percentage}%`, m.amount === null ? null : `${extraction.currency.value || 'Currency missing'} ${m.amount.toFixed(2)}`].filter(Boolean).join(' · ') || 'Amount needs clarification', evidence: m.evidence })) },
    { title: 'Deliverables', terms: extraction.deliverables.map((d, i) => ({ id: `deliverable-${i}`, label: `Requirement ${i + 1}`, value: d.requirement, evidence: d.evidence })) },
    { title: 'Contract splits', terms: extraction.teamSplits.map((s, i) => ({ id: `split-${i}`, label: `${s.name || 'Name missing'} · ${s.role}`, value: `${s.email || 'Email missing'} · ${s.value}${s.type === 'percentage' ? '%' : ` ${extraction.currency.value || 'Currency missing'}`}`, evidence: s.evidence })) },
  ];
  const imported = pdfPageRanges(source).length > 0;
  const selectedPages = evidencePages(source, selected?.evidence || '');
  const pageLabel = (pages: number[]) => pages.length ? 'PDF page ' + pages.join(', ') : '';
  const quote = selected?.evidence || '';
  const start = quote.trim() ? source.indexOf(quote) : -1;
  const show = (term: Term) => {
    setSelected(term);
    // Only an explicit source selection moves the document's inner scroll area.
    requestAnimationFrame(() => {
      const container = documentRef.current;
      const mark = container?.querySelector('mark');
      if (container && mark) container.scrollTop += mark.getBoundingClientRect().top - container.getBoundingClientRect().top - 32;
    });
  };
  return <section className="evidence-review" aria-label="Contract evidence review">
    <header className="evidence-intro"><div><p className="evidence-eyebrow">CONTRACT EVIDENCE</p><h2>Every term, with its source.</h2><p>Select a term to find the exact wording in your agreement.</p></div><span className="evidence-count">{groups.reduce((sum,g)=>sum+g.terms.length,0)} extracted terms</span></header>
    <div className="evidence-layout">
      <section className="evidence-paper"><div className="evidence-panel-heading"><h3><FileText size={16}/>{imported ? 'Imported PDF text' : 'Original agreement'}</h3><span>Read only</span></div><p className="px-5 pt-3 text-xs text-slate-500">{imported ? 'Page labels refer to the imported text. Check extraction and layout against your PDF before confirming. The PDF file is not retained.' : ''}</p><div id={documentId} ref={documentRef} tabIndex={0} role="region" aria-label="Original agreement text" className="evidence-document"><p>{start >= 0 ? <>{source.slice(0,start)}<mark>{quote}</mark>{source.slice(start+quote.length)}</> : source || 'No original contract text recorded.'}</p></div>
        <div className="evidence-source-status" role="status">{!selected ? 'Choose a term on the right to inspect its source.' : start >= 0 ? `${selected.label}: exact source highlighted${source.indexOf(quote,start+quote.length)>=0?' (first occurrence)':''}.` : `${selected.label}: ${quote ? 'quoted text was not found in the original agreement.' : 'no supporting quote was recorded.'}`}</div>
      </section>
      <section className="evidence-terms"><div className="evidence-panel-heading"><h3><Quote size={16}/>Extracted terms</h3><span>Check against source</span></div><div className="evidence-term-list">{groups.map(group=><section key={group.title} className="evidence-group"><h4>{group.title}</h4>{group.terms.length ? group.terms.map(term=><button type="button" key={term.id} aria-pressed={selected?.id===term.id} aria-controls={documentId} onClick={()=>show(term)} className="evidence-term"><span><small>{term.label}</small><strong>{term.value}</strong>{term.evidence && evidencePages(source,term.evidence).length>0 && <small>{pageLabel(evidencePages(source,term.evidence))}</small>}</span><ArrowUpLeft size={15} aria-hidden="true"/></button>) : <p className="evidence-none">None extracted from this contract.</p>}</section>)}</div></section>
    </div>
    {selected && <div className="evidence-selection"><div><span className="evidence-eyebrow">SELECTED SOURCE · {selected.label}{selectedPages.length>0 && ` · ${pageLabel(selectedPages)}`}</span><button onClick={()=>setSelected(null)} type="button">Clear selection</button></div><blockquote>{quote || 'No supporting quote was recorded. Clarify this term before confirming.'}</blockquote>{start<0 && quote && <p>This quote does not match the original text; it has not been highlighted.</p>}</div>}
  </section>;
}
