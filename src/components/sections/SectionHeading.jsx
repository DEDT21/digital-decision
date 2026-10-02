import React from 'react';
import { Kicker } from '../core/Kicker.jsx';
import './SectionHeading.css';

export function SectionHeading({ kicker, title, lead, tone = 'light', kickerTone, align = 'left', style }) {
  const dark = tone === 'dark';
  const cls = 'dd-section-heading' + (dark ? ' dd-section-heading--dark' : '') + (align === 'center' ? ' dd-section-heading--center' : '');
  return (
    <header data-reveal className={cls} style={style}>
      {kicker ? <div className="dd-section-heading-kicker"><Kicker tone={kickerTone || (dark ? 'limeText' : 'mark')}>{kicker}</Kicker></div> : null}
      <h2 className="dd-section-heading-title">{title}</h2>
      {lead ? <p className="dd-section-heading-lead">{lead}</p> : null}
    </header>
  );
}
