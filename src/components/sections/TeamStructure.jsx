import React from 'react';
import './TeamStructure.css';

/* "Kern & Netz": the company's actual structure in one component, not a team slideshow.
   The people who decide, each a real card with a first-person line and what you'd call them
   for (expandable), and next to them the network as a deliberately different object: an Ink
   card with the partner logos and the four disciplines. No faces there, because they aren't
   employees; that honesty is the point.
   Layout is pure CSS (TeamStructure.css), so the first render is the same on server and client. */

const useIsoLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;
const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';

/* Collapse with max-height (WebKit-safe, see TeamStructure.css). Closed the panel carries the
   `hidden` attribute, so nothing inside is focusable or in the accessibility tree. Opening
   removes `hidden` and animates from the current height; closing animates to 0, makes the panel
   inert right away and sets `hidden` once the transition is done. After opening, max-height is
   released so later reflow (resize, larger font) never clips the content.
   Same mechanism as in FaqChat.jsx. */
function useCollapse(open) {
  const ref = React.useRef(null);
  const mounted = React.useRef(false);
  const [prevOpen, setPrevOpen] = React.useState(open);
  const [closing, setClosing] = React.useState(false);
  if (open !== prevOpen) { setPrevOpen(open); setClosing(!open); }

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    el.inert = !open;
    if (!mounted.current) {
      mounted.current = true;
      if (!open) { el.style.maxHeight = '0px'; el.style.opacity = '0'; }
      return undefined;
    }
    if (window.matchMedia && window.matchMedia(REDUCE_QUERY).matches) {
      el.style.maxHeight = open ? '' : '0px';
      el.style.opacity = open ? '' : '0';
      if (!open) setClosing(false);
      return undefined;
    }

    let timer = 0;
    const finish = () => {
      window.clearTimeout(timer);
      el.removeEventListener('transitionend', onEnd);
      if (open) { el.style.maxHeight = ''; el.style.opacity = ''; } else setClosing(false);
    };
    function onEnd(e) { if (e.target === el && e.propertyName === 'max-height') finish(); }

    const fromH = el.getBoundingClientRect().height;
    el.style.maxHeight = fromH + 'px';
    el.style.opacity = getComputedStyle(el).opacity;
    void el.offsetHeight; /* force a style flush so the transition has a start value */
    el.style.maxHeight = open ? el.scrollHeight + 'px' : '0px';
    el.style.opacity = open ? '1' : '0';
    el.addEventListener('transitionend', onEnd);
    timer = window.setTimeout(finish, 800);
    return () => { window.clearTimeout(timer); el.removeEventListener('transitionend', onEnd); };
  }, [open]);

  return { ref, hidden: !open && !closing };
}

