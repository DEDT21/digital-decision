/* Server-Entry fürs Prerendering beim Build (siehe scripts/prerender.mjs).
   Wird mit `vite build --ssr src/entry-server.jsx --outDir dist-ssr` gebaut und von Node
   ausgeführt, nie im Browser. Muss denselben Baum rendern wie src/main.jsx, sonst gibt es
   Hydration-Mismatches. CSS-Imports der Komponenten ignoriert der SSR-Build. */
import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './App.jsx';

/* Für den Abgleich mit dem FAQPage-JSON-LD in index.html (prerender.mjs prüft beides). */
export { FAQS } from './Home.jsx';

export function render() {
  return renderToString(<App />);
}
