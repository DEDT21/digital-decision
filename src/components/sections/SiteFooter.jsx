import React from 'react';
import { Aurora } from './Aurora.jsx';
import { Button } from '../core/Button.jsx';
import { Logo } from '../core/Logo.jsx';
import { Kicker } from '../core/Kicker.jsx';
import './SiteFooter.css';

/* Closing CTA and footer as one Ink scene: aurora light, a giant outlined wordmark behind
   everything, the USP band running through, then the link columns and the legal line.
   Deliberately NOT taken from the reference: no glass/backdrop-blur pills (the brand has no
   frosted surfaces), no emoji badge, no GSAP. Reveals use the page-wide [data-reveal] observer,
   the band is a CSS keyframe with a pause button; it also pauses while off screen and stands
   still for reduced motion. All styles live in SiteFooter.css. */

const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';

function PauseIcon() {
  return (
    <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
      <rect x="2.5" y="1.5" width="3" height="11" rx="1" fill="currentColor" />
      <rect x="8.5" y="1.5" width="3" height="11" rx="1" fill="currentColor" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 14 14" aria-hidden="true" focusable="false">
      <path d="M3.5 1.8v10.4a.6.6 0 0 0 .9.5l8.2-5.2a.6.6 0 0 0 0-1L4.4 1.3a.6.6 0 0 0-.9.5Z" fill="currentColor" />
    </svg>
  );
}

function ArrowUp() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

function UspBand({ usps, assetBase }) {
  const ref = React.useRef(null);
  const bandId = React.useId() + '-usp';
  const [paused, setPaused] = React.useState(false);

  /* Off screen the band stops (written straight to the DOM, no re-render) */
  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([entry]) => { el.dataset.offscreen = entry.isIntersecting ? '0' : '1'; });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const run = usps.concat(usps);
  return (
    <div ref={ref} className="dd-usp" data-paused={paused ? '1' : '0'}>
      <div className="dd-usp-bar">
        <div className="dd-usp-head">
          <button type="button" className="dd-usp-toggle" aria-controls={bandId} aria-label="Laufband anhalten" aria-pressed={paused}
            onClick={() => setPaused((v) => !v)}>
            {paused ? <PlayIcon /> : <PauseIcon />}
          </button>
        </div>
      </div>
      <div className="dd-usp-band" id={bandId}>
        <ul className="dd-usp-track">
          {run.map((usp, i) => (
            <li key={usp + '-' + i} className="dd-usp-item" aria-hidden={i >= usps.length ? 'true' : undefined}>
              <span className="dd-usp-text">{usp}</span>
              <img src={assetBase + '/dd-mark-lime.svg'} alt="" width="13" height="14" loading="lazy" decoding="async" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function SiteFooter({
  kicker = 'Letzter Schritt',
  headline,
  sub,
  ctaLabel = 'Setup-Check anfragen',
  onCta,
  usps = [],
  columns = [],
  regions = [],
  regionsTitle = 'Regionen',
  legal,
  copyright,
  claim,
  wordmark = 'digital decision',
  assetBase = '/assets',
  onNavigate,
  style
}) {
  const toTop = () => {
    const reduce = window.matchMedia && window.matchMedia(REDUCE_QUERY).matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <footer className="dd-footer dd-on-dark" style={style}>
      <Aurora origin="bottom-right" intensity={0.32} bleed={0} />

      {/* giant outlined wordmark, pinned to the bottom edge */}
      <div className="dd-footer-wordmark" aria-hidden="true">{wordmark}</div>

      <div className="dd-footer-content">
        {/* closing CTA */}
        <div className="dd-footer-cta" data-reveal>
          {kicker ? <div className="dd-footer-kicker"><Kicker tone="limeText">{kicker}</Kicker></div> : null}
          <h2 className="dd-footer-headline">{headline}</h2>
          {sub ? <p className="dd-footer-sub">{sub}</p> : null}
          <Button size="lg" arrow onClick={onCta}>{ctaLabel}</Button>
        </div>

        {usps.length ? <UspBand usps={usps} assetBase={assetBase} /> : null}

        {/* columns */}
        <div className="dd-footer-cols" data-reveal data-reveal-delay={70}>
          <div className="dd-footer-brand">
            <span className="dd-footer-logo"><Logo variant="wordmark" tone="lime" height={72} assetBase={assetBase} /></span>
            {claim ? <p className="dd-footer-claim">{claim}</p> : null}
          </div>
          {columns.map((col) => (
            /* long entries (mail, address) get the full row on phones instead of breaking mid-word */
            <div key={col.title} data-wide={col.items.some((it) => it.label.length > 22) ? '1' : undefined}>
              <div className="dd-footer-col-title"><Kicker tone="limeText">{col.title}</Kicker></div>
              <ul className="dd-footer-col-links">
                {col.items.map((item) => (
                  <li key={item.label}>
                    {item.anchor || item.href ? (
                      <a className="dd-footer-link" href={item.anchor ? '#' + item.anchor : item.href}
                        onClick={(e) => { if (item.anchor && onNavigate) { e.preventDefault(); onNavigate('home', item.anchor); } }}>
                        {item.label}
                      </a>
                    ) : (
                      <span className="dd-footer-text">{item.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Regionen: reine Keyword-Liste als Text, keine Links */}
        {regions.length ? (
          <div className="dd-footer-regions">
            <div className="dd-footer-col-title"><Kicker tone="limeText">{regionsTitle}</Kicker></div>
            <ul className="dd-footer-regions-list">
              {regions.map((region) => <li key={region.label}>{region.label}</li>)}
            </ul>
          </div>
        ) : null}

        {/* bottom bar */}
        <div className="dd-footer-bottom">
          <span className="dd-footer-legal">{legal}</span>
          <span className="dd-footer-bottom-end">
            <span className="dd-footer-legal">{copyright}</span>
            <button type="button" className="dd-top" onClick={toTop} aria-label="Nach oben"><ArrowUp /></button>
          </span>
        </div>
      </div>
    </footer>
  );
}