function PlusMinus() {
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true" focusable="false">
      <path d="M0 5h10" stroke="currentColor" strokeWidth="1.5" />
      <path className="dd-icon-v" d="M5 0v10" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/* /assets/team/name.webp → responsive set name-400.webp / name-800.webp (both 4:5) */
function photoSources(photo) {
  if (!photo || !/\.webp$/.test(photo)) return { src: photo };
  const base = photo.replace(/\.webp$/, '');
  return { src: base + '-800.webp', srcSet: base + '-400.webp 400w, ' + base + '-800.webp 800w' };
}

function PersonCard({ person, open, onToggle, assetBase, index = 0 }) {
  const uid = React.useId();
  const panelId = uid + '-panel';
  const panel = useCollapse(open);
  const img = photoSources(person.photo);
  const first = person.name.split(' ')[0];

  return (
    <article className="dd-person" data-open={open ? '1' : '0'} data-reveal data-reveal-delay={index * 80}>
      <div className="dd-person-media">
        {person.photo ? (
          <img src={img.src} srcSet={img.srcSet}
               sizes="(max-width: 720px) 104px, (max-width: 1023px) 50vw, 360px"
               width="800" height="1000" alt={person.name} loading="lazy" decoding="async" />
        ) : (
          <img className="dd-person-mark" src={assetBase + '/dd-mark-white.svg'} alt="" loading="lazy" decoding="async" />
        )}
        {person.tag ? <span className="dd-person-tag">{person.tag}</span> : null}
      </div>

      <div className="dd-person-body">
        <h3 className="dd-person-name"><span>{person.name}</span></h3>
        <p className="dd-person-role">{person.role}</p>
        {person.line ? <p className="dd-person-line">„{person.line}“</p> : null}
        {person.bio ? <p className="dd-person-bio">{person.bio}</p> : null}

        <div ref={panel.ref} id={panelId} className="dd-person-panel" hidden={panel.hidden}>
          <div className="dd-person-panel-inner">
            {person.callFor && person.callFor.length ? (
              <>
                <p className="dd-person-callfor-title">Dafür rufst du mich an</p>
                <ul className="dd-person-callfor">
                  {person.callFor.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </>
            ) : null}
            {person.mail ? <p className="dd-person-mail"><a href={'mailto:' + person.mail}>{person.mail}</a></p> : null}
          </div>
        </div>

        <button type="button" className="dd-person-toggle" onClick={onToggle} aria-expanded={open} aria-controls={panelId}>
          {open ? 'Weniger' : 'Mehr über ' + first}
          <span className="dd-person-toggle-icon" aria-hidden="true"><PlusMinus /></span>
        </button>
      </div>
    </article>
  );
}

function NetworkCard({ hubLabel, note, nodes, faces, assetBase, index }) {
  const shown = faces.slice(0, 8);
  const rest = faces.length - shown.length;
  return (
    <article className="dd-network dd-on-dark" data-reveal data-reveal-delay={index * 80}>
      <div className="dd-network-head">
        <img className="dd-network-mark" src={assetBase + '/dd-mark-lime.svg'} alt="" width="44" height="46" loading="lazy" decoding="async" />
        <h3 className="dd-network-hub">{hubLabel}</h3>
      </div>

      <div className="dd-network-body">
        {shown.length ? (
          <ul className="dd-network-faces" aria-label="Partner aus dem Netzwerk">
            {shown.map((face) => (
              <li key={face.name} className="dd-network-face" title={face.name}>
                {face.logo
                  ? <img className="is-logo" src={face.logo} alt={face.name} loading="lazy" decoding="async" />
                  : face.photo
                    ? <img className="is-photo" src={face.photo} alt={face.name} loading="lazy" decoding="async" />
                    : <span className="is-initial" role="img" aria-label={face.name}>{face.name.trim().charAt(0).toUpperCase()}</span>}
              </li>
            ))}
            {rest > 0 ? <li className="dd-network-face"><span className="is-initial">+{rest}</span></li> : null}
          </ul>
        ) : null}
        {note ? <p className="dd-network-note">{note}</p> : null}
      </div>

      {nodes.length ? (
        <ul className="dd-network-list">
          {nodes.map((node) => (
            <li key={node.name} className="dd-network-item">
              <span className="dd-network-item-name">{node.name}</span>
              {node.what ? <span className="dd-network-item-what">{node.what}</span> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

export function TeamStructure({ people = [], network = [], networkFaces = [], hubLabel = 'Netzwerk aus Spezialisten', networkNote, assetBase = '/assets', style }) {
  const [open, setOpen] = React.useState(-1);

  return (
    <div className="dd-team-grid" data-people={people.length} style={style}>
      {people.map((p, i) => (
        /* Funktionales setState: Auf Touch feuern touchend und der nachgelagerte Click
           gelegentlich beide im selben React-Batch. Mit `open` aus der Render-Closure liest
           der zweite Aufruf den alten Wert, auf/zu/auf, die Karte bliebe offen. */
        <PersonCard key={p.name} person={p} open={open === i} onToggle={() => setOpen((prev) => (prev === i ? -1 : i))} assetBase={assetBase} index={i} />
      ))}
      {network.length || networkFaces.length
        ? <NetworkCard hubLabel={hubLabel} note={networkNote} nodes={network} faces={networkFaces} assetBase={assetBase} index={people.length} />
        : null}
    </div>
  );
}
