import React from 'react';
import './ManifestList.css';

/* Six beliefs as single-line typographic statements. The line nearest the viewport centre is
   active while scrolling; hovering a line takes over on mouse devices (touch taps would leave a
   sticky hover behind, so only pointerType "mouse" counts).
   The scroll listener is attached only while the list is on screen. */
export function ManifestList({ lines = [], tone = 'light', style }) {
  const listRef = React.useRef(null);
  const [active, setActive] = React.useState(0);
  const [hover, setHover] = React.useState(-1);

  React.useEffect(() => {
    const list = listRef.current;
    if (!list || typeof IntersectionObserver === 'undefined') return undefined;
    let frame = 0;
    let current = 0;
    let listening = false;

    const read = () => {
      frame = 0;
      const mid = window.innerHeight / 2;
      let best = current;
      let bestDist = Infinity;
      Array.prototype.forEach.call(list.children, (el, i) => {
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - mid);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      if (best !== current) { current = best; setActive(best); }
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(read); };
    const listen = (on) => {
      if (on === listening) return;
      listening = on;
      if (on) {
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        onScroll();
      } else {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
    };

    const io = new IntersectionObserver(([entry]) => listen(entry.isIntersecting));
    io.observe(list);
    return () => {
      io.disconnect();
      listen(false);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [lines.length]);

  const current = hover > -1 ? hover : active;

  return (
    <ul ref={listRef} className="dd-manifest" data-tone={tone === 'dark' ? 'dark' : 'light'} style={style}>
      {lines.map((line, i) => (
        <li key={line} className="dd-manifest-line" data-active={i === current ? '1' : '0'}
          data-reveal data-reveal-delay={i * 60}
          onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHover(i); }}
          onPointerLeave={(e) => { if (e.pointerType === 'mouse') setHover(-1); }}>
          <span>{line}</span>
        </li>
      ))}
    </ul>
  );
}
