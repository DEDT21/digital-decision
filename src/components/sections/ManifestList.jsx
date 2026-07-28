import React from 'react';

/* Six beliefs as single-line typographic statements. The line nearest the viewport centre goes
   Lime while scrolling; hovering a line takes over on pointer devices. */
export function ManifestList({ lines = [], tone = 'light', style }) {
  const dark = tone === 'dark';
  const refs = React.useRef([]);
  const [active, setActive] = React.useState(0);
  const [hover, setHover] = React.useState(-1);

  React.useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const mid = (window.innerHeight || 0) / 2;
      let best = 0; let bestDist = Infinity;
      refs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      setActive(best);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(read); };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { if (frame) cancelAnimationFrame(frame); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [lines.length]);

  const current = hover > -1 ? hover : active;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', ...style }}>
      {lines.map((line, i) => {
        const on = i === current;
        return (
          <div key={line} ref={(el) => { refs.current[i] = el; }}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(-1)}
            style={{ padding: 'var(--space-6) 0', borderTop: i === 0 ? 'none' : (dark ? 'var(--border-on-dark)' : 'var(--border-default)'), font: 'var(--text-h2)', fontFamily: 'var(--font-head)', fontWeight: 'var(--fw-medium)', fontSize: 'var(--fs-h2-sm)', lineHeight: 1.2, letterSpacing: 'var(--ls-heading)', color: on ? (dark ? 'var(--dd-lime)' : 'var(--dd-ink)') : (dark ? 'var(--text-on-dark-secondary)' : 'var(--text-secondary)'), transition: 'color var(--dur-base) var(--ease-standard)' }}>
            {dark || !on ? line : <span style={{ background: 'var(--highlight-mark)' }}>{line}</span>}
          </div>
        );
      })}
    </div>
  );
}
