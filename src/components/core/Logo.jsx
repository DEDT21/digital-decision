import React from 'react';

/* Production note: the wave marks and wordmarks ship as SVG (crisp at every size, tiny files). */
const SRC = {
  full: { ink: 'logo-wordmark-ink.svg', white: 'logo-wordmark-white.svg' },
  wordmark: { ink: 'logo-wordmark-ink.svg', white: 'logo-wordmark-white.svg' },
  mark: { ink: 'mark-waves-ink.svg', white: 'mark-waves-white.svg', lime: 'mark-waves-lime.svg' }
};

export function Logo({ variant = 'full', tone = 'ink', height = 32, assetBase = '/assets', style }) {
  const file = (SRC[variant] && SRC[variant][tone]) || SRC[variant].ink;
  return (
    <img
      src={assetBase + '/' + file}
      alt="digital decision"
      style={{ height: height + 'px', width: 'auto', display: 'block', ...style }}
    />
  );
}
