import React from 'react';

export function Kicker({ tone = 'mark', children, style }) {
  const shared = {
    display: 'inline-block', font: 'var(--text-kicker)', fontFamily: 'var(--font-head)',
    fontWeight: 'var(--fw-medium)', fontSize: '14px', textTransform: 'uppercase',
    letterSpacing: 'var(--ls-kicker)'
  };
  const tones = {
    mark: { background: 'linear-gradient(transparent 58%, var(--dd-lime) 58%)', color: 'var(--dd-ink)' },
    pill: { background: 'var(--surface-accent)', color: 'var(--dd-ink)', padding: '4px 12px', borderRadius: 'var(--radius-pill)' },
    limeText: { color: 'var(--dd-lime)' },
    inkPill: { background: 'var(--dd-ink)', color: 'var(--dd-lime)', padding: '4px 12px', borderRadius: 'var(--radius-pill)' },
    plain: { color: 'var(--text-secondary)' },
    /* white type with the Lime marker under it — the brand's underline treatment on Ink */
    underline: { color: 'var(--dd-white)', background: 'linear-gradient(transparent 68%, var(--dd-lime) 68%, var(--dd-lime) 92%, transparent 92%)' }
  };
  return <span style={{ ...shared, ...tones[tone], ...style }}>{children}</span>;
}
