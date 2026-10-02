import React from 'react';
import { flushSync } from 'react-dom';
import { Logo } from './components/core/Logo.jsx';
import { Button } from './components/core/Button.jsx';

const LINKS = [['leistungen', 'Leistungen'], ['phasen', 'Phasen'], ['referenzen', 'Referenzen'], ['team', 'Team'], ['faq', 'FAQ']];
const OVERLAY_ID = 'dd-nav-overlay';
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

const useIsoLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

/* Desktop (>= 900px): Logo links, fünf Links plus Setup-Check-CTA rechts.
   Darunter: Logo, kompakter CTA und Burger. Der Burger öffnet ein Vollbild-Menü als modalen
   Dialog: Fokus springt hinein, Tab bleibt darin gefangen, Escape schließt, danach steht der
   Fokus wieder auf dem Burger. Solange es offen ist, ist der Rest der Seite inert und der
   Seiten-Scroll gesperrt. Geschlossen ist das Overlay selbst inert (nicht fokussierbar, nicht
   im A11y-Baum). Das Overlay hängt immer im DOM und blendet über opacity/transform ein; auf
   Desktop nimmt es die Media Query per display:none komplett raus (Styles: mobile.css, Block 2). */
export function Nav({ onNavigate }) {
  const [open, setOpen] = React.useState(false);
  const overlayRef = React.useRef(null);
  const burgerRef = React.useRef(null);
  const closeRef = React.useRef(null);
  const returnFocusRef = React.useRef(true);
  const wasOpenRef = React.useRef(false);

  useIsoLayoutEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return undefined;
    /* React 18 kennt `inert` nicht als Prop, deshalb imperativ. */
    overlay.inert = !open;
    if (!open) {
      /* Fokus zurück auf den Burger. Bewusst hier und nicht im Cleanup: Cleanups laufen in
         Reacts Mutationsphase, danach stellt React den vorher fokussierten Knoten wieder her
         und würde den Fokus überschreiben. */
      if (wasOpenRef.current && returnFocusRef.current && burgerRef.current) burgerRef.current.focus({ preventScroll: true });
      wasOpenRef.current = false;
      return undefined;
    }
    wasOpenRef.current = true;

    /* Alles außerhalb des Dialogs inert schalten: auf jeder Ebene vom Overlay bis zum <body>
       die Geschwister. Bereits inerte Elemente bleiben unangetastet. */
    const touched = [];
    let node = overlay;
    while (node && node.parentElement && node !== document.body) {
      const parent = node.parentElement;
      for (const sib of Array.from(parent.children)) {
        if (sib === node || sib.inert || sib.tagName === 'SCRIPT' || sib.tagName === 'STYLE') continue;
        sib.inert = true;
        touched.push(sib);
      }
      node = parent;
    }

    /* Scroll-Lock am <html>: weil html overflow-x:clip trägt, propagiert body-overflow nicht
       mehr auf den Viewport, ein Lock auf dem body bliebe wirkungslos. */
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = 'hidden';

    returnFocusRef.current = true;
    if (closeRef.current) closeRef.current.focus();

    /* Fokus-Falle: Tab wird komplett selbst geführt (vorwärts/rückwärts im Kreis). Das hält
       den Ablauf auch in Safari gleich, das ohne Tastatur-Einstellung Links überspringt. */
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); setOpen(false); return; }
      if (e.key !== 'Tab') return;
      const items = Array.from(overlay.querySelectorAll(FOCUSABLE));
      if (!items.length) return;
      e.preventDefault();
      const at = items.indexOf(document.activeElement);
      const next = at < 0 ? (e.shiftKey ? items.length - 1 : 0) : (at + (e.shiftKey ? -1 : 1) + items.length) % items.length;
      items[next].focus();
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      touched.forEach((el) => { el.inert = false; });
      root.style.overflow = prevOverflow;
    };
  }, [open]);

  /* Ab 900px gibt es kein Overlay mehr. Ohne Reset blieben Scroll-Lock und inert aktiv,
     wenn jemand mit offenem Menü auf Desktop-Breite vergrößert. */
  React.useEffect(() => {
    if (!open) return undefined;
    const onResize = () => {
      if (window.innerWidth >= 900) { returnFocusRef.current = false; setOpen(false); }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [open]);

  /* Navigation aus dem offenen Menü: erst synchron schließen (inert und Scroll-Lock sind
     danach aufgehoben), dann scrollen. Den Fokus setzt onNavigate aufs Ziel. */
  const go = (id) => {
    returnFocusRef.current = false;
    flushSync(() => setOpen(false));
    onNavigate('home', id);
  };

  const link = (id) => (e) => { e.preventDefault(); onNavigate('home', id); };

  const burger = (ref, label) => (
    <button ref={ref} type="button" className="dd-nav-burger" aria-label={label}
            aria-expanded={open} aria-controls={OVERLAY_ID}
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
      <nav className="dd-nav" aria-label="Hauptnavigation">
        <a href="/" className="dd-nav-home" onClick={link('hero')} aria-label="digital decision, zur Startseite">
          <Logo variant="mark" tone="lime" height={44} assetBase="/assets" alt="" />
        </a>

        <div className="dd-nav-links">
          {LINKS.map(([id, label]) => (
            <a key={id} href={'#' + id} className="dd-nav-link" onClick={link(id)}>{label}</a>
          ))}
          <Button size="nav" arrow onClick={() => onNavigate('home', 'setup-check')}>Setup-Check</Button>
        </div>

        <div className="dd-nav-mobile">
          <Button size="nav" arrow onClick={() => onNavigate('home', 'setup-check')}>Setup-Check</Button>
          {burger(burgerRef, 'Menü öffnen')}
        </div>
      </nav>

      <div ref={overlayRef} id={OVERLAY_ID} className="dd-nav-overlay" data-open={open ? '1' : '0'}
           role="dialog" aria-modal="true" aria-label="Menü">
        <div className="dd-nav-overlay-top">
          <a href="/" className="dd-nav-home" onClick={(e) => { e.preventDefault(); go('hero'); }} aria-label="digital decision, zur Startseite">
            <Logo variant="mark" tone="lime" height={44} assetBase="/assets" alt="" />
          </a>
          {burger(closeRef, 'Menü schließen')}
        </div>

        <div className="dd-nav-overlay-links">
          {LINKS.map(([id, label]) => (
            <a key={id} href={'#' + id} className="dd-nav-overlay-link"
               onClick={(e) => { e.preventDefault(); go(id); }}>{label}</a>
          ))}
        </div>

        <div className="dd-nav-overlay-foot">
          <Button arrow className="dd-nav-overlay-cta" onClick={() => go('setup-check')}>Setup-Check</Button>
        </div>
      </div>
    </>
  );
}
