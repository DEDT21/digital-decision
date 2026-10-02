import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './styles/index.css';
import { App } from './App.jsx';

/* Scroll-Reveal übernehmen (siehe styles/reveal.css).
   Die Klasse dd-reveal setzt ein Inline-Script im <head> von index.html, und zwar vor dem
   ersten Paint, weil der Inhalt vorgerendert ist. Dazu läuft dort ein CSS-Sicherheitsnetz,
   das nach 3 s alles einblendet, falls dieses Modul nie ankommt.
   Hier entscheidet sich, wer übernimmt:
   - rechtzeitig geladen: dd-reveal-live schaltet das Sicherheitsnetz ab, ab jetzt blendet
     der IntersectionObserver in App.jsx beim Reinscrollen ein;
   - zu spät geladen (Netz hat schon gegriffen oder greift gleich): dd-reveal entfernen,
     dann bleibt einfach alles sichtbar und es gibt kein Flackern.
   Ohne JS oder bei prefers-reduced-motion ist dd-reveal nie gesetzt. */
const REVEAL_FAILSAFE_MS = 3000; /* muss zum animation-delay in index.html passen */
const html = document.documentElement;
if (html.classList.contains('dd-reveal')) {
  if (performance.now() < REVEAL_FAILSAFE_MS - 250) html.classList.add('dd-reveal-live');
  else html.classList.remove('dd-reveal');
}

/* Im Build ist #root vorgerendert (scripts/prerender.mjs), dann wird das Markup nur
   hydriert. Im Dev-Server ist #root leer, dann normal rendern. */
const container = document.getElementById('root');
if (container.firstElementChild) {
  hydrateRoot(container, <App />, {
    onRecoverableError(error) {
      /* Hydration-Mismatch: React rendert den Teil clientseitig neu. Laut melden, damit es
         beim Testen auffällt, aber die Seite funktioniert weiter. */
      console.error('[hydration]', error);
    }
  });
} else {
  createRoot(container).render(<App />);
}
