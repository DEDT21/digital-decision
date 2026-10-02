import React from 'react';
import './WordRotator.css';

/* Vertikaler Wortwechsel für die Hero-Headline. Die Wortliste wird als EINE durchgehende
   Folge (list × loops) angelegt, damit jeder Wechsel in dieselbe Richtung läuft, und die
   Rotation bleibt auf dem letzten Wort der Folge stehen (holdLast).

   SSR/Prerender: Der erste Render zeigt deterministisch Index 0. Erst nach dem Hydrieren
   startet der Timer, und nur solange der Rotator im Viewport liegt, der Tab sichtbar ist und
   keine reduzierte Bewegung gewünscht ist. Bei prefers-reduced-motion zeigt das CSS ab dem
   ersten Frame statisch das letzte Wort. Positionen kommen als data-pos, die Bewegung selbst
   steht in WordRotator.css (keine Inline-Transforms). Der ganze Rotator ist aria-hidden: Wer
   ihn einsetzt, liefert den lesbaren Satz separat (siehe Hero in Home.jsx). */

export function WordRotator({ words = [], interval = 1600, tone = 'lime', holdLast = true, loops = 2, style, className }) {
  const rootRef = React.useRef(null);
  const [step, setStep] = React.useState(0);
  const [running, setRunning] = React.useState(false);

  const seq = [];
  for (let l = 0; l < Math.max(loops, 1); l++) seq.push(...words);
  const total = Math.max(seq.length - 1, 0);
  const current = seq.length ? (holdLast ? Math.min(step, total) : step % seq.length) : 0;

  /* Läuft nur, wenn sichtbar: Viewport (IntersectionObserver), Tab (visibilitychange)
     und Bewegungspräferenz werden zu einem Flag zusammengefasst. */
  React.useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;
    const mq = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    let inView = true;
    let reduced = !!(mq && mq.matches);
    const update = () => setRunning(inView && !reduced && document.visibilityState !== 'hidden');

    const io = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver((entries) => { inView = entries[entries.length - 1].isIntersecting; update(); })
      : null;
    if (io) io.observe(el);
    const onMq = () => { reduced = mq.matches; update(); };
    if (mq && mq.addEventListener) mq.addEventListener('change', onMq);
    document.addEventListener('visibilitychange', update);
    update();

    return () => {
      if (io) io.disconnect();
      if (mq && mq.removeEventListener) mq.removeEventListener('change', onMq);
      document.removeEventListener('visibilitychange', update);
    };
  }, []);

  React.useEffect(() => {
    if (!running || !seq.length) return undefined;
    if (holdLast && step >= total) return undefined;
    const id = window.setTimeout(() => setStep((s) => (holdLast ? Math.min(s + 1, total) : s + 1)), interval);
    return () => window.clearTimeout(id);
  }, [running, step, total, interval, seq.length, holdLast]);

  return (
    <span ref={rootRef} className={'dd-rotator dd-rotator--' + tone + (className ? ' ' + className : '')} aria-hidden="true" style={style}>
      {seq.map((word, i) => (
        <span key={word + '-' + i} className="dd-rotator-word" data-word={word}
              data-pos={i === current ? 'current' : (i < current ? 'before' : 'after')} />
      ))}
    </span>
  );
}
