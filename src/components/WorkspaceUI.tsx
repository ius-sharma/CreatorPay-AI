import type { ReactNode } from 'react';
export function BrandMark({ name }: { name: string }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase() || '?';
  const tone = Array.from(name).reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % 3;
  return <span aria-hidden="true" className={`studio-brand studio-brand-${tone}`}>{initials}</span>;
}
export function WorkspaceBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'attention' }) {
  return <span className="ui-status" data-tone={tone}>{children}</span>;
}
export function SectionHeading({ title, count, children }: { title: string; count?: number; children?: ReactNode }) {
  return <div className="studio-section-heading"><h2>{title}{count !== undefined && <span className="studio-count">{count}</span>}</h2>{children}</div>;
}
export function WorkspaceEmpty({ icon, title, description, children }: { icon: ReactNode; title: string; description: string; children?: ReactNode }) {
  return <div className="studio-empty"><span className="studio-empty-icon" aria-hidden="true">{icon}</span><h3>{title}</h3><p>{description}</p>{children}</div>;
}
