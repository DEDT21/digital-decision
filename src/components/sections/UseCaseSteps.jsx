import React from 'react';

/* "Drei Situationen, in denen wir richtig sind." as a pinned scroll scene: the page holds for
   ~300vh while the scroll wheel walks through the three use cases. List on the left, an Ink chart
   panel on the right; both stay on screen the whole time.
   Charts are inline SVG — smooth Catmull-Rom curves, flat area fills, rounded bar caps, count-up
   numbers in a rAF loop. No chart library, no images, no gradients, no shadows; the only rule is a
   faint zero line. Violet is the "problem" series, Lime the one punchline per chart. */

const STYLE_ID = 'dd-usecase-styles';
const REDUCED = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

function ensureStyles() {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent =
    '.dd-uc-draw{stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset 1100ms cubic-bezier(0.23,1,0.32,1)}'
    + '.dd-uc-draw[data-on="1"]{stroke-dashoffset:0}'
    + '.dd-uc-bar{transform:scaleY(0);transform-origin:bottom;transition:transform 900ms cubic-bezier(0.23,1,0.32,1)}'
    + '.dd-uc-bar[data-on="1"]{transform:scaleY(1)}'
    + '.dd-uc-fade{opacity:0;transition:opacity 520ms cubic-bezier(0.23,1,0.32,1)}'
    + '.dd-uc-fade[data-on="1"]{opacity:1}'
    + '.dd-uc-row{transition:opacity 420ms cubic-bezier(0.23,1,0.32,1)}'
    + '.dd-uc-compact .dd-uc-panel{gap:12px}'
    + '.dd-uc-compact .dd-uc-kpi{font-size:26px}'
    + '.dd-uc-compact .dd-uc-punch{font-size:13px}'
    + '@media (prefers-reduced-motion: reduce){.dd-uc-draw{stroke-dashoffset:0;transition:none}.dd-uc-bar{transform:scaleY(1);transition:none}.dd-uc-fade{opacity:1;transition:none}}';
  document.head.appendChild(el);
}

const de = (n, d) => n.toLocaleString('de-DE', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });

function useCountUp(target, runKey, duration) {
  const [value, setValue] = React.useState(REDUCED ? target : 0);
  React.useEffect(() => {
    if (REDUCED) { setValue(target); return; }
    let raf = 0;
    const start = performance.now();
    const span = duration || 1200;
    const step = (now) => {
      const t = Math.min(1, (now - start) / span);
      setValue(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, runKey, duration]);
  return value;
}

/* Catmull-Rom → cubic bezier: smooth curve through the points, no library */
function smooth(points) {
  if (points.length < 2) return '';
  let d = 'M ' + points[0][0].toFixed(1) + ' ' + points[0][1].toFixed(1);
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ' C ' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ', ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ', ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
  }
  return d;
}

const W = 560; const H = 220; const PAD = 14;
const tick = { font: "12px 'Inter', Arial, sans-serif", fill: '#55554E' };
const foot = { font: "11px 'Inter', Arial, sans-serif", fill: '#55554E' };

function Kpi({ value, label, color, trend }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span className="dd-uc-kpi" style={{ font: "700 34px/1 'Space Grotesk', Arial, sans-serif", letterSpacing: '-0.02em', color }}>{value}</span>
        {trend ? <span aria-hidden="true" style={{ font: "700 16px 'Space Grotesk', Arial, sans-serif", color }}>{trend === 'up' ? '↑' : '→'}</span> : null}
      </div>
      <div style={{ font: "12px/1.4 'Inter', Arial, sans-serif", color: '#55554E', marginTop: 5 }}>{label}</div>
    </div>
  );
}

function Panel({ kpis, punchline, children }) {
  return (
    <div className="dd-uc-panel" style={{ display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto', height: '100%', gap: 'var(--space-5)', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', gap: 'var(--space-10)', flexWrap: 'wrap' }}>{kpis}</div>
      <div style={{ minHeight: 0, boxSizing: 'border-box' }}>{children}</div>
      <div>
        <span className="dd-uc-punch" style={{ font: "500 15px/1.2 'Space Grotesk', Arial, sans-serif", color: 'var(--dd-ink)', background: 'var(--highlight-mark)', whiteSpace: 'nowrap', padding: '0 2px' }}>{punchline}</span>
      </div>
    </div>
  );
}

