import React from 'react';
import { Kicker } from '../core/Kicker.jsx';

export function SectionHeading({ kicker, title, lead, tone = 'light', kickerTone, align = 'left', style }) {
  const dark = tone === 'dark';
  return (
    <header style={{ textAlign: align, marginBottom: 'var(--space-12)', ...style }}>
      {kicker ? <div style={{ marginBottom: 'var(--space-5)' }}><Kicker tone={kickerTone || (dark ? 'limeText' : 'mark')}>{kicker}</Kicker></div> : null}
      <h2 style={{ font: 'var(--text-h2)', letterSpacing: 'var(--ls-heading)', margin: 0, color: dark ? 'var(--text-on-dark)' : 'var(--text-primary)' }}>{title}</h2>
      {lead ? <p style={{ font: 'var(--text-lead)', color: dark ? 'var(--text-on-dark-secondary)' : 'var(--text-secondary)', maxWidth: 'var(--measure)', margin: 'var(--space-5) 0 0', marginInline: align === 'center' ? 'auto' : undefined, textWrap: 'pretty' }}>{lead}</p> : null}
    </header>
  );
}
