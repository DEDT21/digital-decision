import React from 'react';
import './PhaseFlow.css';

/* "Vom Chaos zu klaren Entscheidungen" as a pinned scroll scene.
   The wrapper is tall (default 220vh); its inner stage is sticky and exactly one viewport high,
   so the page freezes here and the scroll wheel scrubs the animation instead of moving content
   away. Headline, canvas and phase cards stay on screen the whole time.
   The canvas is full-bleed, so the strands enter from the far left and leave at the far right.
   Chaos is warm white, order is Lime; Violet never appears on Ink.

   Layout and mode (pinned / calm) live in PhaseFlow.css media queries, so the first render is
   deterministic and prerender-safe. JS only drives progress and the canvas:
   - WebGL starts when the section comes within 300px of the viewport.
   - The render loop runs only while the section is on screen and the tab is visible, and only
     while something changes: the lines keep moving for a moment after the last scroll input,
     then ease to a standstill (no endless motion, WCAG 2.2.2).
   - Progress bar and label are written straight to the DOM; React re-renders only when the
     active phase or the status label actually changes.
   - Reduced motion: no pinning, frozen time, no pulse. One static frame. */

const FRAG = `precision mediump float;
uniform float u_time;
uniform float u_progress;
uniform float u_pulse;
uniform vec2 u_resolution;

void main() {
  /* x normalised to the canvas (0 = far left, 1 = far right) so the sorting front always
     crosses the whole width, no matter how wide the full-bleed canvas gets.
     y stays aspect-correct. */
  float nx = gl_FragCoord.x / u_resolution.x;
  float y = (gl_FragCoord.y - 0.5 * u_resolution.y) / u_resolution.y;

  /* Sorting finishes by the end of "Klarheit" (phase 3 of 4): straight lines there. */
  float p = clamp(u_progress / 0.72, 0.0, 1.0);
  /* "Vorsprung" (last quarter): the lanes turn into a growth chart and climb. */
  float g = smoothstep(0.76, 1.0, u_progress);
  float rise = g * pow(nx, 3.4) * 0.40;

  /* the glow is accumulated separately from the ground so the far field stays exactly Ink */
  vec3 glowCol = vec3(0.0);
  for (float i = 0.0; i < 6.0; i++) {
    float lane = (mod(i, 3.0) - 1.0) * 0.17 * (1.0 - 0.34 * g);
    /* front sweeps past the right edge at p = 1, so ramp is 0 everywhere then */
    float ramp = clamp((nx - p * 1.25 + 0.12) / 0.34, 0.0, 1.0);
    float wob = sin(u_time * (0.7 + i * 0.21) + nx * (9.0 + i * 3.3)) * 0.17
              + sin(u_time * (1.1 + i * 0.13) + nx * (21.0 + i * 6.9)) * 0.065
              + (mod(i, 2.0) - 0.5) * 0.10;
    /* the group drops a touch as it climbs so the curve stays inside the frame,
       and the lanes fan out slightly: a chart, not a bundle of cables */
    float center = lane + wob * ramp + rise - 0.14 * g;
    float d = abs(y - center);
    /* core line plus a wide soft halo; both decay to zero so no haze is left over */
    float core = 0.0011 / (d + 0.0016);
    float halo = 0.020 * exp(-d * 26.0);
    float glow = (core + halo) * exp(-d * 3.2);
    /* a pulse of light runs along the lines while they grow (off for reduced motion) */
    float pulse = exp(-pow((nx - fract(u_time * 0.32)) * 7.0, 2.0)) * g * u_pulse;
    float order = 1.0 - ramp;
    glowCol += glow * (1.0 + 0.9 * pulse) * mix(vec3(0.72, 0.72, 0.68), vec3(0.776, 0.941, 0.294), max(order, g));
  }

  /* faint baseline appears with the chart */
  float axis = 0.0016 / (abs(y + 0.30) + 0.0022);
  glowCol += axis * g * 0.45 * vec3(0.72, 0.72, 0.68);

  /* fade the glow out well before the top and bottom edges so the canvas has no visible border */
  float ny = gl_FragCoord.y / u_resolution.y;
  float edge = smoothstep(0.0, 0.17, ny) * smoothstep(0.0, 0.17, 1.0 - ny);

  vec3 ink = vec3(0.039216);
  gl_FragColor = vec4(ink + glowCol * edge, 1.0);
}`;