/* ---------- 1 · spend climbs, revenue flat ---------- */
function ChartFlatline({ runKey }) {
  const spend = useCountUp(85, runKey);
  const rev = useCountUp(3, runKey);
  const on = '1';
  const x = (i) => PAD + (i / 23) * (W - PAD * 2);
  const spendPts = Array.from({ length: 24 }, (_, i) => [x(i), H - 34 - (i / 23) * 118 - Math.sin(i / 2.6) * 5]);
  const revPts = Array.from({ length: 24 }, (_, i) => [x(i), 52 + Math.sin(i / 1.9) * 6]);
  const spendLine = smooth(spendPts);
  const area = spendLine + ' L ' + x(23).toFixed(1) + ' ' + (H - 18) + ' L ' + x(0).toFixed(1) + ' ' + (H - 18) + ' Z';
  return (
    <Panel punchline="Mehr Budget ist nicht die Antwort."
      kpis={<><Kpi value={'+' + de(spend) + ' %'} label="Ad-Spend" color="#5936E4" trend="up" /><Kpi value={'+' + de(rev) + ' %'} label="Umsatz" color="#0A0A0A" trend="flat" /></>}>
      <svg viewBox={'0 0 ' + W + ' ' + H} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
        <path className="dd-uc-fade" data-on={on} d={area} fill="rgba(89,54,228,0.10)" style={{ transitionDelay: '260ms' }} />
        <line x1={PAD} y1={H - 18} x2={W - PAD} y2={H - 18} stroke="var(--dd-border)" strokeWidth="1" />
        <path className="dd-uc-draw" data-on={on} pathLength="1" d={spendLine} fill="none" stroke="#5936E4" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        <path className="dd-uc-draw" data-on={on} pathLength="1" d={smooth(revPts)} fill="none" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ transitionDelay: '140ms' }} />
        <circle className="dd-uc-fade" data-on={on} cx={x(23)} cy={spendPts[23][1]} r="4.5" fill="#5936E4" style={{ transitionDelay: '900ms' }} />
        <circle className="dd-uc-fade" data-on={on} cx={x(23)} cy={revPts[23][1]} r="4.5" fill="#0A0A0A" style={{ transitionDelay: '1000ms' }} />
        <text x={PAD} y={H - 2} style={foot}>Monat 1</text>
        <text x={W / 2} y={H - 2} textAnchor="middle" style={foot}>Monat 12</text>
        <text x={W - PAD} y={H - 2} textAnchor="end" style={foot}>Monat 24</text>
      </svg>
    </Panel>
  );
}

/* ---------- 2 · three bars, the third is the job ---------- */
function ChartBars({ runKey }) {
  const store = useCountUp(1.2, runKey);
  const online = useCountUp(38000, runKey);
  const potential = useCountUp(600000, runKey, 1500);
  const on = '1';
  const base = H - 34;
  const bw = 96; const gap = 62;
  const bars = [
    { label: 'Stationär', value: de(store, 1) + ' Mio €', h: 152, fill: '#0A0A0A', delay: 0 },
    { label: 'Online heute', value: de(Math.round(online)) + ' €', h: 14, fill: '#5936E4', delay: 150 },
    { label: 'Online-Potenzial', value: de(Math.round(potential)) + ' €', h: 80, fill: 'rgba(198,240,75,0.35)', dashed: true, delay: 460 }
  ];
  return (
    <Panel punchline="Der dritte Balken ist unser Job."
      kpis={<Kpi value={de(store, 1) + ' Mio €'} label="Umsatz pro Jahr, stationär" color="#0A0A0A" />}>
      <svg viewBox={'0 0 ' + W + ' ' + H} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
        <line x1={PAD} y1={base} x2={W - PAD} y2={base} stroke="var(--dd-border)" strokeWidth="1" />
        {bars.map((b, i) => {
          const bx = 46 + i * (bw + gap);
          return (
            <g key={b.label}>
              <rect className="dd-uc-bar" data-on={on} x={bx} y={base - b.h} width={bw} height={b.h} rx="4"
                fill={b.fill} stroke={b.dashed ? '#C6F04B' : 'none'} strokeWidth={b.dashed ? 1.5 : 0}
                strokeDasharray={b.dashed ? '7 5' : undefined} style={{ transitionDelay: b.delay + 'ms' }} />
              <text className="dd-uc-fade" data-on={on} x={bx + bw / 2} y={base - b.h - 12} textAnchor="middle"
                style={{ font: "700 16px 'Space Grotesk', Arial, sans-serif", fill: b.dashed ? '#0A0A0A' : '#0A0A0A', transitionDelay: (b.delay + 240) + 'ms' }}>{b.value}</text>
              <text x={bx + bw / 2} y={base + 18} textAnchor="middle" style={tick}>{b.label}</text>
            </g>
          );
        })}
      </svg>
    </Panel>
  );
}

