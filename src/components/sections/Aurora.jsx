import React from 'react';
import './Aurora.css';

/* Aurora-Hintergrund (Hero, Footer): weiche Lime-Lichtbänder auf Ink. Geometrie, Keyframes
   und Masken stehen statisch in Aurora.css, die Komponente setzt nur Custom Properties.

   bleed: Die Box ragt um diesen Betrag über die Oberkante des Elternelements hinaus. So liegt
   die einzige gerade Schnittkante hinter dem Sticky-Header bzw. außerhalb des Bildschirms.
   Läuft die Aurora aus dem Viewport, hält ein IntersectionObserver die Animation an. */

export function Aurora({ color = 'var(--dd-lime)', background = 'var(--surface-dark)', origin = 'top-right', intensity = 0.42, blur = 44, speed = 42, bleed = 360, style }) {
  const ref = React.useRef(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver((entries) => {
      const visible = entries[entries.length - 1].isIntersecting;
      if (visible) el.removeAttribute('data-paused');
      else el.setAttribute('data-paused', '');
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="dd-aurora" data-origin={origin} aria-hidden="true"
         style={{ top: -bleed + 'px', background,
                  '--dd-aurora-color': color, '--dd-aurora-intensity': intensity,
                  '--dd-aurora-blur': blur + 'px', '--dd-aurora-speed': speed + 's', ...style }}>
      <div className="dd-aurora-field">
        <div className="dd-aurora-a" />
        <div className="dd-aurora-b" />
      </div>
    </div>
  );
}
