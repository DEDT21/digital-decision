import React from 'react';
import './LogoMarquee.css';

/* Endlos laufendes Kundenband. Ein Item ist ein String oder { name, logo?, height?, w?, h? }:
   mit `logo` ersetzt das Bild den Namen; `height` ist die Anzeigehöhe (optische Angleichung),
   `w`/`h` die Pixelmaße der Datei, daraus entstehen width/height-Attribute (kein CLS, und die
   Breite steht schon vor dem Laden fest).

   A11y: Die laufende Spur ist rein visuell (aria-hidden, Bilder mit alt=""). Screenreader
   bekommen genau EINE Liste der Marken (sr-only). Bewegung: hält an bei `paused` (Pause-Button
   der Seite), außerhalb des Viewports, bei Hover und Fokus; bei prefers-reduced-motion zeigt
   das CSS eine statische, zentrierte Reihe ohne Duplikate.

   Nahtlosigkeit: Die animierte Einheit ist die halbe Spur, ein Durchlauf muss also mindestens
   so breit sein wie der Container. Die Liste wird dafür so oft wiederholt wie nötig, die Dauer
   wächst mit, das Tempo bleibt gleich. Gemessen wird nur wachsend (nie schrumpfend) und mit
   Deckel, damit Messung → Re-Render → Messung nicht pendeln kann. */

const useIsoLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;
const MAX_REPEATS = 12;

export function LogoMarquee({ items = [], tone = 'dark', speed = 32, logoHeight = 30, gap = 'var(--space-14)', fade = 72, paused = false, id, style }) {
  const wrapRef = React.useRef(null);
  const trackRef = React.useRef(null);
  const [repeats, setRepeats] = React.useState(1);
  const repeatsRef = React.useRef(1);
  const measureRef = React.useRef(null);

  useIsoLayoutEffect(() => {
    const measure = () => {
      const wrap = wrapRef.current;
      const track = trackRef.current;
      if (!wrap || !track) return;
      /* Bilder ohne width-Attribut sind vor dem Laden breitenlos: dann erst nach onLoad messen. */
      const imgs = track.querySelectorAll('img:not([width])');
      for (let i = 0; i < imgs.length; i++) if (!imgs[i].complete) return;

      const current = repeatsRef.current;
      const unit = track.getBoundingClientRect().width / 2;
      if (unit < 1) return;
      const passW = unit / current;
      const wrapW = wrap.clientWidth;
      if (passW < 1 || !wrapW) return;
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

  /* Außerhalb des Viewports anhalten */
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver((entries) => {
      if (entries[entries.length - 1].isIntersecting) el.removeAttribute('data-offscreen');
      else el.setAttribute('data-offscreen', '');
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const remeasure = () => { if (measureRef.current) measureRef.current(); };

  const entries = items.map((item) => (typeof item === 'string' ? { name: item } : item));
  const one = [];
  for (let i = 0; i < repeats; i++) one.push(...entries);
  const run = one.concat(one);

  return (
    <div ref={wrapRef} id={id} className={'dd-marquee dd-marquee--' + (tone === 'dark' ? 'dark' : 'light')}
         data-paused={paused ? '' : undefined}
         style={{ '--dd-marquee-fade': fade + 'px', '--dd-marquee-gap': gap, ...style }}>
      <ul className="dd-sr-only">
        {entries.map((entry) => <li key={entry.name}>{entry.name}</li>)}
      </ul>
      <div ref={trackRef} className="dd-marquee-track" aria-hidden="true"
           style={{ '--dd-marquee-duration': (speed * repeats) + 's' }}>
        {run.map((entry, i) => {
          const h = entry.height || logoHeight;
          return (
            <span key={entry.name + '-' + i} className={'dd-marquee-item' + (i >= entries.length ? ' dd-marquee-dup' : '')}>
              {entry.logo ? (
                <img className="dd-marquee-logo" src={entry.logo} alt="" onLoad={remeasure}
                     loading="lazy" decoding="async" draggable="false"
                     width={entry.w && entry.h ? Math.round(h * entry.w / entry.h) : undefined}
                     height={entry.w && entry.h ? h : undefined}
                     style={{ '--dd-logo-h': h + 'px' }} />
              ) : (
                <span className="dd-marquee-name">{entry.name}</span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
