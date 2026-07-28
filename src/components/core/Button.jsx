import React from 'react';

const base = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
  font: 'var(--text-button)', fontFamily: 'var(--font-head)', textDecoration: 'none',
  borderRadius: 'var(--radius-pill)', border: '1px solid transparent',
  cursor: 'pointer', transition: 'var(--transition-interactive)', whiteSpace: 'nowrap'
};

const sizes = {
  md: { padding: '14px 28px', fontSize: 'var(--fs-body)' },
  sm: { padding: '10px 20px', fontSize: '14px' },
  lg: { padding: '18px 36px', fontSize: 'var(--fs-lead)' }
};

const variants = {
  primary: { background: 'var(--action-primary-bg)', color: 'var(--action-primary-fg)' },
  secondary: { background: 'transparent', color: 'var(--action-secondary-fg)', borderColor: 'var(--dd-ink)', fontWeight: 'var(--fw-medium)' },
  ghostDark: { background: 'transparent', color: 'var(--dd-white)', borderColor: 'var(--dd-border-dark)', fontWeight: 'var(--fw-medium)' }
};

export function Button({ variant = 'primary', size = 'md', disabled = false, href, onClick, type, children, style }) {
  const Tag = href && !disabled ? 'a' : 'button';
  return (
    <Tag
      href={href}
      onClick={onClick}
      type={Tag === 'button' ? type : undefined}
      disabled={Tag === 'button' ? disabled : undefined}
      style={{ ...base, ...sizes[size], ...variants[variant], opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto', ...style }}
    >
      {children}
    </Tag>
  );
}
