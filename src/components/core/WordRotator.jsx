import React from 'react';

/* Vertical word flip for the hero headline. The container is locked to the widest word so the
   line never reflows, and prefers-reduced-motion shows the final word statically.
   The word list is laid out as ONE continuous sequence (list × loops), so every flip scrolls
   in the same downward direction — including the hand-over into the second pass — and the
   rotation rests on the sequence's last word. No animation library; transform + token easing. */

export function WordRotator({ words = [], interval = 1600, tone = 'lime', holdLast = true, loops = 2, style }) {
  const [step, setStep] = React.useState(0);
  const [reduced, setReduced] = React.useState(false);

  const seq = [];
  for (let l = 0; l < Math.max(loops, 1); l++) seq.push(...words);
  const total = Math.max(seq.length - 1, 0);
  const current = seq.length ? (holdLast ? Math.min(step, total) : step % seq.length) : 0;

  React.useEffect(() => {
    const mq = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    if (mq && mq.matches) { setReduced(true); setStep(total); }
  }, [total]);

  React.useEffect(() => {
    if (reduced || !seq.length) return;
    if (holdLast && step >= total) return;
    const id = setTimeout(() => setStep((s2) => (holdLast ? Math.min(s2 + 1, total) : s2 + 1)), interval);
    return () => clearTimeout(id);
  }, [step, total, interval, reduced, seq.length, holdLast]);

  const longest = words.reduce((a, b) => (b.length > a.length ? b : a), '');
  const colors = { lime: 'var(--dd-lime)', ink: 'var(--dd-ink)', white: 'var(--dd-white)' };

  return (
    /* Layout-Properties (position, display, white-space, overflow) liegen in mobile.css unter
       .dd-rotator*, damit die Media Query sie überschreiben kann: auf schmalen Screens ist das
       längste Wort breiter als der Viewport und muss umbrechen dürfen, statt die Seite
       horizontal aufzuziehen. */
    <span className="dd-rotator" style={{ color: colors[tone] || tone, ...style }}>
      <span className="dd-rotator-measure" aria-hidden="true">{longest}</span>
      {seq.map((word, i) => (
        <span key={word + '-' + i} className="dd-rotator-word" aria-hidden={i !== current}
          style={{
            transform: reduced ? 'none' : (i === current ? 'translateY(0)' : (i < current ? 'translateY(-118%)' : 'translateY(118%)')),
            opacity: i === current ? 1 : 0,
            transition: reduced ? 'none' : 'transform 520ms var(--ease-out-strong), opacity 240ms var(--ease-standard)' }}>
          {word}
        </span>
      ))}
    </span>
  );
}
