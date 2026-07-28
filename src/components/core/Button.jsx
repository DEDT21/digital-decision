import React from 'react';

const base = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
  font: 'var(--text-button)', fontFamily: 'var(--font-head)', textDecoration: 'none',
  borderRadius: 'var(--radius-pill)', border: '1px solid transparent',
  cursor: 'pointer', transition: 'var(--transition-interactive)', whiteSpace: 'nowrap'
};

const sizes = {
  md: { padding: '14px 28px', fontSize: 'var(--fs-body)' },
  sm: { padding: '10px 20px', fontSize: '14px' },
  lg: { padding: '18px 36px', fontSize: 'var(--fs-lead)' }
};

const variants = {
  primary: { background: 'var(--action-primary-bg)', color: 'var(--action-primary-fg)' },
  secondary: { background: 'transparent', color: 'var(--action-secondary-fg)', borderColor: 'var(--dd-ink)', fontWeight: 'var(--fw-medium)' },
  ghostDark: { background: 'transparent', color: 'var(--dd-white)', borderColor: 'var(--dd-border-dark)', fontWeight: 'var(--fw-medium)' }
};

/* Arrow CTA: pill with a round Ink badge that travels right→left on hover while the arrow
   turns 45° (↗ becomes →). The label's side paddings swap in the same 500ms so the button
   keeps its width — motion without restlessness. Geometry per size: badge = height − 8
   (4px inset all around, like the reference), far-side padding = badge + inset + text gap. */
const arrowSizes = {
  sm: { h: 40, circle: 32, ps: 18, pe: 46 },
  md: { h: 48, circle: 40, ps: 24, pe: 56 },
  lg: { h: 56, circle: 48, ps: 28, pe: 66 }
};

const ARROW_STYLE_ID = 'dd-btn-arrow-styles';

function ensureArrowStyles() {
  if (typeof document === 'undefined' || document.getElementById(ARROW_STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = ARROW_STYLE_ID;
  el.textContent =
    '.dd-btn-arrow{position:relative;overflow:hidden;height:var(--btn-h);padding:0 var(--btn-pe) 0 var(--btn-ps);transition:padding 500ms cubic-bezier(0.23,1,0.32,1),background-color 160ms cubic-bezier(0.23,1,0.32,1),color 160ms cubic-bezier(0.23,1,0.32,1)}'
    + '.dd-btn-arrow:hover{padding:0 var(--btn-ps) 0 var(--btn-pe)}'
    + '.dd-btn-arrow-label{position:relative;z-index:1}'
    + '.dd-btn-arrow-circle{position:absolute;z-index:0;right:4px;top:50%;width:var(--btn-circle);height:var(--btn-circle);margin-top:calc(var(--btn-circle) / -2);border-radius:var(--radius-round);background:var(--dd-ink);color:var(--dd-lime);display:grid;place-items:center;transition:right 500ms cubic-bezier(0.23,1,0.32,1),transform 500ms cubic-bezier(0.23,1,0.32,1)}'
    + '.dd-btn-arrow:hover .dd-btn-arrow-circle{right:calc(100% - var(--btn-circle) - 4px);transform:rotate(45deg)}'
    + '@media (prefers-reduced-motion: reduce){.dd-btn-arrow,.dd-btn-arrow-circle{transition:none}.dd-btn-arrow:hover{padding:0 var(--btn-pe) 0 var(--btn-ps)}.dd-btn-arrow:hover .dd-btn-arrow-circle{right:4px;transform:none}}';
  document.head.appendChild(el);
}

function ArrowUpRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

export function Button({ variant = 'primary', size = 'md', disabled = false, href, onClick, type, arrow = false, children, style }) {
  React.useEffect(() => { if (arrow) ensureArrowStyles(); }, [arrow]);
  const Tag = href && !disabled ? 'a' : 'button';

  if (arrow) {
    const g = arrowSizes[size] || arrowSizes.md;
    return (
      <Tag
        href={href}
        onClick={onClick}
        type={Tag === 'button' ? type : undefined}
        disabled={Tag === 'button' ? disabled : undefined}
        className="dd-btn-arrow"
        style={{ ...base, fontSize: sizes[size].fontSize, ...variants[variant], opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto',
                 '--btn-h': g.h + 'px', '--btn-circle': g.circle + 'px', '--btn-ps': g.ps + 'px', '--btn-pe': g.pe + 'px', ...style }}
      >
        <span className="dd-btn-arrow-label">{children}</span>
        <span className="dd-btn-arrow-circle" aria-hidden="true"><ArrowUpRight /></span>
      </Tag>
    );
  }

  return (
    <Tag
      href={href}
      onClick={onClick}
      type={Tag === 'button' ? type : undefined}
      disabled={Tag === 'button' ? disabled : undefined}
      style={{ ...base, ...sizes[size], ...variants[variant], opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto', ...style }}
    >
      {children}
    </Tag>
  );
}
