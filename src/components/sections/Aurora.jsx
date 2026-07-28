import React from 'react';

/* Aurora hero background, brand version: soft Lime light bands drifting across Ink.
   Built as two blurred gradient sheets moved with transform only (translate3d + rotate) —
   the usual approach animates background-position, which repaints the whole layer every frame.
   A radial mask fades the light out toward the opposite corner so the copy side stays calm. */

const STYLE_ID = 'dd-aurora-styles';

function ensureStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent =
    '@keyframes dd-aurora-a{from{transform:translate3d(-8%,-4%,0) rotate(-4deg)}to{transform:translate3d(8%,4%,0) rotate(4deg)}}'
    + '@keyframes dd-aurora-b{from{transform:translate3d(6%,3%,0) rotate(5deg) scale(1.05)}to{transform:translate3d(-6%,-3%,0) rotate(-5deg) scale(1.05)}}'
    + '.dd-aurora-a{animation:dd-aurora-a var(--dd-aurora-speed,42s) cubic-bezier(0.45,0,0.55,1) infinite alternate;will-change:transform}'
    + '.dd-aurora-b{animation:dd-aurora-b calc(var(--dd-aurora-speed,42s) * 1.45) cubic-bezier(0.45,0,0.55,1) infinite alternate;will-change:transform}'
    + '@media (prefers-reduced-motion: reduce){.dd-aurora-a,.dd-aurora-b{animation:none}}';
  document.head.appendChild(el);
}

/* Seam maths. The container bleeds above the hero (see `bleed`) and the mask must reach zero
   before it hits that clipped edge, otherwise overflow:hidden leaves a straight line — and on the
   hero's own top edge an opaque sticky header sits exactly on it.
   Because origin, radius and stops are all percentages of the same box, the falloff is
   height-independent: t at an edge = distance_fraction / radius_fraction. With the origin at 46%
   and a 75% radius, the top edge lands at t = 0.61 and the bottom at t = 0.72 — both past the
   58% transparent stop, so alpha is 0 at every boundary. */
const ORIGIN = {
  'top-right': 'ellipse 95% 75% at 96% 46%',
  'top-left': 'ellipse 95% 75% at 4% 46%',
  'bottom-right': 'ellipse 95% 75% at 96% 54%',
  center: 'ellipse 95% 80% at 50% 50%'
};

export function Aurora({ color = '#C6F04B', background = '#0A0A0A', origin = 'top-right', intensity = 0.42, blur = 44, speed = 42, bleed = 360, style }) {
  React.useEffect(ensureStyles, []);

  const bands = (angle, a, b) =>
    'repeating-linear-gradient(' + angle + 'deg,'
    + 'rgba(0,0,0,0) 0%, rgba(0,0,0,0) ' + a + '%,'
    + color + ' ' + (a + 3) + '%, ' + color + ' ' + (a + 7) + '%,'
    + 'rgba(0,0,0,0) ' + (a + 11) + '%, rgba(0,0,0,0) ' + b + '%)';

  const sheet = {
    position: 'absolute',
    inset: '-25%',
    filter: 'blur(' + blur + 'px)',
    pointerEvents: 'none'
  };

  const mask = 'radial-gradient(' + (ORIGIN[origin] || ORIGIN['top-right']) + ', #000 8%, rgba(0,0,0,0.32) 36%, transparent 58%)';

  return (
    <div aria-hidden="true" style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: -bleed + 'px', overflow: 'hidden', background, ...style }}>
      {/* The clipping box itself extends above the parent, so the only straight cut sits behind the
          opaque sticky header and off-screen — never on a visible boundary. */}
      <div style={{ position: 'absolute', inset: 0, maskImage: mask, WebkitMaskImage: mask, opacity: intensity, '--dd-aurora-speed': speed + 's' }}>
        <div className="dd-aurora-a" style={{ ...sheet, backgroundImage: bands(100, 6, 26), opacity: 0.85 }} />
        <div className="dd-aurora-b" style={{ ...sheet, backgroundImage: bands(72, 10, 34), opacity: 0.55, mixBlendMode: 'screen' }} />
      </div>
    </div>
  );
}
