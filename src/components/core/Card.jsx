import React from 'react';

export function Card({ tone = 'white', padding, children, style }) {
  const tones = {
    white: { background: 'var(--surface-card)', border: 'var(--border-default)', color: 'var(--text-primary)' },
    paper: { background: 'var(--surface-page)', border: 'var(--border-default)', color: 'var(--text-primary)' },
    ink: { background: 'var(--surface-dark)', border: 'none', color: 'var(--text-on-dark)' },
    lime: { background: 'var(--surface-accent)', border: 'none', color: 'var(--dd-ink)' }
  };
  return (
    <div style={{ borderRadius: 'var(--radius-xl)', padding: padding || 'var(--pad-card)', ...tones[tone], ...style }}>
      {children}
    </div>
  );
}
