import React from 'react';
import { Nav } from './Nav.jsx';
import { Home } from './Home.jsx';
import { SiteFooter } from './components/sections/SiteFooter.jsx';
import './App.css';

const FOOTER_COLUMNS = [
  { title: 'Seite', items: [
    { label: 'Leistungen', anchor: 'leistungen' },
    { label: 'Phasen', anchor: 'phasen' },
    { label: 'Referenzen', anchor: 'referenzen' },
    { label: 'Team', anchor: 'team' },
    { label: 'FAQ', anchor: 'faq' }
  ] },
  { title: 'Kontakt', items: [
    { label: 'david@digital-decision.at', href: 'mailto:david@digital-decision.at' },
    { label: 'Josef-Weißkind-Straße 14/4' },
    { label: '5083 Grödig bei Salzburg' }
  ] },
  { title: 'Rechtliches', items: [
    { label: 'Impressum', href: '/impressum/' },
    { label: 'Datenschutz', href: '/datenschutz/' }
  ] }
];

/* SEO-Regionen im Footer: acht Keyword-Begriffe als reiner Text. Bewusst keine Links mehr –
   acht Selbstlinks auf die Startseite bringen nichts und wirken wie Keyword-Stuffing.
   Echte Wirkung hätten eigene Landingpages pro Begriff (offener Punkt). */
const REGION_LINKS = [
  'Marketing Agentur Salzburg',
  'Werbeagentur Salzburg',
  'Branding Agentur Salzburg',
  'Online Marketing Agentur Oberösterreich',
  'E-Commerce Agentur Salzburg',
  'Shopify Agentur Salzburg',
  'Performance Marketing Salzburg',
  'Klaviyo Agentur Österreich'
].map((label) => ({ label }));

const USPS = [
  'Zahlen lügen nicht. Wir auch nicht.',
  'Mit ins Risiko. Mit in den Gewinn.',
  'Wir bleiben, bis es läuft.',
  'Erst verstehen. Dann entscheiden.',
  'Dein Wachstum ist unser Geschäftsmodell.',
  'Ein Wort ist ein Wort.'
];

export function App() {
  const [onHero, setOnHero] = React.useState(true);
  const headerRef = React.useRef(null);

  /* Header transparent, solange der Hero mehr als 120px unter die Oberkante reicht.
     Ein IntersectionObserver auf den Hero (Wurzel um 120px oben verkleinert) ersetzt den
     früheren Scroll-Listener: State ändert sich nur noch beim Überqueren der Grenze. */
  React.useEffect(() => {
    const hero = document.getElementById('hero');
    if (!hero || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver((entries) => {
      setOnHero(entries[entries.length - 1].isIntersecting);
    }, { rootMargin: '-120px 0px 0px 0px' });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  /* Ein Observer für die ganze Seite: Jedes Element mit [data-reveal] blendet beim Eintritt
     einmalig ein und wird danach nicht mehr beobachtet (kein Zurück-Faden). Die Staffelung
     kommt aus data-reveal-delay, das die Sektionen an ihre Grid-Kinder schreiben.
     rootMargin unten -60px: der Block startet erst, wenn er wirklich im Blickfeld ist.
     Läuft kein JS oder ist prefers-reduced-motion aktiv, fehlt die Klasse dd-reveal — dann
     ist ohnehin alles sichtbar und dieser Effekt macht nichts. */
  React.useEffect(() => {
    if (!document.documentElement.classList.contains('dd-reveal')) return;
    const nodes = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!nodes.length) return;
    if (typeof IntersectionObserver === 'undefined') {
      nodes.forEach((n) => n.setAttribute('data-shown', '1'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        /* Blöcke, die höher als der Viewport sind, erreichen die 0.15-Schwelle nie. Für sie
           genügt es, dass ihre Oberkante im unteren Fünftel des Bildschirms angekommen ist —
           sonst blieben sie unsichtbar. */
        if (entry.intersectionRatio < 0.15 && entry.boundingClientRect.top > window.innerHeight * 0.85) return;
        const el = entry.target;
        const delay = Number(el.dataset.revealDelay || 0);
        if (delay) el.style.transitionDelay = delay + 'ms';
        el.setAttribute('data-shown', '1');
        io.unobserve(el);
      });
    }, { threshold: [0, 0.15], rootMargin: '0px 0px -60px 0px' });
    nodes.forEach((n) => io.observe(n));

    /* Sicherheitsnetz: Sollte der Observer aus irgendeinem Grund nicht liefern, wäre der
       Schaden groß (unsichtbare Inhalte). Der Timer zeigt deshalb nachträglich alles, was
       ohnehin schon im Blickfeld liegt — dieselbe Bedingung wie oben, nur ohne Observer. */
    const safety = window.setTimeout(() => {
      nodes.forEach((n) => {
        if (n.dataset.shown === '1') return;
        if (n.getBoundingClientRect().top < window.innerHeight) { n.setAttribute('data-shown', '1'); io.unobserve(n); }
      });
    }, 2500);

    return () => { window.clearTimeout(safety); io.disconnect(); };
  }, []);

  /* Sprung zu einer Sektion: unter den Sticky-Header scrollen (bei reduzierter Bewegung ohne
     Smooth-Scroll) und den Fokus aufs Ziel setzen, damit Tastatur und Screenreader dort
     weitermachen. Nicht fokussierbare Ziele bekommen dafür tabindex=-1. */
  const onNavigate = React.useCallback((page, anchor) => {
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = reduce ? 'auto' : 'smooth';
    const el = anchor && anchor !== 'hero' ? document.getElementById(anchor) : null;
    const offset = headerRef.current ? headerRef.current.offsetHeight : 0;
    const top = el ? el.getBoundingClientRect().top + window.scrollY - offset : 0;
    window.scrollTo({ top: Math.max(0, top), behavior });

    const target = el || document.getElementById('main');
    if (!target) return;
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
      target.setAttribute('data-dd-focus-target', '');
    }
    target.focus({ preventScroll: true });
  }, []);

  return (
    <div>
      <a className="dd-skip" href="#main">Zum Inhalt springen</a>
      <header ref={headerRef} className="dd-header dd-on-dark" data-solid={onHero ? undefined : ''}>
        <Nav onNavigate={onNavigate} />
      </header>
      <main id="main" tabIndex={-1}>
        <Home onNavigate={onNavigate} />
      </main>
      <SiteFooter
        headline={<>Dein Shop läuft solide, aber skaliert nicht?<br />Dann triff <span style={{ color: 'var(--dd-lime)' }}>genau jetzt</span> die <span style={{ color: 'var(--dd-lime)' }}>richtige Entscheidung</span>.</>}
        kicker="Bereit?"
        sub="Lass uns einen kostenlosen Setup-Check machen: 30 Minuten, ehrliche Einschätzung, nächste Schritte. Mehr musst du nicht entscheiden. Noch nicht."
        onCta={() => onNavigate('home', 'setup-check')}
        usps={USPS}
        columns={FOOTER_COLUMNS}
        regions={REGION_LINKS}
        claim="Der E-Commerce-Partner, der entscheidet, als wäre es das eigene Geschäft."
        legal="digital decision GmbH · FN 461176a · ATU71568207"
        copyright="© 2026"
        onNavigate={onNavigate}
        assetBase="/assets" />
    </div>
  );
}
