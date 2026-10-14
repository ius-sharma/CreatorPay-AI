import { Search } from 'lucide-react';
export const card='ui-panel';
export const field='ui-field';
export function SearchField({value,onChange,label}:{value:string;onChange:(v:string)=>void;label:string}) {return <label className="ui-search"><Search className="h-4 w-4 shrink-0 text-slate-400"/><input aria-label={label} placeholder={label} value={value} onChange={e=>onChange(e.target.value)} className="w-full min-w-0 bg-transparent text-sm outline-none sm:w-56"/></label>;}
export function Status({value}:{value:string}) {
 const tone=['PAID','COMPLETED','SUCCESS'].includes(value)?'success':['FAILED','RETURNED','CANCELLED','DENIED','BLOCKED'].includes(value)?'danger':['SENT','PENDING','UNCLAIMED'].includes(value)?'attention':'neutral';
 return <span className="ui-status" data-tone={tone}>{value.toLowerCase().replaceAll('_',' ')}</span>;
}
export function Empty({title,description}:{title:string;description:string}) {return <div className="ui-empty"><h3 className="text-sm font-semibold">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p></div>;}
