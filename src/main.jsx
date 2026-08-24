import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import { App } from './App.jsx';

/* Schaltet die Startwerte des Scroll-Reveals scharf (siehe styles/reveal.css). Bewusst hier
   und vor dem Render: läuft kein JS, bleibt die Klasse weg und alle Inhalte sind sichtbar.
   Bei prefers-reduced-motion wird sie ebenfalls nicht gesetzt — dann ist sofort alles da. */
const prefersReducedMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) document.documentElement.classList.add('dd-reveal');

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
