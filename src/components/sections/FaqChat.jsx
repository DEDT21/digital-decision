import React from 'react';

/* Chat-style FAQ: the question is a message bubble, the answer replies underneath as an Ink
   bubble. Bubbles use one squared corner on the speaking side, everything else 16px.
   Open/close animates with grid-template-rows (no dependencies). Emoji stickers from the
   original reference are deliberately dropped — the brand does not use emoji. */
export function FaqChat({ items = [], timestamp, defaultOpenId, columnsGap, style }) {
  const [open, setOpen] = React.useState(defaultOpenId != null ? String(defaultOpenId) : null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: columnsGap || 'var(--space-4)', ...style }}>
      {timestamp ? (
        <div style={{ font: 'var(--text-caption)', textTransform: 'uppercase', letterSpacing: 'var(--ls-tag)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>{timestamp}</div>
      ) : null}

      {items.map((item, i) => {
        const id = String(item.id != null ? item.id : i);
        const isOpen = open === id;
        return (
          <div key={id}>
            <button
              onClick={() => setOpen(isOpen ? null : id)}
              aria-expanded={isOpen}
              style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left', width: '100%' }}
            >
              <span style={{ display: 'inline-block', font: 'var(--text-copy)', fontFamily: 'var(--font-head)', fontWeight: 'var(--fw-medium)', fontSize: '20px', lineHeight: 1.35, padding: '12px 20px', borderRadius: 'var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-xs)', background: isOpen ? 'var(--surface-accent)' : 'var(--surface-card)', border: isOpen ? '1px solid var(--dd-lime)' : 'var(--border-default)', color: 'var(--dd-ink)', transition: 'var(--transition-interactive)' }}>
                {item.question}
              </span>
              <span aria-hidden="true" style={{ flex: '0 0 32px', width: 32, height: 32, borderRadius: 'var(--radius-pill)', border: isOpen ? 'none' : 'var(--border-default)', background: isOpen ? 'var(--dd-ink)' : 'transparent', color: isOpen ? 'var(--dd-white)' : 'var(--text-secondary)', display: 'grid', placeItems: 'center', font: 'var(--text-copy)', transition: 'var(--transition-interactive)' }}>
                {isOpen ? '–' : '+'}
              </span>
            </button>

            <div style={{ display: 'grid', gridTemplateRows: isOpen ? '1fr' : '0fr', opacity: isOpen ? 1 : 0, transition: 'grid-template-rows var(--dur-slow) var(--ease-out), opacity var(--dur-base) var(--ease-standard)' }}>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ paddingLeft: 'var(--space-12)', paddingTop: 'var(--space-3)' }}>
                  <div style={{ display: 'inline-block', maxWidth: 520, background: 'var(--surface-dark)', color: 'var(--text-on-dark)', font: 'var(--text-copy)', padding: '14px 20px', borderRadius: 'var(--radius-xl) var(--radius-xl) var(--radius-xs) var(--radius-xl)', textWrap: 'pretty' }}>
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
