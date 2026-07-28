import React from 'react';
import { Logo } from './components/core/Logo.jsx';
import { Button } from './components/core/Button.jsx';

export function Nav({ onNavigate }) {
  const links = [['leistungen', 'Leistungen'], ['phasen', 'Phasen'], ['referenzen', 'Referenzen'], ['team', 'Team'], ['faq', 'FAQ']];
  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-8)', padding: '20px var(--pad-page-x)', maxWidth: 'var(--measure-wide)', margin: '0 auto' }}>
      <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('home', 'hero'); }} style={{ display: 'block' }} aria-label="digital decision — Startseite">
        <Logo variant="mark" tone="lime" height={44} assetBase="/assets" />
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {links.map(([id, label]) => (
          <a key={id} href={'#' + id} onClick={(e) => { e.preventDefault(); onNavigate('home', id); }}
             style={{ font: 'var(--text-copy)', fontSize: 14, color: 'var(--text-on-dark-secondary)', textDecoration: 'none' }}>{label}</a>
        ))}
        <Button size="sm" arrow onClick={() => onNavigate('home', 'setup-check')}>Setup-Check</Button>
      </div>
    </nav>
  );
}
