import React from 'react';
import './Button.css';

/* Pill-Button. Alle Styles liegen statisch in Button.css (keine Laufzeit-Injection mehr).
   `style` bleibt als Override erhalten, weitere Props (aria-*, data-*) werden durchgereicht.
   Größen: sm 40px, nav 44px (Touch-Target für die Navigation), md 48px, lg 56px. */

function ArrowUpRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

export function Button({ variant = 'primary', size = 'md', disabled = false, href, onClick, type, arrow = false, children, style, className, ...rest }) {
  const Tag = href && !disabled ? 'a' : 'button';
  const cls = ['dd-btn', 'dd-btn--' + variant, 'dd-btn--' + size, arrow ? 'dd-btn-arrow' : '', className || '']
    .filter(Boolean).join(' ');

  return (
    <Tag
      {...rest}
      href={Tag === 'a' ? href : undefined}
      onClick={onClick}
      type={Tag === 'button' ? (type || 'button') : undefined}
      disabled={Tag === 'button' ? disabled : undefined}
      className={cls}
      style={style}
    >
      {arrow ? (
        <>
          <span className="dd-btn-arrow-label">{children}</span>
          <span className="dd-btn-arrow-circle" aria-hidden="true"><ArrowUpRight /></span>
        </>
      ) : children}
    </Tag>
  );
}