const VERT = `attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }`;

/* Must match the pinned media query in PhaseFlow.css */
const PIN_QUERY = '(prefers-reduced-motion: no-preference) and (min-height: 480px)';
const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';
/* Wheel/trackpad input arrives in steps and gets light smoothing; touch scroll is fine-grained
   already and is applied directly. */
const SMOOTH_QUERY = '(hover: hover) and (pointer: fine)';

const LABELS = ['Chaos', 'Wird sortiert', 'Klarheit', 'Vorsprung'];
const labelIndex = (p) => (p < 0.1 ? 0 : p >= 0.82 ? 3 : p >= 0.68 ? 2 : 1);

/* Frozen moment used before the first scroll input and for reduced motion */
const STATIC_TIME = 1.7;
/* How long the lines keep moving after the last scroll input; the last 900ms ease out */
const LIVE_MS = 2600;
const EASE_OUT_MS = 900;

function createRenderer(canvas) {
  const gl = canvas.getContext('webgl', { antialias: true, alpha: false, powerPreference: 'low-power' })
    || canvas.getContext('experimental-webgl');
  if (!gl) return null;

  const compile = (type, src) => {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { gl.deleteShader(sh); return null; }
    return sh;
  };
  const vs = compile(gl.VERTEX_SHADER, VERT);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, 'u_time');
  const uProg = gl.getUniformLocation(prog, 'u_progress');
  const uPulse = gl.getUniformLocation(prog, 'u_pulse');
  const uRes = gl.getUniformLocation(prog, 'u_resolution');

  const resize = () => {
    /* 1.5x is plenty for soft glow lines and keeps the fragment cost down on retina screens */
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.max(1, Math.floor((canvas.clientWidth || 1) * dpr));
    const h = Math.max(1, Math.floor((canvas.clientHeight || 1) * dpr));
    if (canvas.width === w && canvas.height === h) return;
    canvas.width = w; canvas.height = h;
    gl.viewport(0, 0, w, h);
    gl.uniform2f(uRes, w, h);
  };
  gl.uniform2f(uRes, canvas.width, canvas.height);
  resize();

  return {
    resize,
    draw(time, progress, pulse) {
      gl.uniform1f(uTime, time);
      gl.uniform1f(uProg, progress);
      gl.uniform1f(uPulse, pulse);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    },
    destroy() {
      gl.deleteProgram(prog); gl.deleteShader(vs); gl.deleteShader(fs); gl.deleteBuffer(buf);
    }
  };
}

