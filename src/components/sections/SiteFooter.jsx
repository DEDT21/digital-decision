import React from 'react';
import { Aurora } from './Aurora.jsx';
import { Button } from '../core/Button.jsx';
import { Logo } from '../core/Logo.jsx';
import { Kicker } from '../core/Kicker.jsx';

/* Closing CTA and footer as one Ink scene: aurora light, a giant outlined wordmark behind
   everything, the USP band running through, then the link columns and the legal line.
   Deliberately NOT taken from the reference: no glass/backdrop-blur pills (the brand has no
   frosted surfaces), no emoji badge, no GSAP — reveals are one-shot IntersectionObserver
   transitions and the band is a CSS keyframe, both off the main thread. */

const STYLE_ID = 'dd-site-footer-styles';

function ensureStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent =
    '@keyframes dd-usp{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}'
    + '.dd-usp-track{animation:dd-usp var(--dd-usp-duration,38s) linear infinite;will-change:transform}'
    + '.dd-footer-reveal{opacity:0;transform:translateY(14px);transition:opacity 420ms cubic-bezier(0.23,1,0.32,1),transform 420ms cubic-bezier(0.23,1,0.32,1)}'
    + '.dd-footer-reveal[data-shown="1"]{opacity:1;transform:translateY(0)}'
    + '.dd-footer-link{color:var(--dd-on-ink-muted);text-decoration:none;transition:color 160ms cubic-bezier(0.23,1,0.32,1)}'
    + '.dd-footer-link:hover{color:var(--dd-white)}'
    + '.dd-top{transition:transform 160ms cubic-bezier(0.23,1,0.32,1),border-color 160ms cubic-bezier(0.23,1,0.32,1),color 160ms cubic-bezier(0.23,1,0.32,1)}'
    + '.dd-top:active{transform:scale(0.97)}'
    + '@media (hover:hover) and (pointer:fine){.dd-top:hover{border-color:var(--dd-white);color:var(--dd-white)}}'
    + '@media (prefers-reduced-motion: reduce){.dd-usp-track{animation:none}.dd-footer-reveal{opacity:1;transform:none;transition:none}}';
  document.head.appendChild(el);
}

