import React from 'react';
import { Logo } from './components/core/Logo.jsx';
import { Button } from './components/core/Button.jsx';

const LINKS = [['leistungen', 'Leistungen'], ['phasen', 'Phasen'], ['referenzen', 'Referenzen'], ['team', 'Team'], ['faq', 'FAQ']];

/* Desktop (>= 900px) unverändert: Logo links, fünf Links plus Setup-Check-CTA rechts.
   Darunter übernimmt ein Burger — sichtbar bleiben Logo, kompakter CTA und der 44x44-Button.
   Das Overlay hängt immer im DOM und blendet über opacity/transform ein (kein Layout-Thrash);
   auf Desktop nimmt es die Media Query per display:none komplett raus. */
export function Nav({ onNavigate }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    /* Der Scroll-Lock hängt am <html>, nicht am <body>: weil html in mobile.css
       overflow-x:clip trägt, propagiert der Browser body-overflow nicht mehr auf den
       Viewport — ein Lock auf dem body bliebe wirkungslos. */
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => {
      root.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  /* Ab 900px gibt es kein Overlay mehr. Ohne diesen Reset bliebe der Body-Scroll gesperrt,
     wenn jemand mit offenem Menü auf Desktop-Breite vergrößert. */
  React.useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 900) setOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const go = (id) => { setOpen(false); onNavigate('home', id); };

  const burger = (label) => (
    <button type="button" className="dd-nav-burger" aria-expanded={open} aria-label={label}
            onClick={() => setOpen((v) => !v)}>
      <span className="dd-burger-box" aria-hidden="true">
        <span className="dd-burger-line" />
        <span className="dd-burger-line" />
        <span className="dd-burger-line" />
      </span>
    </button>
  );

  return (
    <>
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-8)', padding: '20px var(--pad-page-x)', maxWidth: 'var(--measure-wide)', margin: '0 auto' }}>
        <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('home', 'hero'); }} style={{ display: 'block' }} aria-label="digital decision — Startseite">
          <Logo variant="mark" tone="lime" height={44} assetBase="/assets" />
        </a>

        <div className="dd-nav-links">
          {LINKS.map(([id, label]) => (
            <a key={id} href={'#' + id} onClick={(e) => { e.preventDefault(); onNavigate('home', id); }}
               style={{ font: 'var(--text-copy)', fontSize: 14, color: 'var(--text-on-dark-secondary)', textDecoration: 'none' }}>{label}</a>
          ))}
          <Button size="sm" arrow onClick={() => onNavigate('home', 'setup-check')}>Setup-Check</Button>
        </div>

        <div className="dd-nav-mobile">
          <Button size="sm" arrow onClick={() => onNavigate('home', 'setup-check')}>Setup-Check</Button>
          {burger('Menü öffnen')}
        </div>
      </nav>

      <div className="dd-nav-overlay" data-open={open ? '1' : '0'} aria-hidden={open ? undefined : 'true'}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)' }}>
          <a href="/" onClick={(e) => { e.preventDefault(); go('hero'); }} style={{ display: 'block' }} aria-label="digital decision — Startseite">
            <Logo variant="mark" tone="lime" height={44} assetBase="/assets" />
          </a>
          {burger('Menü schließen')}
        </div>

        <div className="dd-nav-overlay-links">
          {LINKS.map(([id, label]) => (
            <button key={id} type="button" className="dd-nav-overlay-link" tabIndex={open ? 0 : -1}
                    onClick={() => go(id)}>{label}</button>
          ))}
        </div>

        <div className="dd-nav-overlay-foot">
          <Button arrow style={{ width: '100%' }} onClick={() => go('setup-check')}>Setup-Check</Button>
        </div>
      </div>
    </>
  );
}
