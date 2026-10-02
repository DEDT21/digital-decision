import React from 'react';
import './Kicker.css';

/* Tones: mark (Lime-Marker, hell) · pill · limeText (auf Ink) · inkPill · plain ·
   underline (weiß mit Lime-Strich unter der Grundlinie, auf Ink). Styles in Kicker.css. */
export function Kicker({ tone = 'mark', children, style, className }) {
  return <span className={'dd-kicker dd-kicker--' + tone + (className ? ' ' + className : '')} style={style}>{children}</span>;
}
