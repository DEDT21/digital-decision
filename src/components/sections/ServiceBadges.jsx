import React from 'react';
import { Section } from './Section.jsx';
import './ServiceBadges.css';

/* "Was wir für dich tun" als Sticker-Haufen: sieben Pill-Badges, leicht rotiert und überlappend.
   Ein Klick (oder Enter/Leertaste) öffnet genau eine Popup-Karte mit Titel, Copy und Arrow-CTA zum
   Setup-Check. Ab 721px liegt die Karte als nicht-modaler Dialog an der Wolke, bis 720px als
   modales Bottom-Sheet mit Backdrop, Fokus-Falle, inertem Hintergrund und Scroll-Sperre.

   SSR/Prerender: Alle sieben Popup-Inhalte stehen dauerhaft im DOM, geschlossene tragen `hidden`.
   Der erste Render ist deterministisch (alles zu, Popover-Modus). Ob Sheet oder Popover gilt,
   entscheidet das CSS; JS liest die Media Query erst nach dem Mount, nur für aria-modal, Inert
   und Scroll-Sperre. Styles kommen statisch aus ServiceBadges.css. */

const useIsoLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;
const SHEET_QUERY = '(max-width: 720px)';

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

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="dd-sb-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

/* Alles außerhalb des Sheets inert setzen: vom Panel bis hoch zum <body> jede Geschwister-Ebene.
   Nur Elemente, die wir selbst umgestellt haben, werden später zurückgesetzt. Der Backdrop bleibt
   bedienbar (data-sb-keep), er ist der "Klick außerhalb". */
function inertOutside(node) {
  const changed = [];
  let el = node;
  while (el && el.parentElement && el !== document.body) {
    const parent = el.parentElement;
    for (const sib of Array.from(parent.children)) {
      if (sib === el || sib.hasAttribute('inert') || sib.hasAttribute('data-sb-keep')) continue;
      if (sib.tagName === 'SCRIPT' || sib.tagName === 'STYLE' || sib.tagName === 'LINK') continue;
      sib.setAttribute('inert', '');
      changed.push(sib);
    }
    el = parent;
  }
  return () => changed.forEach((n) => n.removeAttribute('inert'));
}

/* Scroll-Sperre ohne position:fixed am Body: das würde die Scrollposition auf 0 setzen, die
   Navigation (abhängig von scrollY) umschalten und die Seite beim Schließen springen lassen.
   Stattdessen overflow:hidden am <html> (Desktop-Browser, iOS ab 16) und für ältere iOS-Versionen
   ein nicht-passiver touchmove-Filter: Scrollen ist nur innerhalb des Sheets erlaubt, und auch
   dort nicht über die Ränder hinaus (sonst kettet iOS den Scroll an die Seite weiter). */
function lockScroll(scroller) {
  const html = document.documentElement;
  const body = document.body;
  const prevOverflow = html.style.overflow;
  const prevPad = body.style.paddingRight;
  const gutter = window.innerWidth - html.clientWidth;
  html.style.overflow = 'hidden';
  if (gutter > 0) body.style.paddingRight = gutter + 'px';

  let startY = 0;
  const onStart = (e) => { if (e.touches.length === 1) startY = e.touches[0].clientY; };
  const onMove = (e) => {
    if (e.touches.length !== 1) return; /* Pinch-Zoom nicht blockieren */
    const inside = scroller && e.target instanceof Node && scroller.contains(e.target);
    if (!inside || scroller.scrollHeight <= scroller.clientHeight) { if (e.cancelable) e.preventDefault(); return; }
    const dy = e.touches[0].clientY - startY;
    const atTop = scroller.scrollTop <= 0;
    const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
    if (((atTop && dy > 0) || (atBottom && dy < 0)) && e.cancelable) e.preventDefault();
  };
  document.addEventListener('touchstart', onStart, { passive: true });
  document.addEventListener('touchmove', onMove, { passive: false });

  return () => {
    document.removeEventListener('touchstart', onStart);
    document.removeEventListener('touchmove', onMove);
    html.style.overflow = prevOverflow;
    body.style.paddingRight = prevPad;
  };
}

