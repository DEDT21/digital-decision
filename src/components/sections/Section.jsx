import React from 'react';

export function Section({ tone = 'paper', id, children, style, innerStyle }) {
  const tones = {
    paper: { background: 'var(--surface-page)', color: 'var(--text-primary)' },
    white: { background: 'var(--surface-card)', color: 'var(--text-primary)' },
    ink: { background: 'var(--surface-dark)', color: 'var(--text-on-dark)' }
  };
  return (
    <section id={id} className={'dd-section dd-tone-' + tone} style={{ padding: 'var(--pad-section-y) var(--pad-page-x)', ...tones[tone], ...style }}>
      <div style={{ maxWidth: 'var(--measure-wide)', margin: '0 auto', ...innerStyle }}>{children}</div>
    </section>
  );
}
