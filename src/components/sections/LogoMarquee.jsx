import React from 'react';

/* Continuously scrolling client band. Ready for real logo files: pass `logo` on an item and the
   image replaces the type — nothing else changes. Until then the client name is set in Space
   Grotesk, which is how the brand handles a missing mark.
   The motion is a CSS keyframe animation (runs off the main thread, unlike a rAF loop), linear
   because constant motion must not accelerate, and it pauses on hover so names stay readable.
   Seamlessness rule: the animated unit is half the track, so ONE pass must be at least as wide as
   the container — otherwise a gap opens on the right before the loop resets. The list is therefore
   repeated as often as the measured widths require, and the duration scales with it so the band
   always moves at the same speed. */

const STYLE_ID = 'dd-logo-marquee-keyframes';

function ensureKeyframes() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = '@keyframes dd-marquee{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}'
    + '.dd-marquee-track{animation:dd-marquee var(--dd-marquee-duration,32s) linear infinite;will-change:transform}'
    + '.dd-marquee:hover .dd-marquee-track{animation-play-state:paused}'
    + '@media (prefers-reduced-motion: reduce){.dd-marquee-track{animation:none}}';
  document.head.appendChild(el);
}

export function LogoMarquee({ items = [], tone = 'dark', speed = 32, logoHeight = 30, gap = 'var(--space-14)', fade = 72, style }) {
  React.useEffect(ensureKeyframes, []);
  const dark = tone === 'dark';
  const wrapRef = React.useRef(null);
  const trackRef = React.useRef(null);
  const [repeats, setRepeats] = React.useState(1);
  const measureRef = React.useRef(null);

  React.useLayoutEffect(() => {
    const measure = () => {
      const wrap = wrapRef.current;
      const track = trackRef.current;
      if (!wrap || !track) return;
      const unit = track.scrollWidth / 2;           /* the track always holds two identical units */
      if (!unit) return;
      const passW = unit / repeats;                  /* width of one pass through the list */
      const needed = Math.max(1, Math.ceil(wrap.clientWidth / passW));
      if (needed !== repeats) setRepeats(needed);
    };
    measureRef.current = measure;
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (ro) {
      if (wrapRef.current) ro.observe(wrapRef.current);
      if (trackRef.current) ro.observe(trackRef.current);
    }
    return () => { if (ro) ro.disconnect(); };
  }, [repeats, items.length]);

  const remeasure = () => { if (measureRef.current) measureRef.current(); };

  const one = [];
  for (let i = 0; i < repeats; i++) one.push(...items);
  const run = one.concat(one);

  return (
    <div ref={wrapRef} className="dd-marquee" style={{ position: 'relative', overflow: 'hidden',
      maskImage: 'linear-gradient(to right, transparent, #000 ' + fade + 'px, #000 calc(100% - ' + fade + 'px), transparent)',
      WebkitMaskImage: 'linear-gradient(to right, transparent, #000 ' + fade + 'px, #000 calc(100% - ' + fade + 'px), transparent)',
      ...style }}>
      {/* padding-right = one gap so the track is exactly two equal passes and the −50%
          keyframe lands on the duplicate boundary — without it the loop jumps half a gap */}
      <div ref={trackRef} className="dd-marquee-track" style={{ display: 'flex', alignItems: 'center', gap, paddingRight: gap, width: 'max-content', '--dd-marquee-duration': (speed * repeats) + 's' }}>
        {run.map((item, i) => {
          const entry = typeof item === 'string' ? { name: item } : item;
          return (
            <span key={entry.name + '-' + i} aria-hidden={i >= one.length}
              style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', height: logoHeight + 'px' }}>
              {entry.logo ? (
                <img src={entry.logo} alt={entry.name} onLoad={remeasure} loading="lazy" decoding="async"
                     style={{ height: (entry.height || logoHeight) + 'px', width: 'auto', display: 'block',
                       filter: dark ? 'grayscale(1) brightness(0) invert(1)' : 'grayscale(1) brightness(0)',
                       opacity: dark ? 0.8 : 0.65 }} />
              ) : (
                <span style={{ font: 'var(--text-h3)', fontFamily: 'var(--font-head)', fontWeight: 'var(--fw-medium)', fontSize: '25px', letterSpacing: 'var(--ls-heading)', whiteSpace: 'nowrap', color: dark ? 'var(--text-on-dark-secondary)' : 'var(--text-secondary)' }}>
                  {entry.name}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