export function ServiceBadges({
  id = 'leistungen',
  headline = 'Was wir für dich tun.',
  hint = 'Wähl ein Thema für die Details.',
  closer = 'Egal, wo du startest: Du bekommst einen Ansprechpartner, der mitdenkt und liefert.',
  ctaLabel = 'Kostenloser Setup-Check',
  ctaHref = '#setup-check',
  items = SERVICES,
  style
}) {
  const [openId, setOpenId] = React.useState(null);
  /* 'popover' ist der deterministische Startwert (SSR); der Client gleicht nach dem Mount ab */
  const [mode, setMode] = React.useState('popover');

  const cloudRef = React.useRef(null);
  const badgeRefs = React.useRef({});
  const panelRefs = React.useRef({});
  const titleRefs = React.useRef({});
  const openIdRef = React.useRef(null);
  const modeRef = React.useRef('popover');
  const releaseRef = React.useRef(null);
  openIdRef.current = openId;
  modeRef.current = mode;

  const panelId = (itemId) => id + '-panel-' + itemId;
  const titleId = (itemId) => id + '-title-' + itemId;

  React.useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined;
    const mql = window.matchMedia(SHEET_QUERY);
    const sync = () => setMode(mql.matches ? 'sheet' : 'popover');
    sync();
    if (mql.addEventListener) mql.addEventListener('change', sync); else mql.addListener(sync);
    return () => { if (mql.removeEventListener) mql.removeEventListener('change', sync); else mql.removeListener(sync); };
  }, []);

  const release = React.useCallback(() => {
    const fn = releaseRef.current;
    releaseRef.current = null;
    if (fn) fn();
  }, []);

  /* Schließt das offene Popup. Inert und Scroll-Sperre werden SYNCHRON aufgehoben, bevor der
     Fokus zurück aufs Badge geht: ein inertes Badge könnte ihn sonst nicht annehmen. */
  const close = React.useCallback((returnFocus) => {
    const current = openIdRef.current;
    if (!current) return;
    release();
    openIdRef.current = null;
    setOpenId(null);
    const btn = badgeRefs.current[current];
    if (returnFocus && btn) btn.focus({ preventScroll: true });
  }, [release]);

  const onBadgeClick = (itemId) => {
    if (openIdRef.current === itemId) { close(true); return; }
    release();
    openIdRef.current = itemId;
    setOpenId(itemId);
  };

  /* Popover-Karte neben das Badge legen (Seite mit mehr Platz), damit der Auslöser sichtbar
     bleibt. Reicht die Breite dafür nicht (Tablet), kommt sie darunter oder darüber, je nachdem
     wo sie weniger über die Wolke hinausragt. Die Position landet als CSS-Variable am Panel;
     im Sheet-Layout ignoriert das CSS sie. */
  const place = React.useCallback(() => {
    const itemId = openIdRef.current;
    const cloud = cloudRef.current;
    const popup = itemId ? panelRefs.current[itemId] : null;
    const btn = itemId ? badgeRefs.current[itemId] : null;
    if (!cloud || !popup || !btn) return;
    const gap = 16;
    const cb = cloud.getBoundingClientRect();
    const bb = btn.getBoundingClientRect();
    const pw = popup.offsetWidth;
    const ph = popup.offsetHeight;
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, Math.max(lo, hi)));
    const bLeft = bb.left - cb.left;
    const bRight = bb.right - cb.left;
    const bTop = bb.top - cb.top;
    const bBottom = bb.bottom - cb.top;
    const spaceLeft = bLeft - gap;
    const spaceRight = cb.width - bRight - gap;
    let left;
    let top;
    if (Math.max(spaceLeft, spaceRight) >= pw) {
      left = spaceRight >= pw && (spaceRight >= spaceLeft || spaceLeft < pw) ? bRight + gap : bLeft - gap - pw;
      top = clamp(bTop + bb.height / 2 - ph / 2, 0, cb.height - ph);
    } else {
      left = clamp(bLeft + bb.width / 2 - pw / 2, 0, cb.width - pw);
      const below = bBottom + gap;
      const above = bTop - gap - ph;
      const overBelow = Math.max(0, below + ph - cb.height);
      const overAbove = Math.max(0, -above);
      top = overBelow <= overAbove ? below : above;
    }
    popup.style.setProperty('--dd-sb-x', Math.round(left) + 'px');
    popup.style.setProperty('--dd-sb-y', Math.round(top) + 'px');
  }, []);

  useIsoLayoutEffect(() => { if (openId && mode === 'popover') place(); }, [openId, mode, place]);

  React.useEffect(() => {
    if (!openId || mode !== 'popover') return undefined;
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [openId, mode, place]);

  /* Beim Öffnen Fokus auf den Titel des Popups (tabIndex -1): Screenreader lesen ab dort vor,
     Tab führt weiter zum CTA. preventScroll, damit das Sheet die Seite nicht verschiebt. */
  React.useEffect(() => {
    if (!openId) return;
    const title = titleRefs.current[openId];
    if (title) title.focus({ preventScroll: true });
  }, [openId]);

  /* Sheet-Modus: Hintergrund inert, Scroll gesperrt. Wechselt der Modus bei offenem Popup
     (Drehen des Geräts), räumt der Cleanup auf und der Effekt setzt passend neu auf. */
  React.useEffect(() => {
    if (!openId || mode !== 'sheet') return undefined;
    const panel = panelRefs.current[openId];
    if (!panel) return undefined;
    const undoInert = inertOutside(panel);
    const unlock = lockScroll(panel);
    releaseRef.current = () => { undoInert(); unlock(); };
    return release;
  }, [openId, mode, release]);

  /* Escape schließt, Tab bleibt im Sheet gefangen, Klick außerhalb schließt. Klicks auf Badges
     und in die Karte zählen nicht als außerhalb: das Badge toggelt selbst, und der öffnende Klick
     läuft nach dem synchronen Commit noch bis zum document weiter. */
  React.useEffect(() => {
    if (!openId) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(true); return; }
      if (e.key !== 'Tab' || modeRef.current !== 'sheet') return;
      const panel = panelRefs.current[openIdRef.current];
      if (!panel) return;
      /* Tab komplett selbst führen: unabhängig davon, ob der Browser Links per Tab anspringt
         (Safari ohne "Alle Steuerelemente"), bleibt der Fokus im Sheet. */
      e.preventDefault();
      const nodes = Array.from(panel.querySelectorAll(FOCUSABLE));
      if (!nodes.length) return;
      const idx = nodes.indexOf(document.activeElement);
      const next = e.shiftKey
        ? nodes[idx <= 0 ? nodes.length - 1 : idx - 1]
        : nodes[idx === -1 || idx === nodes.length - 1 ? 0 : idx + 1];
      next.focus();
    };
    const onClick = (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      if (target.closest('.dd-sb-badge') || target.closest('.dd-sb-popup')) return;
      const activeEl = document.activeElement;
      const focusLost = !activeEl || activeEl === document.body || !!activeEl.closest('.dd-sb-popup');
      close(focusLost);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [openId, close]);

  /* Popover (Desktop): Verlässt der Tastaturfokus Karte und Auslöser, schließt die Karte, damit
     nie eine offene Karte an einem Badge hängt, das gerade nicht gemeint ist. */
  const onPanelBlur = (e, itemId) => {
    if (modeRef.current !== 'popover') return;
    const next = e.relatedTarget;
    if (!next || e.currentTarget.contains(next) || next === badgeRefs.current[itemId]) return;
    close(false);
  };

  /* Arrow-CTA: Popup zu, dann zum Setup-Check scrollen (bei reduced motion ohne Smooth-Scroll).
     Per Tastatur ausgelöst (detail 0) landet der Fokus im ersten Formularfeld. */
  const onCta = (e) => {
    if (!ctaHref || ctaHref.charAt(0) !== '#') { close(false); return; }
    const target = document.getElementById(ctaHref.slice(1));
    if (!target) { close(false); return; }
    e.preventDefault();
    const viaKeyboard = e.detail === 0;
    close(false);
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nav = document.querySelector('nav');
    const offset = nav ? Math.max(0, Math.round(nav.getBoundingClientRect().bottom)) : 0;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
    if (viaKeyboard) {
      const field = target.querySelector('input:not([type="hidden"]):not([tabindex="-1"]), textarea, select');
      if (field) field.focus({ preventScroll: true });
    }
  };

  return (
    <Section id={id} tone="paper" style={style}>
      <header className="dd-sb-head" data-reveal>
        <h2>{headline}</h2>
        {hint ? <p className="dd-sb-hint">{hint}</p> : null}
      </header>

      <div className="dd-sb-cloud" ref={cloudRef}>
        {items.map((item) => {
          const open = openId === item.id;
          return (
            <React.Fragment key={item.id}>
              <button type="button"
                ref={(node) => { badgeRefs.current[item.id] = node; }}
                className={'dd-sb-badge ' + item.size + ' fill-' + item.fill + (open ? ' is-open' : '')}
                style={{ '--dx': String(item.dx), '--dy': String(item.dy), '--rot': item.rot + 'deg' }}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls={panelId(item.id)}
                onClick={() => onBadgeClick(item.id)}>
                {item.label}
              </button>
              <div id={panelId(item.id)}
                ref={(node) => { panelRefs.current[item.id] = node; }}
                className="dd-sb-popup"
                role="dialog"
                aria-modal={open && mode === 'sheet' ? 'true' : undefined}
                aria-labelledby={titleId(item.id)}
                hidden={!open}
                onBlur={(e) => onPanelBlur(e, item.id)}>
                <h3 id={titleId(item.id)} tabIndex={-1} ref={(node) => { titleRefs.current[item.id] = node; }}>{item.title}</h3>
                {item.body.map((text) => <p key={text.slice(0, 24)}>{text}</p>)}
                <a className="dd-sb-cta" href={ctaHref} onClick={onCta}>
                  <span>{ctaLabel}</span><ArrowIcon />
                </a>
                {/* Im DOM nach dem CTA (Tab-Reihenfolge Titel, CTA, Schließen), visuell oben rechts */}
                <button type="button" className="dd-sb-close" aria-label="Details schließen" onClick={() => close(true)}>
                  <CloseIcon />
                </button>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Backdrop gehört zum Bottom-Sheet und ist per CSS nur bis 720px sichtbar */}
      <div className="dd-sb-backdrop" data-sb-keep="" aria-hidden="true" hidden={!openId} onClick={() => close(true)} />

      <p className="dd-sb-closer" data-reveal>{closer}</p>
    </Section>
  );
}