/* ---------- 3 · agency cost steps vs. flat effect ---------- */
function ChartSteps({ runKey }) {
  const total = useCountUp(86000, runKey);
  const on = '1';
  const base = H - 34;
  const steps = [[PAD, base], [130, base], [130, base - 46], [258, base - 46], [258, base - 100], [386, base - 100], [386, base - 152], [W - PAD, base - 152]];
  const line = 'M ' + steps.map((p) => p[0] + ' ' + p[1]).join(' L ');
  const area = line + ' L ' + (W - PAD) + ' ' + base + ' L ' + PAD + ' ' + base + ' Z';
  const jumps = [{ x: 134, y: base - 56, label: 'Agentur 1' }, { x: 262, y: base - 110, label: 'Agentur 2' }, { x: 390, y: base - 162, label: 'Agentur 3' }];
  return (
    <Panel punchline="Teuer war es. Anders wird es."
      kpis={<Kpi value={de(Math.round(total)) + ' €'} label="Agenturkosten, kumuliert" color="#5936E4" trend="up" />}>
      <svg viewBox={'0 0 ' + W + ' ' + H} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
        <path className="dd-uc-fade" data-on={on} d={area} fill="rgba(89,54,228,0.10)" style={{ transitionDelay: '300ms' }} />
        <line x1={PAD} y1={base} x2={W - PAD} y2={base} stroke="var(--dd-border)" strokeWidth="1" />
        <path className="dd-uc-draw" data-on={on} pathLength="1" d={line} fill="none" stroke="#5936E4" strokeWidth="3" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <path className="dd-uc-draw" data-on={on} pathLength="1" d={'M ' + PAD + ' ' + (base - 14) + ' L ' + (W - PAD) + ' ' + (base - 18)} fill="none" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" style={{ transitionDelay: '220ms' }} />
        {jumps.map((j, i) => (
          <text key={j.label} className="dd-uc-fade" data-on={on} x={j.x} y={j.y} style={{ ...tick, transitionDelay: (340 + i * 130) + 'ms' }}>{j.label}</text>
        ))}
        <text x={PAD} y={H - 2} style={foot}>Monat 1</text>
        <text x={W - PAD} y={H - 2} textAnchor="end" style={foot}>Monat 24</text>
      </svg>
    </Panel>
  );
}

const CHARTS = [ChartFlatline, ChartBars, ChartSteps];

