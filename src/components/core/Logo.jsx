import React from 'react';

/* Wellen-Marke und Wortmarke als SVG (scharf in jeder Größe, winzige Dateien).
   width/height-Attribute aus der viewBox: Der Browser kennt das Seitenverhältnis vor dem
   Laden, die Navigation verschiebt sich im ersten Frame nicht. */
const SRC = {
  full: { ink: 'dd-wordmark-ink.svg', white: 'dd-wordmark-white.svg', lime: 'dd-wordmark-lime.svg' },
  wordmark: { ink: 'dd-wordmark-ink.svg', white: 'dd-wordmark-white.svg', lime: 'dd-wordmark-lime.svg' },
  mark: { ink: 'dd-mark-ink.svg', white: 'dd-mark-white.svg', lime: 'dd-mark-lime.svg' }
};
const RATIO = { full: 695 / 290, wordmark: 695 / 290, mark: 254 / 265 };

export function Logo({ variant = 'full', tone = 'ink', height = 32, assetBase = '/assets', alt = 'digital decision', style }) {
  const set = SRC[variant] || SRC.full;
  const file = set[tone] || set.ink;
  return (
    <img
      src={assetBase + '/' + file}
      alt={alt}
      width={Math.round(height * (RATIO[variant] || RATIO.full))}
      height={height}
      decoding="async"
      style={{ height: height + 'px', width: 'auto', display: 'block', ...style }}
    />
  );
}
