import React from 'react';
import './HeroOffer.css';

/* Setup-Check-Karte im Hero. Inhalt kommt komplett aus HERO_OFFER (Home.jsx), die Fotos als
   `faces` (Pfade). Der Titel ist bewusst ein <p>, kein Heading: Die Karte ist ein Angebots-
   Baustein im Hero, keine eigene Gliederungsebene zwischen H1 und den Sektions-H2. */

/* Avatar-Paar, überlappend. Quadratische Gesichts-Crops in Graustufen (160×160).
   Dekorativ (alt=""), die Namen stehen als Text daneben. */
export function HeroFaces({ faces = [], className }) {
  return (
    <span className={'dd-faces' + (className ? ' ' + className : '')}>
      {faces.map((src) => (
        <span key={src} className="dd-face">
          <img src={src} alt="" width={40} height={40} decoding="async" />
        </span>
      ))}
    </span>
  );
}

function CheckIcon() {
  return (
    <svg className="dd-offer-check" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="10" />
      <path d="M6 10.4l2.6 2.6L14.2 7.4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function HeroOffer({ offer, faces = [], onNavigate, className }) {
  if (!offer) return null;
  const toForm = (e) => {
    if (!onNavigate) return;
    e.preventDefault();
    onNavigate('home', 'setup-check');
  };
  return (
    <div className={'dd-offer' + (className ? ' ' + className : '')}>
      <div className="dd-offer-people">
        <HeroFaces faces={faces} />
        <span className="dd-offer-people-text">
          <span className="dd-offer-people-name">{offer.people}</span>
          <span className="dd-offer-people-role">{offer.peopleRole}</span>
        </span>
      </div>

      <p className="dd-offer-title">{offer.title}</p>
      {offer.meta && offer.meta.length ? (
        <ul className="dd-offer-meta" role="list">
          {offer.meta.map((m) => <li key={m}>{m}</li>)}
        </ul>
      ) : null}

      {offer.outcomes && offer.outcomes.length ? (
        <>
          <p className="dd-offer-label">{offer.outcomesLabel}</p>
          <ul className="dd-offer-list" role="list">
            {offer.outcomes.map((o) => (
              <li key={o}><CheckIcon /><span>{o}</span></li>
            ))}
          </ul>
        </>
      ) : null}

      <div className="dd-offer-foot">
        {offer.reply ? <p className="dd-offer-reply">{offer.reply}</p> : null}
        <a className="dd-offer-link" href="#setup-check" onClick={toForm}>
          {offer.link}
          <ArrowRight />
        </a>
      </div>
    </div>
  );
}