export function UseCaseSteps({ cases = [], kicker, title, lead, closer, scrollLength = 300, id = 'leistungen', pinned: pinnedProp, style }) {
  const wrapRef = React.useRef(null);
  const barRef = React.useRef(null);
  const idxRef = React.useRef(0);
  /* index is state (it swaps the chart), progress is NOT — writing it to the DOM directly keeps
     scrolling from re-rendering the charts every frame, which is what made them flicker */
  const [index, setIndex] = React.useState(0);
  const [stacked, setStacked] = React.useState(false);
  const [compact, setCompact] = React.useState(false);
  const [pinned, setPinned] = React.useState(() => {
    if (pinnedProp != null) return pinnedProp;
    if (typeof window === 'undefined') return true;
    return !REDUCED && window.innerHeight >= 480;
  });

  React.useEffect(ensureStyles, []);

  React.useEffect(() => {
    const decide = () => {
      setStacked(window.innerWidth < 900);
      setCompact(window.innerHeight < 780);
      if (pinnedProp == null) setPinned(!REDUCED && window.innerHeight >= 480);
    };
    decide();
    window.addEventListener('resize', decide);
    return () => window.removeEventListener('resize', decide);
  }, [pinnedProp]);

  React.useEffect(() => {
    if (!pinned) return;
    let frame = 0;
    const count = Math.max(cases.length, 1);
    const read = () => {
      frame = 0;
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const travel = Math.max(1, r.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -r.top / travel));
      const raw = p * count;
      const i = idxRef.current;
      /* dead band: commit a step only clearly past its boundary, never right on it */
      let next = i;
      if (raw > i + 1.12) next = Math.min(count - 1, i + 1);
      else if (raw < i - 0.12) next = Math.max(0, i - 1);
      if (next !== i) { idxRef.current = next; setIndex(next); }
      if (barRef.current) {
        const within = Math.min(1, Math.max(0, raw - idxRef.current));
        barRef.current.style.transform = 'scaleX(' + within.toFixed(3) + ')';
      }
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(read); };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { if (frame) cancelAnimationFrame(frame); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [pinned, cases.length]);

  const count = Math.max(cases.length, 1);
  const current = Math.min(count - 1, index);
  const Chart = CHARTS[current % CHARTS.length];

  const jumpTo = (i) => {
    const el = wrapRef.current;
    if (!el || !pinned) { idxRef.current = i; setIndex(i); return; }
    const travel = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: el.offsetTop + travel * ((i + 0.5) / count), behavior: 'smooth' });
  };

  const panel = (
    <div className={compact ? 'dd-uc-compact' : undefined}
      style={{ background: 'var(--surface-card)', border: 'var(--border-default)', borderRadius: 'var(--radius-xl)', padding: compact ? 'var(--space-4)' : 'var(--space-7)', height: stacked ? (compact ? 260 : 320) : (compact ? 280 : 400), boxSizing: 'border-box' }}>
      <Chart runKey={current} />
    </div>
  );

  const stage = (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: compact ? 'var(--space-6)' : 'var(--space-10)', height: pinned ? '100vh' : 'auto', padding: pinned ? (compact ? 'var(--space-6) var(--pad-page-x)' : 'var(--space-12) var(--pad-page-x)') : 'var(--pad-section-y) var(--pad-page-x)', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={{ maxWidth: 'var(--measure-wide)', margin: '0 auto', width: '100%' }}>
        {kicker ? <div style={{ font: 'var(--text-kicker)', fontFamily: 'var(--font-head)', fontWeight: 'var(--fw-medium)', fontSize: 14, textTransform: 'uppercase', letterSpacing: 'var(--ls-kicker)', background: 'var(--surface-accent)', color: 'var(--dd-ink)', padding: '4px 12px', borderRadius: 'var(--radius-pill)', display: 'inline-block' }}>{kicker}</div> : null}
        {title ? <h2 style={{ font: 'var(--text-h2)', fontSize: (stacked || compact) ? 'var(--fs-h2-sm)' : 'var(--fs-h2)', letterSpacing: 'var(--ls-heading)', margin: (compact ? 'var(--space-3)' : 'var(--space-5)') + ' 0 0' }}>{title}</h2> : null}
        {lead && !compact ? <p style={{ font: 'var(--text-lead)', color: 'var(--text-secondary)', maxWidth: 'var(--measure)', margin: 'var(--space-4) 0 0', textWrap: 'pretty' }}>{lead}</p> : null}
      </div>

      <div style={{ maxWidth: 'var(--measure-wide)', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: stacked ? '1fr' : '1fr 1fr', gap: stacked ? 'var(--space-8)' : 'var(--space-12)', alignItems: 'center' }}>
        {stacked ? panel : null}
        <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 'var(--space-4)' : 'var(--space-6)' }}>
          {cases.map((c, i) => {
            const on = i === current;
            return (
              <button key={c.title} onClick={() => jumpTo(i)} className="dd-uc-row"
                style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 'var(--space-5)', alignItems: 'start', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer', opacity: on ? 1 : 0.3 }}>
                <span style={{ width: 40, height: 40, borderRadius: 'var(--radius-pill)', display: 'grid', placeItems: 'center', background: on ? 'var(--dd-lime)' : 'transparent', border: on ? 'none' : '1px solid var(--dd-muted)', color: on ? 'var(--dd-ink)' : 'var(--text-secondary)', font: "700 16px 'Space Grotesk', Arial, sans-serif", transition: 'background-color 200ms cubic-bezier(0.23,1,0.32,1), border-color 200ms cubic-bezier(0.23,1,0.32,1), color 200ms cubic-bezier(0.23,1,0.32,1)' }}>{i + 1}</span>
                <span>
                  <span style={{ display: 'block', font: 'var(--text-h3)', fontFamily: 'var(--font-head)', fontWeight: 'var(--fw-bold)', fontSize: 20, letterSpacing: 'var(--ls-heading)' }}>{c.title}</span>
                  {!compact || on ? <span style={{ display: 'block', font: 'var(--text-copy)', fontSize: compact ? 14 : 16, color: 'var(--text-secondary)', marginTop: 'var(--space-2)', textWrap: 'pretty' }}>{c.body}</span> : null}
                  {on ? (
                    <span style={{ display: 'block', height: 2, background: 'var(--dd-border)', marginTop: 'var(--space-4)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
                      <span ref={barRef} style={{ display: 'block', height: '100%', width: '100%', background: 'var(--dd-lime)', transformOrigin: 'left center', transform: 'scaleX(0)' }} />
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
        {stacked ? null : panel}
      </div>

      {closer ? (
        <p style={{ maxWidth: 'var(--measure)', margin: '0 auto', textAlign: 'center', font: 'var(--text-lead)', fontSize: compact ? 15 : 20, color: 'var(--text-primary)', textWrap: 'pretty' }}>{closer}</p>
      ) : null}
    </div>
  );

  return (
    <section id={id} style={{ background: 'var(--surface-page)', color: 'var(--text-primary)', ...style }}>
      {pinned ? (
        <div ref={wrapRef} style={{ height: scrollLength + 'vh', position: 'relative' }}>
          <div style={{ position: 'sticky', top: 0, height: '100vh' }}>{stage}</div>
        </div>
      ) : stage}
    </section>
  );
}
