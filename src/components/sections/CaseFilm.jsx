import React from 'react';
import { createPortal, flushSync } from 'react-dom';
import './CaseFilm.css';

/* Film-Panel der Feature-Case-Karte: stummer Teaser (9:16) als Vorschau, ein Klick öffnet den
   Case-Study-Film mit Ton in einem Vollbild-Dialog ("Portal").

   Teaser: Der erste Render (SSR) ist ein <video> ohne src, nur mit Poster. Im Client setzt ein
   IntersectionObserver die Quelle, sobald das Panel ~600px vor dem Viewport ist, und spielt ab
   ≥40 % Sichtbarkeit. Außerhalb des Viewports, bei verstecktem Tab und solange der Film offen
   ist, pausiert er. Bei prefers-reduced-motion oder Save-Data wird er nie geladen (nur Poster).

   Portal: Das Overlay (Ink) zieht sich per clip-path: inset(... round R) vom Rechteck des
   Panels auf den vollen Viewport auf, der Film blendet dabei ein. Damit das Panel beim Klick
   nicht schwarz aufblitzt, liegt im Overlay ein "Ghost": ein Canvas mit dem aktuellen Bild des
   Panels (Teaser-Frame oder Poster), exakt deckungsgleich. Er löst sich beim Aufziehen auf und
   kommt beim Schließen zurück, wenn das Portal wieder ins frisch gemessene Panel schrumpft.
   Animiert wird mit der Web Animations API (keine CSS-Injection).
   Das Overlay wird per Portal erst nach dem ersten Klick gerendert, SSR kennt es nicht.

   iOS: video.play() läuft SYNCHRON im Klick-Handler (flushSync rendert das Overlay vorher),
   sonst gibt Safari den Ton nicht frei.

   Hover (nur Maus, ohne reduced motion): Die Play-Pill folgt dem Zeiger innerhalb des Panels
   mit weicher Verzögerung (rAF-Lerp, nur transform), der Teaser skaliert minimal (CSS). */

const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)'; /* = --ease-out-strong */
const OPEN_MS = 650;
const CLOSE_MS = 560;
const FADE_MS = 150; /* reduced motion: nur kurzer Fade */
const NEAR_MARGIN = '600px 0px';
const PLAY_RATIO = 0.4;
const FULL_CLIP = 'inset(0px 0px 0px 0px round 0px)';

const mq = (query) => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia(query).matches;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(v, Math.max(lo, hi)));

