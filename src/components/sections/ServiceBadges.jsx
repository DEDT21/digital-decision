import React from 'react';
import { Section } from './Section.jsx';

/* "Was wir für dich tun" als Sticker-Haufen: sieben Pill-Badges liegen dicht überlappend um die
   Mitte, leicht rotiert. Hover/Fokus richtet ein Badge auf und hebt es an, die Geschwister nehmen
   sich minimal zurück. Ein Klick öffnet genau eine Popup-Karte (Titel, Copy, Arrow-CTA zum
   Setup-Check) — Desktop als Karte an der Wolke, unter 720px als Bottom-Sheet mit Backdrop.
   Badges sind <button>, Escape und Klick außerhalb schließen.
   Nur Palette-Farben, keine Gradients, keine Dependencies. */

const STYLE_ID = 'dd-servicebadges-styles';

const SERVICES = [
  { id: 'shops', label: 'Onlineshops', size: 'lg', fill: 'lime', rot: -3, dx: -150, dy: -95,
    title: 'Gebaut, um zu verkaufen.',
    body: ['Shopify oder Shopware, neu aufgesetzt oder relauncht: Wir bauen deinen Shop von der Startseite bis zum Checkout als Verkaufssystem. Fertig ist er für uns, wenn er verkauft. Schön aussehen allein reicht nicht.'] },
  { id: 'ads', label: 'Performance Ads', size: 'md', fill: 'violet', rot: -1, dx: 80, dy: -110,
    title: 'Werbebudget. Richtig entschieden.',
    body: ['Wir behandeln dein Budget, als käme es aus unserer Tasche. Bei Meta und Google Ads geht jeder Euro dorthin, wo er verkauft. Und wenn er außerhalb der Ads mehr bringt, sagen wir dir das.'] },
  { id: 'websites', label: 'Websites', size: 'md', fill: 'white', rot: 2, dx: 235, dy: -45,
    title: 'Damit dich jeder so gut sieht, wie du bist.',
    body: ['Deine Arbeit ist stark. Deine Website muss es auch sein. Wir bauen Websites, die dich so gut zeigen, wie du wirklich bist, und aus Besuchern Anfragen machen.'] },
  { id: 'seo', label: 'Content & SEO', size: 'lg', fill: 'white', rot: 2, dx: -190, dy: -20,
    title: 'Texte, mit denen du gefunden wirst.',
    body: ['Gute Texte entstehen nicht aus dem Bauch. Wir schreiben auf Basis von Marktrecherche, Suchdaten und dem, was deine Mitbewerber machen. So werden deine Texte gefunden und verkaufen.'] },
  { id: 'crm', label: 'E-Mail & CRM', size: 'md', fill: 'ink', rot: 1, dx: 20, dy: 5,
    title: 'Aus Käufern Stammkunden machen.',
    body: ['Der günstigste Umsatz kommt von Leuten, die schon bei dir gekauft haben. Wir bauen Automationen, die im Hintergrund verkaufen, und Newsletter, die man freiwillig aufmacht.'] },
  { id: 'systeme', label: 'Systeme & Integrationen', size: 'sm', fill: 'violet', rot: 3, dx: 215, dy: 45,
    title: 'Ein Unterbau, der mitwächst.',
    body: ['Wachstum scheitert selten am Marketing, meistens am Chaos dahinter. Wir verbinden Shop, Warenwirtschaft, Lager und Buchhaltung sauber miteinander, damit du wachsen kannst.'] },
  { id: 'strategie', label: 'Strategie & Klartext', size: 'lg', fill: 'lime', rot: -2, dx: -80, dy: 90,
    title: 'Dein Unternehmen. Unser ganzes Wissen.',
    body: ['Wir lernen dein Unternehmen kennen, als wäre es unseres, und bringen alles ein, was wir haben: Wissen, Netzwerk und die Erfahrung aus unseren eigenen Marken. Was dabei herauskommt, passt nur zu dir. Beratung von der Stange gibt es bei uns nicht.'] }
];

function ensureStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent =
    '.dd-sb-head{text-align:center;margin-bottom:var(--space-12)}'
    + '.dd-sb-head h2{margin:0;font-family:var(--font-head);font-weight:var(--fw-bold);font-size:var(--fs-h2-sm);line-height:var(--lh-heading);text-transform:uppercase;letter-spacing:var(--ls-tag);color:var(--text-primary)}'
    + '.dd-sb-cloud{position:relative;height:380px;margin:0 auto;--kx:1;--ky:1}'
    + '.dd-sb-badge{position:absolute;left:calc(50% + (var(--dx) * var(--kx)) * 1px);top:calc(50% + (var(--dy) * var(--ky)) * 1px);margin:0;border:0;cursor:pointer;font-family:var(--font-head);font-weight:var(--fw-bold);letter-spacing:-0.01em;line-height:1;white-space:nowrap;border-radius:var(--radius-pill);box-shadow:0 10px 24px rgba(10,10,10,0.13);transform:translate(-50%,-50%) rotate(var(--rot));transition:transform 400ms var(--ease-out),box-shadow 400ms var(--ease-out);will-change:transform}'
    + '.dd-sb-badge:focus{outline:none}'
    + '.dd-sb-badge:focus-visible{outline:2px solid var(--focus-ring);outline-offset:4px}'
    + '.dd-sb-badge.lg{font-size:var(--fs-h3);padding:22px 38px}'
    + '.dd-sb-badge.md{font-size:var(--fs-lead);padding:18px 32px}'
    + '.dd-sb-badge.sm{font-size:var(--fs-body);padding:15px 26px}'
    + '.dd-sb-badge.fill-lime{background:var(--surface-accent);color:var(--dd-ink)}'
    + '.dd-sb-badge.fill-violet{background:var(--surface-secondary);color:var(--text-on-dark)}'
    + '.dd-sb-badge.fill-ink{background:var(--surface-dark);color:var(--text-on-dark)}'
    + '.dd-sb-badge.fill-white{background:var(--surface-card);color:var(--text-primary);border:var(--border-default)}'
    + '.dd-sb-badge:hover,.dd-sb-badge:focus-visible,.dd-sb-badge.is-open{transform:translate(-50%,-50%) translateY(-6px) rotate(0deg) scale(1.06);box-shadow:0 18px 40px rgba(10,10,10,0.22);z-index:3}'
    + '.dd-sb-cloud:has(.dd-sb-badge:hover) .dd-sb-badge:not(:hover),.dd-sb-cloud:has(.dd-sb-badge.is-open) .dd-sb-badge:not(.is-open){transform:translate(-50%,-50%) rotate(var(--rot)) scale(0.96)}'
    + '.dd-sb-backdrop{display:none}'
    + '.dd-sb-popup{position:absolute;left:var(--dd-sb-x,0px);top:var(--dd-sb-y,0px);z-index:10;width:360px;max-width:100%;background:var(--surface-card);border:var(--border-default);border-radius:var(--radius-xl);box-shadow:0 24px 60px rgba(10,10,10,0.22);padding:var(--pad-card);animation:dd-sb-pop 260ms var(--ease-out) both}'
    + '@keyframes dd-sb-pop{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}'
    + '.dd-sb-popup h3{font-family:var(--font-head);font-weight:var(--fw-bold);font-size:var(--fs-lead);line-height:var(--lh-title);letter-spacing:var(--ls-heading);margin:0 var(--space-8) var(--space-3) 0;text-wrap:pretty}'
    + '.dd-sb-popup p{margin:0;font:var(--text-copy);color:var(--text-secondary);text-wrap:pretty}'
    + '.dd-sb-popup p + p{margin-top:var(--space-3)}'
    + '.dd-sb-close{position:absolute;top:14px;right:14px;width:32px;height:32px;display:grid;place-items:center;background:transparent;border:0;border-radius:var(--radius-pill);color:var(--text-primary);cursor:pointer;font-size:18px;line-height:1;font-family:var(--font-body);transition:background-color var(--dur-base) var(--ease-standard)}'
    + '.dd-sb-close:hover{background:var(--surface-page)}'
    + '.dd-sb-close:focus-visible{outline:2px solid var(--focus-ring);outline-offset:2px}'
    + '.dd-sb-cta{display:inline-flex;align-items:center;gap:var(--space-2);margin-top:var(--space-5);font-family:var(--font-head);font-weight:var(--fw-bold);font-size:var(--fs-body);line-height:1;color:var(--text-primary);text-decoration:none;transition:color var(--dur-base) var(--ease-standard)}'
    + '.dd-sb-cta .dd-sb-arrow{transition:transform var(--dur-base) var(--ease-standard)}'
    + '.dd-sb-cta:hover{color:var(--text-link)}'
    + '.dd-sb-cta:hover .dd-sb-arrow{transform:translateX(4px)}'
    + '.dd-sb-cta:focus-visible{outline:2px solid var(--focus-ring);outline-offset:4px;border-radius:var(--radius-xs)}'
    + '.dd-sb-closer{margin:var(--space-12) auto 0;max-width:var(--measure);text-align:center;color:var(--text-secondary);font-size:var(--fs-lead);line-height:var(--lh-body);text-wrap:pretty}'
    + '@media (max-width:980px){'
    + '.dd-sb-cloud{--kx:0.8;--ky:1}'
    + '.dd-sb-badge.lg{font-size:22px;padding:18px 30px}'
    + '.dd-sb-badge.md{font-size:18px;padding:15px 26px}'
    + '.dd-sb-badge.sm{font-size:15px;padding:13px 22px}}'
    + '@media (max-width:720px){'
    + '.dd-sb-head h2{font-size:var(--fs-h3)}'
    + '.dd-sb-cloud{height:360px;--kx:0.27;--ky:1.35}'
    + '.dd-sb-badge.lg{font-size:16px;padding:15px 20px}'
    + '.dd-sb-badge.md{font-size:15px;padding:15px 18px}'
    + '.dd-sb-badge.sm{font-size:13px;padding:16px 15px}'
    + '.dd-sb-closer{font-size:var(--fs-body)}'
    + '.dd-sb-backdrop{display:block;position:fixed;inset:0;z-index:20;background:rgba(10,10,10,0.45);animation:dd-sb-fade 240ms var(--ease-out) both}'
    + '@keyframes dd-sb-fade{from{opacity:0}to{opacity:1}}'
    + '.dd-sb-popup{position:fixed;left:0;right:0;bottom:0;top:auto;width:auto;z-index:21;border-radius:var(--radius-xl) var(--radius-xl) 0 0;border-bottom:0;padding:var(--space-6) var(--space-5) var(--space-8);animation:dd-sb-sheet 300ms var(--ease-out) both}'
    + '@keyframes dd-sb-sheet{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}}'
    + '@media (max-width:400px){'
    + '.dd-sb-cloud{height:340px;--kx:0.20;--ky:1.25}'
    + '.dd-sb-badge.lg{font-size:15px;padding:15px 17px}'
    + '.dd-sb-badge.md{font-size:14px;padding:15px 15px}'
    + '.dd-sb-badge.sm{font-size:12px;padding:16px 13px}}'
    + '@media (prefers-reduced-motion: reduce){.dd-sb-badge,.dd-sb-popup,.dd-sb-backdrop{transition:none;animation:none}}';
  document.head.appendChild(el);
}

