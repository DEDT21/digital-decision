import React from 'react';

/* "Vom Chaos zu klaren Entscheidungen" as a pinned scroll scene.
   The wrapper is tall (default 300vh); its inner stage is sticky and exactly one viewport high,
   so the page freezes here and the scroll wheel scrubs the animation instead of moving content
   away. Headline, canvas and phase cards stay on screen the whole time.
   The canvas is full-bleed — edge to edge, no card, no border, no radius — so the strands enter
   from the far left and leave at the far right.
   Chaos is warm white, order is Lime; Violet never appears on Ink. */

const FRAG = `precision mediump float;
uniform float u_time;
uniform float u_progress;
uniform vec2 u_resolution;

void main() {
  /* x normalised to the canvas (0 = far left, 1 = far right) so the sorting front always
     crosses the whole width, no matter how wide the full-bleed canvas gets.
     y stays aspect-correct. */
  float nx = gl_FragCoord.x / u_resolution.x;
  float y = (gl_FragCoord.y - 0.5 * u_resolution.y) / u_resolution.y;

  /* Sorting finishes by the end of "Klarheit" (phase 3 of 4) — straight lines there. */
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
       and the lanes fan out slightly — a chart, not a bundle of cables */
    float center = lane + wob * ramp + rise - 0.14 * g;
    float d = abs(y - center);
    /* core line plus a wide soft halo; both decay to zero so no haze is left over */
    float core = 0.0011 / (d + 0.0016);
    float halo = 0.020 * exp(-d * 26.0);
    float glow = (core + halo) * exp(-d * 3.2);
    /* a pulse of light runs along the lines while they grow — momentum, not decoration */
    float pulse = exp(-pow((nx - fract(u_time * 0.32)) * 7.0, 2.0)) * g;
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

const FINE_POINTER = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  ? window.matchMedia('(hover: hover) and (pointer: fine)').matches : false;

function readMode() {
  if (typeof window === 'undefined') return { pinned: true, compact: false };
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return { pinned: !reduce && window.innerHeight >= 480, compact: window.innerHeight < 720 };
}

export function PhaseFlow({ phases = [], kicker, title, lead, scrollLength = 300, id = 'phasen', style }) {
  const wrapRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const initial = React.useRef(readMode()).current;
  /* Not pinned means the scene has no scrubbing input, so it rests in its sorted state. */
  const progressRef = React.useRef(initial.pinned ? 0 : 1);
  const [progress, setProgress] = React.useState(initial.pinned ? 0 : 1);
  const [fallback, setFallback] = React.useState(false);
  const [pinned, setPinned] = React.useState(initial.pinned);
  const [compact, setCompact] = React.useState(initial.compact);
  const [pressed, setPressed] = React.useState(-1);
  const [hovered, setHovered] = React.useState(-1);

  /* Pinning is opt-out: too short a viewport or reduced motion gets the plain stacked version,
     where the whole scene is visible at once and the animation rests in its sorted state. */
  React.useEffect(() => {
    const decide = () => {
      const mode = readMode();
      setPinned(mode.pinned);
      /* short viewports drop the lead and tighten the rhythm so the whole scene still fits one screen */
      setCompact(mode.compact);
      if (!mode.pinned) { progressRef.current = 1; setProgress(1); }
    };
    decide();
    window.addEventListener('resize', decide);
    return () => window.removeEventListener('resize', decide);
  }, []);

  /* Scroll position inside the tall wrapper drives progress 0 → 1. Scrubbing is a direct
     manipulation, so the mapping is 1:1 with only light smoothing to even out wheel steps. */
  React.useEffect(() => {
    if (!pinned) return;
    let frame = 0; let target = 0; let last = 0;
    const measure = () => {
      const el = wrapRef.current;
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      const travel = Math.max(1, r.height - window.innerHeight);
      return Math.min(1, Math.max(0, -r.top / travel));
    };
    const tick = (now) => {
      frame = 0;
      const dt = Math.min(48, now - (last || now));
      last = now;
      let shown = progressRef.current + (target - progressRef.current) * Math.min(1, dt / 90);
      if (Math.abs(target - shown) <= 0.002) shown = target;
      progressRef.current = shown;
      setProgress(shown);
      if (shown !== target) frame = requestAnimationFrame(tick);
    };
    const onScroll = () => { target = measure(); if (!frame) { last = 0; frame = requestAnimationFrame(tick); } };
    target = measure(); progressRef.current = target; setProgress(target);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { if (frame) cancelAnimationFrame(frame); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [pinned]);

  /* WebGL render loop */
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || fallback) return;
    const gl = canvas.getContext('webgl', { antialias: true, alpha: false })
      || canvas.getContext('experimental-webgl');
    if (!gl) { setFallback(true); return; }

    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src); gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(sh)); return null; }
      return sh;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { setFallback(true); return; }
    const prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { setFallback(true); return; }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uProg = gl.getUniformLocation(prog, 'u_progress');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const start = performance.now();
    let raf = 0;
    const draw = () => {
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform1f(uProg, progressRef.current);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      gl.deleteProgram(prog); gl.deleteShader(vs); gl.deleteShader(fs); gl.deleteBuffer(buf);
    };
  }, [fallback]);

  const count = Math.max(phases.length, 1);
  const current = Math.min(count - 1, Math.floor(progress * count * 0.999));
  const label = progress < 0.1 ? 'Chaos' : progress >= 0.82 ? 'Vorsprung' : (progress >= 0.68 ? 'Klarheit' : 'Wird sortiert');

  const jumpTo = (i) => {
    const el = wrapRef.current;
    if (!el || !pinned) return;
    const travel = el.offsetHeight - window.innerHeight;
    const targetProgress = (i + 0.5) / count;
    window.scrollTo({ top: el.offsetTop + travel * targetProgress, behavior: 'smooth' });
  };

  const stage = (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: compact ? 'var(--space-4)' : 'var(--space-6)', height: pinned ? '100vh' : 'auto', paddingTop: pinned ? (compact ? 'calc(84px + var(--space-3))' : 'calc(84px + var(--space-6))') : 'var(--pad-section-y)', paddingBottom: pinned ? (compact ? 'var(--space-6)' : 'var(--space-10)') : 'var(--pad-section-y)', boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* pinned: top padding clears the 84px sticky site header so kicker and progress stay visible */}
      <header style={{ maxWidth: 'var(--measure-wide)', margin: '0 auto', padding: '0 var(--pad-page-x)', width: '100%', flex: '0 0 auto' }}>
        {kicker ? (
          <span style={{ font: 'var(--text-kicker)', fontFamily: 'var(--font-head)', fontWeight: 'var(--fw-medium)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: 'var(--ls-kicker)', color: 'var(--dd-lime)' }}>{kicker}</span>
        ) : null}
        {/* progress sits on the headline row, never under the sticky header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-6)', flexWrap: 'wrap', marginTop: compact ? 'var(--space-3)' : 'var(--space-5)' }}>
          {title ? <h2 style={{ font: 'var(--text-h2)', fontSize: compact ? 'var(--fs-h2-sm)' : 'var(--fs-h2)', letterSpacing: 'var(--ls-heading)', color: 'var(--text-on-dark)', margin: 0, maxWidth: 'var(--measure-headline)' }}>{title}</h2> : <span />}
          <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', font: 'var(--text-caption)', textTransform: 'uppercase', letterSpacing: 'var(--ls-kicker)', color: 'var(--text-on-dark-secondary)' }}>
            {label}
            <span style={{ width: 96, height: 4, borderRadius: 'var(--radius-pill)', background: 'var(--dd-border-dark)', overflow: 'hidden', display: 'block' }}>
              <span style={{ display: 'block', height: '100%', width: '100%', transformOrigin: 'left center', transform: 'scaleX(' + progress.toFixed(3) + ')', background: 'var(--dd-lime)' }} />
            </span>
          </span>
        </div>
        {lead && !compact ? <p style={{ font: 'var(--text-copy)', color: 'var(--text-on-dark-secondary)', maxWidth: 'var(--measure)', margin: 'var(--space-4) 0 0', textWrap: 'pretty' }}>{lead}</p> : null}
      </header>

      {/* full-bleed animation: no container, no background, edge to edge */}
      <div style={{ flex: '1 1 auto', minHeight: 140, display: 'flex', alignItems: 'center' }}>
        {fallback ? (
          <svg viewBox="0 0 1000 220" width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true" style={{ display: 'block' }}>
            {[-40, 0, 40].map((dy) => (
              <path key={dy} d={'M0 ' + (110 + dy) + ' L1000 ' + (110 + dy)} fill="none" stroke="var(--dd-lime)" strokeWidth="6" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
        ) : (
          <canvas ref={canvasRef} aria-hidden="true" style={{ display: 'block', width: '100%', height: '100%', minHeight: 140 }} />
        )}
      </div>

      <div style={{ maxWidth: 'var(--measure-wide)', margin: '0 auto', padding: '0 var(--pad-page-x)', width: '100%', flex: '0 0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 'var(--gap-grid)' }}>
          {phases.map((p, i) => {
            const active = i === current;
            const past = i < current;
            return (
              <button key={p.title} onClick={() => jumpTo(i)}
                onPointerDown={() => setPressed(i)} onPointerUp={() => setPressed(-1)} onPointerLeave={() => { setPressed(-1); setHovered(-1); }}
                onPointerEnter={FINE_POINTER ? () => setHovered(i) : undefined}
                aria-current={active ? 'step' : undefined}
                style={{ textAlign: 'left', cursor: pinned ? 'pointer' : 'default', background: 'transparent', color: active ? 'var(--text-on-dark)' : 'var(--text-on-dark-secondary)', border: 'none', borderTop: active ? '2px solid var(--dd-lime)' : (past ? '2px solid var(--dd-on-ink-muted)' : '2px solid var(--dd-border-dark)'), borderRadius: 0, padding: 'var(--space-4) 0 0', font: 'var(--text-copy)', opacity: active ? 1 : 0.62, transform: pressed === i ? 'scale(0.98)' : 'scale(1)', transition: 'opacity 200ms var(--ease-out-strong), color 200ms var(--ease-out-strong), border-color 200ms var(--ease-out-strong), transform 160ms var(--ease-out-strong)' }}>
                <div style={{ font: 'var(--text-kicker)', fontFamily: 'var(--font-head)', textTransform: 'uppercase', letterSpacing: 'var(--ls-kicker)', fontSize: '12px', color: active ? 'var(--dd-lime)' : 'inherit', marginBottom: 'var(--space-2)' }}>Phase {i + 1}</div>
                <div style={{ font: 'var(--text-h3)', fontFamily: 'var(--font-head)', fontWeight: 'var(--fw-bold)', fontSize: '20px', letterSpacing: 'var(--ls-heading)', marginBottom: 'var(--space-2)', textDecoration: hovered === i && !active ? 'underline' : 'none', textDecorationColor: 'var(--dd-lime)', textUnderlineOffset: '4px' }}>{p.title}</div>
                {!compact || active ? <div style={{ fontSize: '14px', lineHeight: 1.5, textWrap: 'pretty' }}>{p.body}</div> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <section id={id} style={{ background: 'var(--surface-dark)', color: 'var(--text-on-dark)', ...style }}>
      {pinned ? (
        <div ref={wrapRef} style={{ height: scrollLength + 'vh', position: 'relative' }}>
          <div style={{ position: 'sticky', top: 0, height: '100vh' }}>{stage}</div>
        </div>
      ) : stage}
    </section>
  );
}
