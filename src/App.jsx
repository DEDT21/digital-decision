import React from 'react';
import { Nav } from './Nav.jsx';
import { Home } from './Home.jsx';
import { SiteFooter } from './components/sections/SiteFooter.jsx';

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

  React.useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const hero = document.getElementById('hero');
      const h = hero ? hero.offsetHeight : 0;
      setOnHero(window.scrollY < Math.max(0, h - 120));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(read); };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { if (frame) cancelAnimationFrame(frame); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  const onNavigate = (page, anchor) => {
    if (anchor) {
      const el = document.getElementById(anchor);
      if (el) { window.scrollTo({ top: el.offsetTop - 60, behavior: 'smooth' }); return; }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <div>
      <div style={{ background: onHero ? 'transparent' : 'var(--surface-dark)', position: 'sticky', top: 0, zIndex: 10, transition: 'background-color 200ms cubic-bezier(0.23,1,0.32,1)' }}>
        <Nav onNavigate={onNavigate} />
      </div>
      <Home onNavigate={onNavigate} />
      <SiteFooter
        headline={<>Dein Shop läuft solide, aber skaliert nicht?<br />Dann triff <span style={{ color: 'var(--dd-lime)' }}>genau jetzt</span> die <span style={{ color: 'var(--dd-lime)' }}>richtige Entscheidung</span>.</>}
        kicker="Bereit?"
        sub="Lass uns einen kostenlosen Setup-Check machen: 30 Minuten, ehrliche Einschätzung, nächste Schritte. Mehr musst du nicht entscheiden. Noch nicht."
        onCta={() => onNavigate('home', 'setup-check')}
        usps={USPS}
        columns={FOOTER_COLUMNS}
        claim="Der E-Commerce-Partner, der entscheidet, als wäre es das eigene Geschäft."
        legal="digital decision GmbH · FN 461176a · ATU71568207"
        copyright="© 2026"
        onNavigate={onNavigate}
        assetBase="/assets" />
    </div>
  );
}
