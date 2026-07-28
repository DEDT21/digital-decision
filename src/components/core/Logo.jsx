import React from 'react';

/* Production note: the wave marks and wordmarks ship as SVG (crisp at every size, tiny files). */
const SRC = {
  full: { ink: 'dd-wordmark-ink.svg', white: 'dd-wordmark-white.svg', lime: 'dd-wordmark-lime.svg' },
  wordmark: { ink: 'dd-wordmark-ink.svg', white: 'dd-wordmark-white.svg', lime: 'dd-wordmark-lime.svg' },
  mark: { ink: 'dd-mark-ink.svg', white: 'dd-mark-white.svg', lime: 'dd-mark-lime.svg' }
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
