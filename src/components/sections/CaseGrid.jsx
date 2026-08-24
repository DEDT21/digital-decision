import React from 'react';

/* Reference cases on Ink, in one row, with a pointer-following Lime edge light.
   How the glow is built (and why): the card is a 1px-padded shell whose inside is Ink, and the
   light is a fixed-size radial sprite moved with translate3d only — no animated gradient
   positions, no repaints, no motion library. Only the 1px ring and a faint inner wash show it.
   The sprite chases the pointer with a lerp so it has momentum instead of sticking to the cursor,
   and the whole effect is gated to fine pointers: on touch there is no pointer to follow. */

const STYLE_ID = 'dd-case-grid-styles';
const FINE_POINTER = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  ? window.matchMedia('(hover: hover) and (pointer: fine)').matches : false;

function ensureStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent =
    '.dd-case{opacity:0;transform:translateY(8px);transition:opacity 320ms cubic-bezier(0.23,1,0.32,1),transform 320ms cubic-bezier(0.23,1,0.32,1)}'
    + '.dd-case[data-shown="1"]{opacity:1;transform:translateY(0)}'
    + '.dd-case-light{transition:opacity 300ms cubic-bezier(0.23,1,0.32,1)}'
    + '@media (prefers-reduced-motion: reduce){.dd-case{opacity:1;transform:none;transition:none}}';
  document.head.appendChild(el);
}

export function CaseGrid({ cases = [], style }) {
  const rowRef = React.useRef(null);
  const [stacked, setStacked] = React.useState(false);
  const cardRefs = React.useRef([]);
  const lightRefs = React.useRef([]);
  const state = React.useRef([]);

  React.useEffect(ensureStyles, []);

  /* One row is the design intent, so the column count is pinned — auto-fit would silently drop
     a column whenever the container is a few px short. Only genuinely narrow containers stack. */
  React.useEffect(() => {
    const el = rowRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setStacked(el.clientWidth < 720));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* one-time staggered reveal — decorative, never blocks anything */
  React.useEffect(() => {
    const nodes = cardRefs.current.filter(Boolean);
    if (!nodes.length) return;
    if (typeof IntersectionObserver === 'undefined') { nodes.forEach((n) => n.setAttribute('data-shown', '1')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const i = nodes.indexOf(entry.target);
        setTimeout(() => entry.target.setAttribute('data-shown', '1'), Math.max(0, i) * 60);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.25 });
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [cases.length]);

  /* pointer-following light */
  React.useEffect(() => {
    if (!FINE_POINTER) return;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    state.current = cases.map(() => ({ x: 0, y: 0, tx: 0, ty: 0, on: 0 }));
    let raf = 0; let idle = true;

    const onMove = (e) => {
      idle = false;
      cardRefs.current.forEach((card, i) => {
        if (!card || !state.current[i]) return;
        const r = card.getBoundingClientRect();
        const near = e.clientX > r.left - 96 && e.clientX < r.right + 96 && e.clientY > r.top - 96 && e.clientY < r.bottom + 96;
        const s = state.current[i];
        s.on = near ? 1 : 0;
        if (near) { s.tx = e.clientX - r.left; s.ty = e.clientY - r.top; }
      });
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const tick = () => {
      raf = 0; let moving = false;
      state.current.forEach((s, i) => {
        const light = lightRefs.current[i];
        if (!light) return;
        s.x += (s.tx - s.x) * 0.18;
        s.y += (s.ty - s.y) * 0.18;
        light.style.transform = 'translate3d(' + (s.x - 220) + 'px,' + (s.y - 220) + 'px,0)';
        light.style.opacity = s.on ? '1' : '0';
        if (Math.abs(s.tx - s.x) > 0.5 || Math.abs(s.ty - s.y) > 0.5) moving = true;
      });
      if (moving && !idle) raf = requestAnimationFrame(tick);
    };

    const onLeave = () => {
      idle = true;
      state.current.forEach((s, i) => { s.on = 0; const l = lightRefs.current[i]; if (l) l.style.opacity = '0'; });
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [cases.length]);

  return (
    <div ref={rowRef} style={{ display: 'grid', gridTemplateColumns: stacked ? 'minmax(0, 1fr)' : 'repeat(' + Math.max(cases.length, 1) + ', minmax(0, 1fr))', gap: 'var(--gap-grid)', alignItems: 'stretch', ...style }}>
      {cases.map((c, i) => (
        <article key={c.client} ref={(el) => { cardRefs.current[i] = el; }} className="dd-case"
          style={{ position: 'relative', padding: 1, borderRadius: 'var(--radius-xl)', background: 'var(--dd-border-dark)', overflow: 'hidden', isolation: 'isolate' }}>

          {/* the edge light: a sprite that only shows through the 1px shell */}
          <span ref={(el) => { lightRefs.current[i] = el; }} className="dd-case-light" aria-hidden="true"
            style={{ position: 'absolute', top: 0, left: 0, width: 440, height: 440, borderRadius: '50%', opacity: 0, pointerEvents: 'none', background: 'radial-gradient(circle, var(--dd-lime) 0%, rgba(198,240,75,0.35) 38%, rgba(198,240,75,0) 68%)', willChange: 'transform, opacity' }} />

          <div data-reveal data-reveal-delay={i * 80} style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', background: 'var(--surface-dark)', borderRadius: 15, padding: stacked ? 'var(--pad-card)' : 'var(--space-6)' }}>
            <header style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
              <span style={{ font: 'var(--text-h3)', fontFamily: 'var(--font-head)', fontWeight: 'var(--fw-bold)', fontSize: '20px', letterSpacing: 'var(--ls-heading)', color: 'var(--text-on-dark)' }}>{c.client}</span>
              <span style={{ font: 'var(--text-caption)', color: 'var(--text-on-dark-secondary)', textAlign: 'right' }}>{c.industry}</span>
            </header>

            <div style={{ height: 1, background: 'var(--dd-border-dark)' }} />

            <div style={{ font: 'var(--text-h3)', fontFamily: 'var(--font-head)', fontWeight: 'var(--fw-medium)', fontSize: '23px', lineHeight: 1.25, letterSpacing: 'var(--ls-heading)', color: 'var(--dd-lime)', marginTop: 'var(--space-2)' }}>{c.result}</div>

            <p style={{ font: 'var(--text-copy)', fontSize: '15px', color: 'var(--text-on-dark-secondary)', margin: 0, textWrap: 'pretty' }}>{c.body}</p>

            {c.tags && c.tags.length ? (
              <div style={{ marginTop: 'auto', paddingTop: 'var(--space-6)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {c.tags.map((tag) => (
                  <span key={tag} style={{ font: 'var(--text-caption)', color: 'var(--text-on-dark-secondary)', border: 'var(--border-on-dark)', borderRadius: 'var(--radius-pill)', padding: '4px 12px', whiteSpace: 'nowrap' }}>{tag}</span>
                ))}
              </div>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
