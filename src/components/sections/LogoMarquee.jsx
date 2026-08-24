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
  const repeatsRef = React.useRef(1);
  const measureRef = React.useRef(null);

  /* Messung, drei Schutzschichten gegen die Endlosschleife, die hier möglich ist
     (setRepeats → Re-Render → Effekt neu → Messung → setRepeats → …):

     1. Die Messung liest den aktuellen Stand aus `repeatsRef`, nicht aus der Closure. Vorher
        hing `passW = unit / repeats` an dem `repeats`, das beim Anlegen der Funktion galt.
        `measureRef` überlebt den Render aber (Bilder rufen es im onLoad auf), sodass eine
        alte Zahl auf ein bereits neu aufgebautes DOM traf — das Ergebnis pendelte.
        Dazu `getBoundingClientRect().width` statt `scrollWidth`: letzteres rundet auf ganze
        Pixel und kann `Math.ceil` an der Grenze zusätzlich kippen lassen.
     2. Nur wachsen, nie schrumpfen. Ein Durchlauf zu viel ist unsichtbar (die Bedingung
        lautet „mindestens so breit wie der Container"), ein Pendeln wäre fatal. Damit ist
        die Folge monoton und endet zwangsläufig — zusätzlich bei MAX_REPEATS hart gedeckelt.
     3. Der Effekt hängt nicht mehr an `repeats`, und der ResizeObserver beobachtet nur noch
        den Wrapper, nicht den Track. Vorher änderte jede Änderung von `repeats` die
        Track-Breite, was den Observer erneut feuern ließ — die Rückkopplung selbst.
     Der aktuelle Wert liegt in einer Ref, damit `measure` ihn ohne Neuaufbau des Effekts liest. */
  const MAX_REPEATS = 12;

  React.useLayoutEffect(() => {
    const measure = () => {
      const wrap = wrapRef.current;
      const track = trackRef.current;
      if (!wrap || !track) return;
      /* Erst messen, wenn alle Logos geladen sind: vorher sind die <img> nahezu breitenlos,
         eine Passage wirkt viel zu schmal und es würden unnötig viele Durchläufe angelegt —
         die wegen der Monotonie oben nie wieder verschwinden. `complete` wird auch bei einem
         Ladefehler true, ein fehlendes Logo blockiert die Messung also nicht dauerhaft.
         Den Nachschlag übernimmt `remeasure` am onLoad jedes Bildes. */
      const imgs = track.querySelectorAll('img');
      for (let i = 0; i < imgs.length; i++) if (!imgs[i].complete) return;

      const current = repeatsRef.current;
      const unit = track.getBoundingClientRect().width / 2;  /* the track always holds two identical units */
      if (unit < 1) return;
      const passW = unit / current;                  /* width of one pass through the list */
      const wrapW = wrap.clientWidth;
      if (passW < 1 || !wrapW) return;
      /* 1px Toleranz, damit Sub-Pixel-Differenzen keinen weiteren Durchlauf erzwingen */
      const needed = Math.max(1, Math.ceil((wrapW - 1) / passW));
      if (needed > current) {
        repeatsRef.current = Math.min(needed, MAX_REPEATS);
        if (repeatsRef.current !== current) setRepeats(repeatsRef.current);
      }
    };
    measureRef.current = measure;
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    if (ro && wrapRef.current) ro.observe(wrapRef.current);
    return () => { if (ro) ro.disconnect(); };
  }, [items.length]);

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
              style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', height: (entry.height || logoHeight) + 'px' }}>
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