export function PhaseFlow({ phases = [], kicker, title, lead, scrollLength = 220, id = 'phasen', style }) {
  const sectionRef = React.useRef(null);
  const trackRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const barRef = React.useRef(null);
  const count = Math.max(phases.length, 1);
  const countRef = React.useRef(count);
  countRef.current = count;

  /* Deterministic first render: pinned, scene at its start. The effect corrects both. */
  const [pinned, setPinned] = React.useState(true);
  const [current, setCurrent] = React.useState(0);
  const [label, setLabel] = React.useState(0);
  const [fallback, setFallback] = React.useState(false);

  React.useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof window.matchMedia !== 'function' || typeof IntersectionObserver === 'undefined') return undefined;
    const pinMql = window.matchMedia(PIN_QUERY);
    const reduceMql = window.matchMedia(REDUCE_QUERY);
    const smoothMql = window.matchMedia(SMOOTH_QUERY);

    let pinnedNow = pinMql.matches;
    let near = false;
    let inView = false;
    let renderer = null;
    let glTried = false;
    let raf = 0;
    let last = 0;
    let target = 0;
    let shown = -1;
    let time = STATIC_TIME;
    let liveUntil = 0;
    let idx = 0;
    let lab = 0;

    const apply = (p) => {
      shown = p;
      if (barRef.current) barRef.current.style.transform = 'scaleX(' + p.toFixed(3) + ')';
      const n = countRef.current;
      const nextIdx = Math.min(n - 1, Math.floor(p * n * 0.999));
      if (nextIdx !== idx) { idx = nextIdx; setCurrent(nextIdx); }
      const nextLab = labelIndex(p);
      if (nextLab !== lab) { lab = nextLab; setLabel(nextLab); }
    };

    const measure = () => {
      const el = trackRef.current;
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      const travel = Math.max(1, r.height - window.innerHeight);
      return Math.min(1, Math.max(0, -r.top / travel));
    };

    const drawNow = () => { if (renderer) renderer.draw(time, Math.max(0, shown), reduceMql.matches ? 0 : 1); };

    const loop = (now) => {
      raf = 0;
      const dt = last ? Math.min(48, now - last) : 16;
      last = now;
      if (shown !== target) {
        let next = smoothMql.matches ? shown + (target - shown) * Math.min(1, dt / 90) : target;
        if (Math.abs(target - next) <= 0.002) next = target;
        apply(next);
      }
      const speed = reduceMql.matches ? 0 : Math.min(1, Math.max(0, (liveUntil - now) / EASE_OUT_MS));
      time += (dt / 1000) * speed;
      drawNow();
      if (inView && !document.hidden && (shown !== target || speed > 0)) raf = requestAnimationFrame(loop);
      else last = 0;
    };

    const wake = (ms) => {
      if (ms) liveUntil = Math.max(liveUntil, performance.now() + ms);
      if (!raf && inView && !document.hidden) raf = requestAnimationFrame(loop);
    };

    const sync = () => {
      if (!pinnedNow) { target = 1; if (shown !== 1) apply(1); drawNow(); return; }
      target = measure();
      /* first measurement and touch input land directly; wheel input is smoothed in the loop */
      if (shown < 0 || !smoothMql.matches) apply(target);
      wake(LIVE_MS);
    };

    const onScroll = () => { if (near) sync(); };

    const initGL = () => {
      if (glTried) return;
      glTried = true;
      const canvas = canvasRef.current;
      renderer = canvas ? createRenderer(canvas) : null;
      if (!renderer) { setFallback(true); return; }
      drawNow();
    };

    /* near: lazy WebGL start 300px ahead; inView: run the loop only while actually visible */
    const nearIO = new IntersectionObserver(([entry]) => {
      near = entry.isIntersecting;
      if (near) { initGL(); sync(); }
    }, { rootMargin: '300px 0px' });
    const viewIO = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) wake(LIVE_MS);
      else if (raf) { cancelAnimationFrame(raf); raf = 0; last = 0; }
    });
    nearIO.observe(section);
    viewIO.observe(section);

    /* canvas size follows the layout (flex in pinned mode, fixed strip in calm mode) */
    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => { if (renderer) { renderer.resize(); drawNow(); } })
      : null;
    if (ro && canvasRef.current) ro.observe(canvasRef.current);

    const onMode = () => {
      pinnedNow = pinMql.matches;
      setPinned(pinnedNow);
      sync();
    };
    const onVisibility = () => {
      if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = 0; last = 0; } }
      else wake(0);
    };

    onMode();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    document.addEventListener('visibilitychange', onVisibility);
    pinMql.addEventListener('change', onMode);
    reduceMql.addEventListener('change', drawNow);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      nearIO.disconnect(); viewIO.disconnect();
      if (ro) ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      pinMql.removeEventListener('change', onMode);
      reduceMql.removeEventListener('change', drawNow);
      if (renderer) renderer.destroy();
    };
  }, []);

  const jumpTo = (i) => {
    const el = trackRef.current;
    if (!el || !pinned) return;
    const travel = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY + travel * ((i + 0.5) / count);
    const reduce = window.matchMedia(REDUCE_QUERY).matches;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  };

  const stateOf = (i) => (i === current ? 'active' : i < current ? 'past' : 'next');
  const titleId = id + '-title';

  const stage = (
    <div className="dd-phase-stage">
      <header className="dd-phase-inner">
        {kicker ? <span className="dd-phase-kicker">{kicker}</span> : null}
        {/* progress sits on the headline row, never under the sticky header */}
        <div className="dd-phase-titlerow">
          {title ? <h2 id={titleId} className="dd-phase-title">{title}</h2> : <span />}
          <span className="dd-phase-status" aria-hidden="true">
            {LABELS[label]}
            <span className="dd-phase-meter"><span ref={barRef} className="dd-phase-meter-fill" /></span>
          </span>
        </div>
        {lead ? <p className="dd-phase-lead">{lead}</p> : null}
      </header>

      {/* Full-bleed animation: no container, no background, edge to edge */}
      <div className="dd-phase-canvas-wrap">
        {fallback ? (
          <svg className="dd-phase-fallback" viewBox="0 0 1000 220" preserveAspectRatio="none" aria-hidden="true">
            {[-40, 0, 40].map((dy) => (
              <path key={dy} d={'M0 ' + (110 + dy) + ' L1000 ' + (110 + dy)} fill="none" stroke="var(--dd-lime)" strokeWidth="6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
        ) : (
          <canvas ref={canvasRef} className="dd-phase-canvas" aria-hidden="true" />
        )}
      </div>

      <div className="dd-phase-inner">
        {/* Desktop (and the calm mode everywhere): four cards. Pinned they jump to their phase. */}
        <ol className="dd-phase-cards">
          {phases.map((p, i) => {
            const content = (
              <>
                <span className="dd-phase-card-label">Phase {i + 1}</span>
                <span className="dd-phase-card-title">{p.title}</span>
                <span className="dd-phase-card-body">{p.body}</span>
              </>
            );
            return (
              <li key={p.title}>
                {pinned ? (
                  <button type="button" className="dd-phase-card" onClick={() => jumpTo(i)}
                    data-state={stateOf(i)} aria-current={i === current ? 'step' : undefined}>
                    {content}
                  </button>
                ) : (
                  <div className="dd-phase-card">{content}</div>
                )}
              </li>
            );
          })}
        </ol>

        {/* Phone, pinned: a marker row plus the text of exactly the active step */}
        <ol className="dd-phase-steps" style={{ '--dd-phase-count': count }}>
          {phases.map((p, i) => (
            <li key={p.title}>
              <button type="button" className="dd-phase-step" onClick={() => jumpTo(i)}
                data-state={stateOf(i)} aria-current={i === current ? 'step' : undefined}
                aria-label={'Phase ' + (i + 1) + ': ' + p.title}>
                {i + 1}
              </button>
            </li>
          ))}
        </ol>
        <div className="dd-phase-now">
          {phases.map((p, i) => (
            <div key={p.title} className="dd-phase-now-item" data-active={i === current ? '1' : '0'} aria-hidden={i === current ? undefined : 'true'}>
              <p className="dd-phase-now-title">{p.title}</p>
              <p className="dd-phase-now-body">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section ref={sectionRef} id={id} className="dd-phase dd-on-dark" aria-labelledby={title ? titleId : undefined} style={style}>
      <div ref={trackRef} className="dd-phase-track" style={{ '--dd-phase-length': scrollLength + 'vh' }}>
        <div className="dd-phase-pin">{stage}</div>
      </div>
    </section>
  );
}
