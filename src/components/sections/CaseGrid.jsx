import React from 'react';
import { CaseFilm } from './CaseFilm.jsx';
import './CaseGrid.css';

/* Referenzen auf Ink. Der Case mit Kennzahl (stat) wird zur Feature-Karte über die volle Breite.
   Mit Film (film): links das Film-Panel (Teaser im Hochformat, Klick öffnet den Case-Study-Film,
   siehe CaseFilm.jsx), rechts Logo, Branche, die Kennzahl groß in Lime, Ergebnis, Text und Tags.
   Ohne Film: links die Kennzahl, rechts der Rest. Die übrigen Cases stehen darunter zweispaltig.
   Lime ist auf dieser Fläche nur die Kennzahl; die Ergebnis-Headlines sind weiß.
   Layout komplett per CSS-Media-Queries (CaseGrid.css), kein JS-Messen, SSR-sicher. Eingeblendet
   wird über das globale Scroll-Reveal ([data-reveal]). Kein Hover-Effekt auf den Karten: sie
   sind keine Links. Klickbar ist nur das Film-Panel, und das ist ein echter Button. */

/* Intrinsische Logo-Maße (für width/height gegen Layout-Shift) und die optische Darstellhöhe:
   breite Wortmarken wirken bei gleicher Höhe deutlich größer als kompakte Bildmarken.
   Ein Case kann das über `logoSize: { width, height, display }` überschreiben. */
const LOGO_SIZES = {
  '/assets/clients/aqmos.webp': { width: 600, height: 128, display: 24 },
  '/assets/clients/hagi.webp': { width: 99, height: 96, display: 40 },
  '/assets/clients/gamechangersocks.webp': { width: 600, height: 385, display: 34 }
};

function logoProps(c) {
  const size = c.logoSize || LOGO_SIZES[c.logo] || { display: 28 };
  return {
    width: size.width,
    height: size.height,
    style: { '--logo-h': (size.display || 28) + 'px' }
  };
}

/* Typografie, keine Copy-Änderung: Zahl und Einheit nie trennen ("+110 %" nicht über zwei Zeilen) */
function keepUnits(text) {
  return typeof text === 'string' ? text.replace(/(\d) (%|€)/g, '$1\u00A0$2') : text;
}

function slug(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function CaseHead({ c, headingId }) {
  /* DOM-Reihenfolge: Name (h3) zuerst, damit die Überschrift die Karte eröffnet. Visuell steht
     das Logo links, Name und Branche rechts (grid-template-areas). */
  return (
    <header className="dd-case-head">
      <h3 id={headingId} className="dd-case-name">{c.client}</h3>
      {c.logo ? (
        <img className="dd-case-logo" src={c.logo} alt={c.client} loading="lazy" decoding="async" {...logoProps(c)} />
      ) : null}
      {c.industry ? <p className="dd-case-industry">{c.industry}</p> : null}
    </header>
  );
}

/* Kennzahl: optionaler Vorsatz ("bis zu"), Zahl groß in Lime, Beschreibung darunter.
   Als ein <p>, damit Screenreader den Satz am Stück lesen ("bis zu +110 % Monatsumsatz …"). */
function CaseStat({ c, className }) {
  return (
    <p className={className}>
      {c.statPrefix ? <span className="dd-case-statprefix">{c.statPrefix}</span> : null}
      <span className="dd-case-statnum">{keepUnits(c.stat)}</span>
      {c.statLabel ? <span className="dd-case-statlabel">{c.statLabel}</span> : null}
    </p>
  );
}

function CaseContent({ c }) {
  return (
    <>
      {c.result ? <p className="dd-case-result">{keepUnits(c.result)}</p> : null}
      {c.body ? <p className="dd-case-body">{keepUnits(c.body)}</p> : null}
      {c.tags && c.tags.length ? (
        <ul className="dd-case-tags" aria-label="Leistungen">
          {c.tags.map((tag) => <li key={tag} className="dd-case-tag">{tag}</li>)}
        </ul>
      ) : null}
    </>
  );
}

export function CaseGrid({ cases = [], style }) {
  const featureIndex = cases.findIndex((c) => c && c.stat);
  const feature = featureIndex >= 0 ? cases[featureIndex] : null;
  const rest = cases.filter((_, i) => i !== featureIndex);

  return (
    <div className={'dd-cases' + (feature ? '' : ' dd-cases--plain')} style={style}>
      {feature ? (
        /* Mit Film: im DOM erst der Inhalt (Überschrift eröffnet die Karte), dann das Panel.
           Visuell steht das Panel links bzw. oben (Grid-Platzierung in CaseGrid.css). */
        <article className={'dd-case dd-case--feature' + (feature.film ? ' dd-case--film' : '')}
          aria-labelledby={'case-' + slug(feature.client)} data-reveal>
          {feature.film ? null : <CaseStat c={feature} className="dd-case-stat" />}
          <div className="dd-case-main">
            <CaseHead c={feature} headingId={'case-' + slug(feature.client)} />
            {feature.film ? <CaseStat c={feature} className="dd-case-kpi" /> : null}
            <CaseContent c={feature} />
          </div>
          {feature.film ? <CaseFilm film={feature.film} client={feature.client} /> : null}
        </article>
      ) : null}

      {rest.map((c, i) => (
        <article key={c.client} className="dd-case" aria-labelledby={'case-' + slug(c.client)}
          data-reveal data-reveal-delay={(i + (feature ? 1 : 0)) * 80}>
          <CaseHead c={c} headingId={'case-' + slug(c.client)} />
          <CaseContent c={c} />
        </article>
      ))}
    </div>
  );
}