/* "0:45" → "45 Sekunden", "1:05" → "1 Minute 5 Sekunden" (für den Namen des Buttons) */
function spokenDuration(value) {
  const m = /^(\d+):(\d{2})$/.exec(value || '');
  if (!m) return value || '';
  const min = Number(m[1]);
  const sec = Number(m[2]);
  const parts = [];
  if (min) parts.push(min + (min === 1 ? ' Minute' : ' Minuten'));
  if (sec || !min) parts.push(sec + (sec === 1 ? ' Sekunde' : ' Sekunden'));
  return parts.join(' ');
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M7 4.6v14.8a1 1 0 0 0 1.52.85l12.04-7.4a1 1 0 0 0 0-1.7L8.52 3.75A1 1 0 0 0 7 4.6Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

/* Alles außerhalb des Overlays inert setzen (Muster aus ServiceBadges.jsx). Das Overlay hängt
   per Portal direkt am <body>, also reicht eine Ebene. Nur selbst gesetzte Attribute werden
   später wieder entfernt. */
function inertOutside(node) {
  const changed = [];
  let el = node;
  while (el && el.parentElement && el !== document.body) {
    const parent = el.parentElement;
    for (const sib of Array.from(parent.children)) {
      if (sib === el || sib.hasAttribute('inert')) continue;
      if (sib.tagName === 'SCRIPT' || sib.tagName === 'STYLE' || sib.tagName === 'LINK') continue;
      sib.setAttribute('inert', '');
      changed.push(sib);
    }
    el = parent;
  }
  return () => changed.forEach((n) => n.removeAttribute('inert'));
}

/* Scroll-Sperre wie in ServiceBadges.jsx: overflow:hidden am <html> (kein position:fixed, das
   würde die Scrollposition verlieren) plus ein nicht-passiver touchmove-Filter für ältere
   iOS-Versionen. Im Overlay scrollt nichts; Gesten auf dem Video selbst (Scrubben in den
   nativen Controls) bleiben unangetastet. */
function lockScroll(keep) {
  const html = document.documentElement;
  const body = document.body;
  const prevOverflow = html.style.overflow;
  const prevPad = body.style.paddingRight;
  const gutter = window.innerWidth - html.clientWidth;
  html.style.overflow = 'hidden';
  if (gutter > 0) body.style.paddingRight = gutter + 'px';

  const onMove = (e) => {
    if (e.touches.length !== 1) return; /* Pinch-Zoom nicht blockieren */
    if (keep && e.target instanceof Node && keep.contains(e.target)) return;
    if (e.cancelable) e.preventDefault();
  };
  document.addEventListener('touchmove', onMove, { passive: false });

  return () => {
    document.removeEventListener('touchmove', onMove);
    html.style.overflow = prevOverflow;
    body.style.paddingRight = prevPad;
  };
}

export function CaseFilm({ film, client }) {
  const [phase, setPhase] = React.useState('closed'); /* closed | open | closing */
  const [portal, setPortal] = React.useState(false);
  const [portrait, setPortrait] = React.useState(false);
  const [live, setLive] = React.useState(false);

  const triggerRef = React.useRef(null);
  const teaserRef = React.useRef(null);
  const mediaRef = React.useRef(null);
  const stillRef = React.useRef(null);
  const pillRef = React.useRef(null);
  const ghostRef = React.useRef(null);
  const overlayRef = React.useRef(null);
  const frameRef = React.useRef(null);
  const filmRef = React.useRef(null);
  const closeRef = React.useRef(null);

  const phaseRef = React.useRef('closed');
  const animsRef = React.useRef([]);
  const undoInertRef = React.useRef(null);
  const unlockRef = React.useRef(null);
  const teaserSyncRef = React.useRef(null);

  const landscapeSrc = film.src;
  const portraitSrc = film.srcPortrait || film.src;
  const durationText = spokenDuration(film.duration);
  const buttonName = (film.label || 'Film ansehen') + (durationText ? ', ' + durationText : '');

  /* ---------- Teaser: spät laden, nur sichtbar abspielen ---------- */
  React.useEffect(() => {
    const v = teaserRef.current;
    const trigger = triggerRef.current;
    if (!v || !trigger || !film.teaser) return undefined;
    const conn = typeof navigator !== 'undefined' ? navigator.connection : null;
    if (conn && (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''))) return undefined;
    const reduceMql = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const reduced = () => !!(reduceMql && reduceMql.matches);

    /* Autoplay geht nur stumm. React setzt `muted` nicht zuverlässig als Attribut. */
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute('muted', '');

    const st = { near: false, inView: false, loaded: false };
    const sync = () => {
      if (st.near && !st.loaded && !reduced()) {
        v.preload = 'auto';
        v.src = film.teaser;
        st.loaded = true;
      }
      const run = st.loaded && st.inView && !reduced() && !document.hidden && phaseRef.current === 'closed';
      if (run) {
        if (v.paused) {
          const p = v.play();
          if (p && typeof p.catch === 'function') p.catch(() => {}); /* z. B. iOS-Stromsparmodus: Poster bleibt */
        }
      } else if (!v.paused) {
        v.pause();
      }
    };
    teaserSyncRef.current = sync;

    const onPlaying = () => setLive(true);
    v.addEventListener('playing', onPlaying);

    let ioNear = null;
    let ioView = null;
    if (typeof IntersectionObserver === 'undefined') {
      st.near = true;
      st.inView = true;
      sync();
    } else {
      ioNear = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        st.near = true;
        ioNear.disconnect();
        sync();
      }, { rootMargin: NEAR_MARGIN });
      ioView = new IntersectionObserver((entries) => {
        const e = entries[entries.length - 1];
        if (e.isIntersecting && e.intersectionRatio >= PLAY_RATIO - 0.001) st.inView = true;
        else if (!e.isIntersecting) st.inView = false;
        sync();
      }, { threshold: [0, PLAY_RATIO] });
      ioNear.observe(trigger);
      ioView.observe(trigger);
    }

    document.addEventListener('visibilitychange', sync);
    if (reduceMql) {
      if (reduceMql.addEventListener) reduceMql.addEventListener('change', sync); else reduceMql.addListener(sync);
    }

    return () => {
      teaserSyncRef.current = null;
      v.removeEventListener('playing', onPlaying);
      if (ioNear) ioNear.disconnect();
      if (ioView) ioView.disconnect();
      document.removeEventListener('visibilitychange', sync);
      if (reduceMql) {
        if (reduceMql.removeEventListener) reduceMql.removeEventListener('change', sync); else reduceMql.removeListener(sync);
      }
      if (!v.paused) v.pause();
    };
  }, [film.teaser]);

  /* ---------- Hover: Play-Pill folgt dem Zeiger (magnetisch, rAF-Lerp) ---------- */
  React.useEffect(() => {
    const trigger = triggerRef.current;
    const pill = pillRef.current;
    if (!trigger || !pill || typeof window.matchMedia !== 'function') return undefined;
    const hoverMql = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduceMql = window.matchMedia('(prefers-reduced-motion: reduce)');
    const s = { x: 0, y: 0, sc: 1, tx: 0, ty: 0, tsc: 1, raf: 0, last: 0, box: null };
    const MARGIN = 12;

    const apply = () => {
      const rest = Math.abs(s.x) < 0.05 && Math.abs(s.y) < 0.05 && Math.abs(s.sc - 1) < 0.0005;
      pill.style.transform = rest ? '' : `translate3d(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px, 0) scale(${s.sc.toFixed(4)})`;
    };
    const tick = (now) => {
      const dt = s.last ? Math.min(64, now - s.last) : 16.7;
      s.last = now;
      const k = 1 - Math.pow(1 - 0.14, dt / 16.7); /* bildratenunabhängige Verzögerung */
      s.x += (s.tx - s.x) * k;
      s.y += (s.ty - s.y) * k;
      s.sc += (s.tsc - s.sc) * k;
      if (Math.abs(s.tx - s.x) < 0.1 && Math.abs(s.ty - s.y) < 0.1 && Math.abs(s.tsc - s.sc) < 0.001) {
        s.x = s.tx; s.y = s.ty; s.sc = s.tsc;
        apply();
        s.raf = 0;
        s.last = 0;
        return;
      }
      apply();
      s.raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (!s.raf) s.raf = requestAnimationFrame(tick); };
    const enabled = (e) => e.pointerType === 'mouse' && hoverMql.matches && !reduceMql.matches && phaseRef.current === 'closed';

    const onMove = (e) => {
      if (!enabled(e)) return;
      if (!s.box) {
        s.box = { w: trigger.clientWidth, h: trigger.clientHeight, pw: pill.offsetWidth, ph: pill.offsetHeight, left: pill.offsetLeft, top: pill.offsetTop };
      }
      const b = s.box;
      const r = trigger.getBoundingClientRect();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      s.tx = clamp(px - b.pw / 2 - b.left, MARGIN - b.left, b.w - MARGIN - b.pw - b.left);
      s.ty = clamp(py - b.ph / 2 - b.top, MARGIN - b.top, b.h - MARGIN - b.ph - b.top);
      s.tsc = 1.06;
      kick();
    };
    const onLeave = () => {
      s.box = null;
      if (!s.tx && !s.ty && s.tsc === 1) return;
      s.tx = 0; s.ty = 0; s.tsc = 1;
      kick();
    };

    trigger.addEventListener('pointerenter', onMove);
    trigger.addEventListener('pointermove', onMove);
    trigger.addEventListener('pointerleave', onLeave);
    trigger.addEventListener('ddfilmopen', onLeave);
    return () => {
      trigger.removeEventListener('pointerenter', onMove);
      trigger.removeEventListener('pointermove', onMove);
      trigger.removeEventListener('pointerleave', onLeave);
      trigger.removeEventListener('ddfilmopen', onLeave);
      if (s.raf) cancelAnimationFrame(s.raf);
      pill.style.transform = '';
    };
  }, []);

  /* ---------- Portal-Animation ---------- */
  const cancelAnims = () => {
    animsRef.current.forEach((a) => { try { a.cancel(); } catch (e) { /* schon weg */ } });
    animsRef.current = [];
  };

  /* Rechteck des Panels als inset() relativ zum Overlay, inklusive Eckradius */
  const panelClip = () => {
    const trigger = triggerRef.current;
    const overlay = overlayRef.current;
    if (!trigger || !overlay) return FULL_CLIP;
    const r = trigger.getBoundingClientRect();
    const o = overlay.getBoundingClientRect();
    const radius = parseFloat(window.getComputedStyle(trigger).borderTopLeftRadius) || 0;
    const top = clamp(r.top - o.top, 0, o.height);
    const right = clamp(o.right - r.right, 0, o.width);
    const bottom = clamp(o.bottom - r.bottom, 0, o.height);
    const left = clamp(r.left - o.left, 0, o.width);
    return `inset(${top.toFixed(1)}px ${right.toFixed(1)}px ${bottom.toFixed(1)}px ${left.toFixed(1)}px round ${radius}px)`;
  };

  const canAnimate = (el) => !!el && typeof el.animate === 'function';

  /* Ghost: das, was gerade im Panel zu sehen ist, als Canvas deckungsgleich über das Panel legen
     (object-fit: cover mit derselben object-position wie im CSS). Gibt false zurück, wenn es
     nichts zu malen gibt; dann übernimmt ein Fade. */
  const paintGhost = () => {
    const canvas = ghostRef.current;
    const media = mediaRef.current;
    const overlay = overlayRef.current;
    const trigger = triggerRef.current;
    if (!canvas || !media || !overlay || !trigger || typeof canvas.getContext !== 'function') return false;
    const r = media.getBoundingClientRect(); /* inklusive Hover-Skalierung */
    const o = overlay.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.style.left = (r.left - o.left).toFixed(1) + 'px';
    canvas.style.top = (r.top - o.top).toFixed(1) + 'px';
    canvas.style.width = r.width.toFixed(1) + 'px';
    canvas.style.height = r.height.toFixed(1) + 'px';
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    const v = teaserRef.current;
    const img = stillRef.current;
    let source = null;
    let sw = 0;
    let sh = 0;
    if (trigger.classList.contains('is-live') && v && v.readyState >= 2 && v.videoWidth) {
      source = v; sw = v.videoWidth; sh = v.videoHeight;
    } else if (img && img.complete && img.naturalWidth) {
      source = img; sw = img.naturalWidth; sh = img.naturalHeight;
    }
    if (!source) return false;
    /* Gleicher Bildausschnitt wie im Panel: object-position aus dem CSS lesen (Prozentwerte) */
    const pos = (window.getComputedStyle(source).objectPosition || '').split(' ');
    const frac = (val, fallback) => (/%$/.test(val || '') ? parseFloat(val) / 100 : fallback);
    const fx = frac(pos[0], 0.5);
    const fy = frac(pos[1], 0.2);
    try {
      const ctx = canvas.getContext('2d');
      const scale = Math.max(canvas.width / sw, canvas.height / sh);
      const cw = canvas.width / scale;
      const ch = canvas.height / scale;
      ctx.drawImage(source, (sw - cw) * fx, (sh - ch) * fy, cw, ch, 0, 0, canvas.width, canvas.height);
      return true;
    } catch (e) {
      return false;
    }
  };

  const animateOpen = () => {
    cancelAnims();
    const overlay = overlayRef.current;
    const frame = frameRef.current;
    const closeBtn = closeRef.current;
    const ghost = ghostRef.current;
    if (!canAnimate(overlay)) return;
    if (mq('(prefers-reduced-motion: reduce)')) {
      animsRef.current = [overlay.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE_MS, easing: 'linear' })];
      return;
    }
    const hasGhost = paintGhost();
    animsRef.current = [
      overlay.animate([{ clipPath: panelClip() }, { clipPath: FULL_CLIP }], { duration: OPEN_MS, easing: EASE }),
      /* Ghost hält das Panelbild, während das Ink drumherum aufzieht, und löst sich dann in den
         Film auf. Ohne Ghost blendet das Panel kurz in Ink über, statt hart umzuspringen. */
      hasGhost
        ? ghost.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(1.06)' }],
          { duration: 420, delay: 60, easing: EASE, fill: 'both' })
        : overlay.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'linear' }),
      frame.animate([{ opacity: 0, transform: 'scale(0.97)' }, { opacity: 1, transform: 'none' }],
        { duration: OPEN_MS - 130, delay: 130, easing: EASE, fill: 'backwards' }),
      closeBtn.animate([{ opacity: 0, transform: 'scale(0.9)' }, { opacity: 1, transform: 'none' }],
        { duration: 300, delay: 340, easing: EASE, fill: 'backwards' })
    ];
  };

  const finishClose = () => {
    if (phaseRef.current !== 'closing') return;
    if (unlockRef.current) { unlockRef.current(); unlockRef.current = null; }
    phaseRef.current = 'closed';
    flushSync(() => setPhase('closed')); /* erst verstecken, dann Animationen lösen: kein Aufblitzen */
    cancelAnims();
    if (teaserSyncRef.current) teaserSyncRef.current();
  };

  const close = React.useCallback(() => {
    if (phaseRef.current !== 'open') return;
    phaseRef.current = 'closing';
    const v = filmRef.current;
    if (v && !v.paused) v.pause();
    /* Inert SYNCHRON aufheben, bevor der Fokus zurück aufs Panel geht */
    if (undoInertRef.current) { undoInertRef.current(); undoInertRef.current = null; }
    if (triggerRef.current) triggerRef.current.focus({ preventScroll: true });
    setPhase('closing');

    const overlay = overlayRef.current;
    const frame = frameRef.current;
    const closeBtn = closeRef.current;
    const ghost = ghostRef.current;
    if (!canAnimate(overlay)) { finishClose(); return; }

    let anims;
    if (mq('(prefers-reduced-motion: reduce)')) {
      cancelAnims();
      anims = [overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: FADE_MS, easing: 'linear', fill: 'forwards' })];
    } else {
      /* Aus dem aktuellen Zustand heraus zurück, auch wenn das Öffnen noch läuft */
      const oStyle = window.getComputedStyle(overlay);
      const fStyle = window.getComputedStyle(frame);
      const gStyle = window.getComputedStyle(ghost);
      const fromClip = oStyle.clipPath && oStyle.clipPath !== 'none' ? oStyle.clipPath : FULL_CLIP;
      const fromOpacity = oStyle.opacity;
      const fromFrame = { opacity: fStyle.opacity, transform: fStyle.transform === 'none' ? 'none' : fStyle.transform };
      const fromGhost = { opacity: gStyle.opacity, transform: gStyle.transform === 'none' ? 'none' : gStyle.transform };
      cancelAnims();
      const hasGhost = paintGhost();
      anims = [
        overlay.animate([{ clipPath: fromClip }, { clipPath: panelClip() }], { duration: CLOSE_MS, easing: EASE, fill: 'forwards' }),
        frame.animate([fromFrame, { opacity: 0, transform: 'scale(0.97)' }], { duration: 240, easing: EASE, fill: 'forwards' }),
        closeBtn.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 140, easing: 'linear', fill: 'forwards' }),
        /* Zurück ins Panel: das Panelbild taucht im schrumpfenden Portal wieder auf, am Ende ist
           das Overlay deckungsgleich mit dem Panel und verschwindet ohne Sprung. */
        hasGhost
          ? ghost.animate([fromGhost.opacity > 0 ? fromGhost : { opacity: 0, transform: 'scale(1.06)' }, { opacity: 1, transform: 'none' }],
            { duration: 360, delay: CLOSE_MS - 360, easing: EASE, fill: 'both' })
          : overlay.animate([{ opacity: fromOpacity }, { opacity: 0 }], { duration: 180, delay: CLOSE_MS - 180, easing: 'linear', fill: 'both' })
      ];
    }
    animsRef.current = anims;
    Promise.all(anims.map((a) => a.finished)).then(finishClose, () => {});
  }, []);

  const open = () => {
    if (phaseRef.current !== 'closed') return;
    const isPortrait = mq('(orientation: portrait)');
    phaseRef.current = 'open';
    triggerRef.current.dispatchEvent(new Event('ddfilmopen')); /* Pill zurück in Ruheposition */
    flushSync(() => {
      setPortal(true);
      setPortrait(isPortrait);
      setPhase('open');
    });

    /* 1. Film starten, synchron im Klick (iOS gibt den Ton sonst nicht frei) */
    const v = filmRef.current;
    if (v) {
      const src = isPortrait ? portraitSrc : landscapeSrc;
      if (v.getAttribute('src') !== src) v.setAttribute('src', src);
      v.muted = false;
      try { v.currentTime = 0; } catch (e) { /* noch keine Metadaten: startet ohnehin bei 0 */ }
      const p = v.play();
      if (p && typeof p.catch === 'function') {
        p.catch((err) => {
          /* Ton blockiert (Browser-Richtlinie): stumm weiterlaufen, Ton über die Controls */
          if (err && err.name === 'NotAllowedError' && phaseRef.current === 'open') {
            v.muted = true;
            v.play().catch(() => {});
          }
        });
      }
    }

    /* 2. Teaser pausieren, Seite sperren, Hintergrund inert */
    if (teaserSyncRef.current) teaserSyncRef.current();
    unlockRef.current = lockScroll(frameRef.current);
    undoInertRef.current = inertOutside(overlayRef.current);

    /* 3. Portal aufziehen (vor dem nächsten Paint, also ohne Aufblitzen) */
    animateOpen();

    /* 4. Fokus in den Dialog */
    if (closeRef.current) closeRef.current.focus({ preventScroll: true });
  };

  /* Escape schließt */
  React.useEffect(() => {
    if (phase !== 'open') return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [phase, close]);

  /* Gerät gedreht, während der Film läuft: passende Fassung an derselben Stelle weiter */
  React.useEffect(() => {
    if (phase !== 'open' || typeof window.matchMedia !== 'function') return undefined;
    const mql = window.matchMedia('(orientation: portrait)');
    const onChange = () => {
      const v = filmRef.current;
      if (!v || phaseRef.current !== 'open') return;
      const want = mql.matches ? portraitSrc : landscapeSrc;
      setPortrait(mql.matches);
      if (v.getAttribute('src') === want) return;
      const t = v.currentTime;
      const wasPlaying = !v.paused && !v.ended;
      v.setAttribute('src', want);
      v.addEventListener('loadedmetadata', () => {
        try { v.currentTime = t; } catch (e) { /* ignorieren */ }
        if (wasPlaying) v.play().catch(() => {});
      }, { once: true });
    };
    if (mql.addEventListener) mql.addEventListener('change', onChange); else mql.addListener(onChange);
    return () => { if (mql.removeEventListener) mql.removeEventListener('change', onChange); else mql.removeListener(onChange); };
  }, [phase, portraitSrc, landscapeSrc]);

  /* Aufräumen, falls die Komponente bei offenem Film verschwindet */
  React.useEffect(() => () => {
    cancelAnims();
    if (undoInertRef.current) undoInertRef.current();
    if (unlockRef.current) unlockRef.current();
  }, []);

  /* Fokus-Falle: Wächter am Anfang und Ende des Dialogs. Die nativen Video-Controls liegen im
     Shadow DOM und bleiben per Tab erreichbar; der Rest der Seite ist zusätzlich inert. */
  const toFirst = () => { if (closeRef.current) closeRef.current.focus(); };
  const toLast = () => { if (filmRef.current) filmRef.current.focus(); };

  const onStageClick = (e) => {
    if (e.target === e.currentTarget) close();
  };

  const overlay = portal ? createPortal(
    <div ref={overlayRef} className="dd-film-overlay dd-on-dark" role="dialog" aria-modal="true"
      aria-label={'Case-Study-Film ' + client} data-state={phase} data-format={portrait ? 'portrait' : 'landscape'}
      hidden={phase === 'closed'}>
      <span className="dd-film-guard" tabIndex={0} aria-hidden="true" onFocus={toLast} />
      <canvas ref={ghostRef} className="dd-film-ghost" aria-hidden="true" />
      <button ref={closeRef} type="button" className="dd-film-close" aria-label="Film schließen" onClick={close}>
        <CloseIcon />
      </button>
      <div className="dd-film-stage" onClick={onStageClick}>
        <div ref={frameRef} className="dd-film-frame">
          <video ref={filmRef} className="dd-film-video" controls playsInline preload="none"
            poster={portrait ? (film.posterPortrait || film.poster) : film.poster}>
            {film.captions ? <track kind="captions" srcLang="de" label="Deutsch" src={film.captions} /> : null}
          </video>
        </div>
      </div>
      <span className="dd-film-guard" tabIndex={0} aria-hidden="true" onFocus={toFirst} />
    </div>,
    document.body
  ) : null;

  return (
    <div className="dd-film">
      <button ref={triggerRef} type="button" className={'dd-film-trigger' + (live ? ' is-live' : '') + (phase !== 'closed' ? ' is-open' : '')}
        aria-haspopup="dialog" aria-expanded={phase === 'open'} aria-label={buttonName} onClick={open}>
        <span ref={mediaRef} className="dd-film-media" aria-hidden="true">
          <video ref={teaserRef} className="dd-film-teaser" muted playsInline loop preload="none"
            poster={film.teaserPoster} tabIndex={-1} />
          {film.teaserPoster ? (
            <img ref={stillRef} className="dd-film-still" src={film.teaserPoster} alt="" width="540" height="960"
              loading="lazy" decoding="async" />
          ) : null}
        </span>
        <span ref={pillRef} className="dd-film-pill" aria-hidden="true">
          <span className="dd-film-pill-icon"><PlayIcon /></span>
          <span className="dd-film-pill-label">Film ansehen</span>
          {film.duration ? <span className="dd-film-pill-time">{film.duration}</span> : null}
        </span>
      </button>
      {overlay}
    </div>
  );
}