export function SiteFooter({
  kicker = 'Letzter Schritt',
  headline,
  sub,
  ctaLabel = 'Setup-Check anfragen',
  onCta,
  usps = [],
  columns = [],
  legal,
  copyright,
  claim,
  wordmark = 'digital decision',
  assetBase = '/assets',
  onNavigate,
  style
}) {
  const revealRefs = React.useRef([]);

  React.useEffect(ensureStyles, []);

  React.useEffect(() => {
    const nodes = revealRefs.current.filter(Boolean);
    if (!nodes.length) return;
    if (typeof IntersectionObserver === 'undefined') { nodes.forEach((n) => n.setAttribute('data-shown', '1')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const i = nodes.indexOf(entry.target);
        setTimeout(() => entry.target.setAttribute('data-shown', '1'), Math.max(0, i) * 70);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const run = usps.concat(usps);

  return (
    <footer style={{ position: 'relative', background: 'var(--surface-dark)', color: 'var(--text-on-dark)', overflow: 'hidden', ...style }}>
      <Aurora origin="bottom-right" intensity={0.32} bleed={0} />

      {/* giant outlined wordmark, pinned to the bottom edge */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '50%', bottom: '-2.5vw', transform: 'translateX(-50%)', whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none', font: 'var(--fw-bold) 17vw/0.78 var(--font-head)', letterSpacing: '-0.04em', color: 'transparent', WebkitTextStroke: '1px rgba(255,255,255,0.07)' }}>
        {wordmark}
      </div>

      <div style={{ position: 'relative' }}>
        {/* closing CTA */}
        <div className="dd-footer-reveal" ref={(el) => { revealRefs.current[0] = el; }}
          style={{ padding: 'var(--pad-section-y) var(--pad-page-x) var(--space-16)', maxWidth: 'var(--measure-wide)', margin: '0 auto', textAlign: 'center' }}>
          {kicker ? <div style={{ marginBottom: 'var(--space-5)' }}><Kicker tone="limeText">{kicker}</Kicker></div> : null}
          <h2 style={{ font: 'var(--text-h2)', letterSpacing: 'var(--ls-heading)', margin: '0 auto var(--space-5)', maxWidth: 880 }}>{headline}</h2>
          {sub ? <p style={{ font: 'var(--text-lead)', color: 'var(--text-on-dark-secondary)', maxWidth: 'var(--measure)', margin: '0 auto var(--space-8)', textWrap: 'pretty' }}>{sub}</p> : null}
          <Button size="lg" onClick={onCta}>{ctaLabel}</Button>
        </div>

        {/* USP band */}
        {usps.length ? (
          <div style={{ overflow: 'hidden', padding: 'var(--space-6) 0', maskImage: 'linear-gradient(to right, transparent, #000 80px, #000 calc(100% - 80px), transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, #000 80px, #000 calc(100% - 80px), transparent)' }}>
            <div className="dd-usp-track" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-10)', paddingRight: 'var(--space-10)', width: 'max-content' }}>
              {run.map((usp, i) => (
                <span key={usp + '-' + i} aria-hidden={i >= usps.length} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-10)', flex: '0 0 auto' }}>
                  <span style={{ font: 'var(--text-h3)', fontFamily: 'var(--font-head)', fontWeight: 'var(--fw-medium)', fontSize: '25px', letterSpacing: 'var(--ls-heading)', color: 'var(--text-on-dark)', whiteSpace: 'nowrap' }}>{usp}</span>
                  <img src={assetBase + '/dd-mark-lime.svg'} alt="" loading="lazy" decoding="async" style={{ height: 14, width: 'auto', display: 'block', opacity: 0.9 }} />
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* columns */}
        <div className="dd-footer-reveal" ref={(el) => { revealRefs.current[1] = el; }}
          style={{ maxWidth: 'var(--measure-wide)', margin: '0 auto', padding: 'var(--space-16) var(--pad-page-x) 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 'var(--space-10)' }}>
          <div>
            <Logo variant="wordmark" tone="lime" height={72} assetBase={assetBase} />
            {claim ? <p style={{ font: 'var(--text-copy)', color: 'var(--text-on-dark-secondary)', maxWidth: 300, margin: 'var(--space-6) 0 0', textWrap: 'pretty' }}>{claim}</p> : null}
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <div style={{ marginBottom: 'var(--space-5)' }}><Kicker tone="limeText">{col.title}</Kicker></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {col.items.map((item) => (
                  item.anchor || item.href ? (
                    <a key={item.label} className="dd-footer-link" href={item.anchor ? '#' + item.anchor : item.href}
                      onClick={(e) => { if (item.anchor && onNavigate) { e.preventDefault(); onNavigate('home', item.anchor); } }}
                      style={{ font: 'var(--text-copy)', fontSize: 14 }}>{item.label}</a>
                  ) : (
                    <span key={item.label} style={{ font: 'var(--text-copy)', fontSize: 14, color: 'var(--dd-on-ink-muted)' }}>{item.label}</span>
                  )
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* bottom bar */}
        <div style={{ maxWidth: 'var(--measure-wide)', margin: '0 auto', padding: 'var(--space-16) var(--pad-page-x) var(--space-10)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
          <span style={{ font: 'var(--text-caption)', color: 'var(--text-on-dark-secondary)' }}>{legal}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)' }}>
            <span style={{ font: 'var(--text-caption)', color: 'var(--text-on-dark-secondary)' }}>{copyright}</span>
            <button className="dd-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Nach oben"
              style={{ width: 44, height: 44, borderRadius: 'var(--radius-pill)', background: 'transparent', border: 'var(--border-on-dark)', color: 'var(--dd-on-ink-muted)', cursor: 'pointer', font: 'var(--text-copy)', fontSize: 18, lineHeight: 1 }}>↑</button>
          </span>
        </div>
      </div>
    </footer>
  );
}