export function ServiceBadges({
  id = 'leistungen',
  headline = 'Was wir für dich tun',
  closer = 'Egal, wo du startest: Du bekommst einen Ansprechpartner, der mitdenkt und liefert.',
  ctaLabel = 'Kostenloser Setup-Check',
  ctaHref = '#setup-check',
  items = SERVICES,
  style
}) {
  ensureStyles();
  const [openId, setOpenId] = React.useState(null);
  const cloudRef = React.useRef(null);
  const popupRef = React.useRef(null);
  const badgeRefs = React.useRef({});
  const openIdRef = React.useRef(null);
  openIdRef.current = openId;

  const active = items.find((item) => item.id === openId) || null;

  const close = React.useCallback(() => {
    const btn = openIdRef.current ? badgeRefs.current[openIdRef.current] : null;
    setOpenId(null);
    if (btn) btn.focus({ preventScroll: true });
  }, []);

  const toggle = React.useCallback((itemId) => {
    setOpenId((current) => (current === itemId ? null : itemId));
  }, []);

  /* Karte unter (oder über) dem Badge platzieren, innerhalb der Wolke geklemmt. Die Position
     landet als CSS-Variable am Element, nicht als inline left/top: so kann die Media Query
     unter 720px sie mit dem Bottom-Sheet-Layout überschreiben. Kein JS-Breakpoint, damit
     JS und CSS nie auseinanderlaufen können. */
  const place = React.useCallback(() => {
    const cloud = cloudRef.current;
    const popup = popupRef.current;
    const btn = openIdRef.current ? badgeRefs.current[openIdRef.current] : null;
    if (!cloud || !popup || !btn) return;
    const cb = cloud.getBoundingClientRect();
    const bb = btn.getBoundingClientRect();
    const pw = popup.offsetWidth;
    const ph = popup.offsetHeight;
    const cx = bb.left - cb.left + bb.width / 2;
    const below = bb.bottom - cb.top + 14;
    const above = bb.top - cb.top - ph - 14;
    let top = (below + ph <= cb.height || above < 0) ? below : above;
    top = Math.max(0, Math.min(top, Math.max(0, cb.height - ph)));
    const left = Math.max(0, Math.min(cx - pw / 2, Math.max(0, cb.width - pw)));
    popup.style.setProperty('--dd-sb-x', left + 'px');
    popup.style.setProperty('--dd-sb-y', top + 'px');
  }, []);

  React.useLayoutEffect(() => { if (active) place(); }, [active, place]);

  React.useEffect(() => {
    if (!active) return undefined;
    const onReflow = () => place();
    window.addEventListener('resize', onReflow);
    return () => window.removeEventListener('resize', onReflow);
  }, [active, place]);

  /* Schließen bei Klick außerhalb: Klicks auf IRGENDEIN Badge oder in die Karte werden
     ignoriert — das Badge toggelt selbst. Sonst würde der öffnende Klick, der nach dem
     State-Update noch weiterläuft, die Karte sofort wieder zumachen. */
  React.useEffect(() => {
    if (!active) return undefined;
    const inside = (target) => {
      if (!(target instanceof Element)) return false;
      if (target.closest('.dd-sb-badge')) return true;
      if (target.closest('.dd-sb-popup')) return true;
      const popup = popupRef.current;
      return !!(popup && popup.contains(target));
    };
    const onPointerDown = (e) => { if (!inside(e.target)) close(); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [active, close]);

  const popup = active ? (
    <div ref={popupRef} className="dd-sb-popup" role="dialog" aria-label={active.label}>
      <button type="button" className="dd-sb-close" aria-label="Schließen" onClick={close}>&#10005;</button>
      <h3>{active.title}</h3>
      {active.body.map((text) => <p key={text.slice(0, 24)}>{text}</p>)}
      <a className="dd-sb-cta" href={ctaHref}>
        <span>{ctaLabel}</span><span className="dd-sb-arrow" aria-hidden="true">&rarr;</span>
      </a>
    </div>
  ) : null;

  return (
    <Section id={id} tone="paper" style={style}>
      <div className="dd-sb-head" data-reveal><h2>{headline}</h2></div>

      <div className="dd-sb-cloud" ref={cloudRef}>
        {items.map((item) => (
          <button key={item.id} type="button"
            ref={(node) => { badgeRefs.current[item.id] = node; }}
            className={'dd-sb-badge ' + item.size + ' fill-' + item.fill + (openId === item.id ? ' is-open' : '')}
            style={{ '--dx': String(item.dx), '--dy': String(item.dy), '--rot': item.rot + 'deg' }}
            aria-expanded={openId === item.id}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); toggle(item.id); }}>
            {item.label}
          </button>
        ))}
        {popup}
      </div>

      {/* Backdrop gehört zum Bottom-Sheet und ist per CSS nur unter 720px sichtbar */}
      {active ? <div className="dd-sb-backdrop" onClick={close} /> : null}

      <p className="dd-sb-closer" data-reveal>{closer}</p>
    </Section>
  );
}
