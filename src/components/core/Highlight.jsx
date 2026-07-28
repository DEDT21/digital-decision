import React from 'react';

export function Highlight({ children, style }) {
  return (
    <span style={{ background: 'var(--highlight-mark)', fontStyle: 'normal', ...style }}>{children}</span>
  );
}
