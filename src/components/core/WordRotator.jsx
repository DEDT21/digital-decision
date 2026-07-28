import React from 'react';

/* Vertical word flip for the hero headline. The container is locked to the widest word so the
   line never reflows, the rotation stops on the last word, and prefers-reduced-motion shows
   that last word statically. No animation library — transform + token easing only. */

export function WordRotator({ words = [], interval = 1600, tone = 'lime', holdLast = true, loops = 2, style }) {
  /* step counts total flips, so the rotation can run a fixed number of passes and then rest */
  const [step, setStep] = React.useState(0);
  const [reduced, setReduced] = React.useState(false);
  const total = words.length ? loops * words.length - 1 : 0;
  const index = words.length ? Math.min(step, total) % words.length : 0;

  React.useEffect(() => {
    const mq = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    if (mq && mq.matches) { setReduced(true); setStep(total); }
  }, [total]);

  React.useEffect(() => {
    if (reduced || !words.length) return;
    if (holdLast && step >= total) return;
    const id = setTimeout(() => setStep((s2) => (holdLast ? Math.min(s2 + 1, total) : s2 + 1)), interval);
    return () => clearTimeout(id);
  }, [step, total, interval, reduced, words.length, holdLast]);

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), '');
  const colors = { lime: 'var(--dd-lime)', ink: 'var(--dd-ink)', white: 'var(--dd-white)' };

  return (
    <span style={{ position: 'relative', display: 'inline-block', overflow: 'hidden', verticalAlign: 'bottom', color: colors[tone] || tone, ...style }}>
      <span aria-hidden="true" style={{ visibility: 'hidden', whiteSpace: 'nowrap' }}>{longest}</span>
      {words.map((word, i) => (
        <span key={word} aria-hidden={i !== index}
          style={{ position: 'absolute', left: 0, top: 0, whiteSpace: 'nowrap',
            transform: reduced ? 'none' : (i === index ? 'translateY(0)' : (i < index ? 'translateY(-118%)' : 'translateY(118%)')),
            opacity: i === index ? 1 : 0,
            transition: reduced ? 'none' : 'transform 520ms var(--ease-out-strong), opacity 240ms var(--ease-standard)' }}>
          {word}
        </span>
      ))}
    </span>
  );
}
