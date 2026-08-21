import React from 'react';

/* "Kern & Netz" — the company's actual structure in one component, not a team slideshow.
   Top: the people who decide (3–4), each a real card with a first-person line, what they are
   working on right now, and what you'd call them for — expandable, personal, specific.
   Bottom: the network, deliberately a DIFFERENT object: one Ink hub fanning out via thin
   connectors into named specialists. No faces there, because they aren't employees — that
   honesty is the point. Hover/tap a node to light its connector and read what it covers. */

function PersonCard({ person, open, onToggle, assetBase }) {
  return (
    /* Kartenlayout liegt in mobile.css (.dd-person*): mobil wird aus der hohen Portrait-Card
       eine kompakte Querformat-Card (Bild links, Text rechts), die Bio klappt erst mit auf. */
    <div className="dd-person" data-open={open ? '1' : '0'}>
      <div className="dd-person-media">
        {person.photo ? (
          <img src={person.photo} alt={person.name} loading="lazy" decoding="async"
               style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: open ? 'none' : 'grayscale(1) contrast(1.05)', transform: open ? 'scale(1.03)' : 'scale(1)', transition: 'filter var(--dur-slow) var(--ease-out), transform var(--dur-slow) var(--ease-out)' }} />
        ) : (
          <img src={assetBase + '/dd-mark-white.svg'} alt="" loading="lazy" decoding="async" style={{ width: '34%', opacity: open ? 0.5 : 0.3, transition: 'opacity var(--dur-base) var(--ease-standard)' }} />
        )}
        {person.tag ? (
          <span style={{ position: 'absolute', left: 'var(--space-4)', bottom: 'var(--space-4)', font: 'var(--text-kicker)', fontFamily: 'var(--font-head)', fontWeight: 'var(--fw-medium)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: 'var(--ls-kicker)', color: 'var(--dd-lime)' }}>{person.tag}</span>
        ) : null}
      </div>

      <div className="dd-person-body">
        <div className="dd-person-name" style={{ letterSpacing: 'var(--ls-heading)' }}>
          <span style={{ background: open ? 'var(--highlight-mark)' : 'none', transition: 'background var(--dur-base) var(--ease-standard)' }}>{person.name}</span>
        </div>
        <div style={{ font: 'var(--text-copy)', fontSize: '14px', color: 'var(--text-secondary)' }}>{person.role}</div>
        {person.line ? <p style={{ font: 'var(--text-copy)', margin: 'var(--space-2) 0 0', textWrap: 'pretty' }}>„{person.line}“</p> : null}
        {person.bio ? <p className="dd-person-bio" style={{ font: 'var(--text-copy)', fontSize: '14px', color: 'var(--text-secondary)', margin: 'var(--space-3) 0 0', textWrap: 'pretty' }}>{person.bio}</p> : null}


        <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', opacity: open ? 1 : 0, transition: 'grid-template-rows var(--dur-slow) var(--ease-out), opacity var(--dur-base) var(--ease-standard)' }}>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ paddingTop: 'var(--space-4)' }}>
              {person.callFor && person.callFor.length ? (
                <>
                  <div style={{ font: 'var(--text-caption)', textTransform: 'uppercase', letterSpacing: 'var(--ls-tag)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>Dafür rufst du mich an</div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                    {person.callFor.map((c) => (
                      <li key={c} style={{ font: 'var(--text-copy)', fontSize: '14px', display: 'flex', gap: 'var(--space-2)' }}><span aria-hidden="true" style={{ color: 'var(--dd-ink)' }}>·</span>{c}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              {person.mail ? <div style={{ marginTop: 'var(--space-4)', font: 'var(--text-copy)', fontSize: '14px' }}><a href={'mailto:' + person.mail} style={{ color: 'var(--text-link)' }}>{person.mail}</a></div> : null}
            </div>
          </div>
        </div>

        <button onClick={onToggle} aria-expanded={open} className="dd-person-toggle"
                style={{ marginTop: 'auto', alignSelf: 'flex-start', background: 'none', border: 'none', cursor: 'pointer', font: 'var(--text-copy)', fontFamily: 'var(--font-head)', fontWeight: 'var(--fw-medium)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: 'var(--ls-kicker)', color: 'var(--dd-ink)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {open ? 'Weniger' : 'Mehr über ' + person.name.split(' ')[0]}
          <span aria-hidden="true" style={{ display: 'inline-grid', placeItems: 'center', width: 24, height: 24, borderRadius: 'var(--radius-pill)', border: 'var(--border-default)', transition: 'var(--transition-interactive)' }}>{open ? '–' : '+'}</span>
        </button>
      </div>
    </div>
  );
}

function NetworkFan({ hubLabel, note, nodes, faces, assetBase, stacked }) {
  const [hot, setHot] = React.useState(0);
  const count = Math.max(nodes.length, 1);
  const shown = faces.slice(0, 8);
  const rest = faces.length - shown.length;
  /* Fixed geometry: the panel and the description box never resize when the selected node
     changes — a box that grows and shrinks on hover creates exactly the restlessness the
     brand avoids. */
  const panelHeight = Math.max(count * 48 + 64, note ? 500 : 380);
  return (
    <div className="dd-network" style={{ background: 'var(--surface-dark)', color: 'var(--text-on-dark)', borderRadius: 'var(--radius-xl)', display: 'grid', gridTemplateColumns: stacked ? '1fr' : 'minmax(240px, 320px) minmax(56px, 96px) 1fr', gap: 'var(--space-6)', alignItems: stacked ? 'start' : 'center', height: stacked ? 'auto' : panelHeight + 'px', boxSizing: 'border-box' }}>
      <div>
        <img src={assetBase + '/dd-mark-lime.svg'} alt="" loading="lazy" decoding="async" style={{ width: 44, display: 'block', marginBottom: 'var(--space-4)' }} />
        <div className="dd-network-hub" style={{ letterSpacing: 'var(--ls-heading)' }}>{hubLabel}</div>

        {shown.length ? (
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', marginTop: 'var(--space-4)', paddingLeft: 10 }}>
            {/* round avatars as a fanned stack: each circle tucks 10px under its left neighbour,
                the Ink border keeps every logo readable — left-most sits on top */}
            {shown.map((face, fi) => (
              <span key={face.name} title={face.name}
                    style={{ width: 44, height: 44, borderRadius: 'var(--radius-round)', overflow: 'hidden', background: face.dark ? 'var(--dd-lime)' : 'var(--dd-white)', border: '2px solid var(--surface-dark)', display: 'grid', placeItems: 'center', flex: '0 0 auto', boxSizing: 'border-box', marginLeft: -10, position: 'relative', zIndex: shown.length - fi }}>
                {face.logo
                  ? <img src={face.logo} alt={face.name} loading="lazy" decoding="async"
                      style={{ width: '66%', height: '66%', objectFit: 'contain', display: 'block', filter: 'grayscale(1) brightness(0)' }} />
                  : face.photo
                    ? <img src={face.photo} alt={face.name} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'grayscale(1)' }} />
                    : <span style={{ font: 'var(--text-caption)', fontFamily: 'var(--font-head)', fontWeight: 'var(--fw-bold)', fontSize: '12px', color: 'var(--dd-muted)' }}>{face.name.trim().charAt(0).toUpperCase()}</span>}
              </span>
            ))}
            {rest > 0 ? (
              <span style={{ width: 44, height: 44, borderRadius: 'var(--radius-round)', border: '2px solid var(--surface-dark)', background: 'var(--dd-lime)', boxSizing: 'border-box', color: 'var(--dd-ink)', display: 'grid', placeItems: 'center', font: 'var(--text-caption)', fontFamily: 'var(--font-head)', fontWeight: 'var(--fw-bold)', fontSize: '12px', flex: '0 0 auto', marginLeft: -10, position: 'relative' }}>+{rest}</span>
            ) : null}
          </div>
        ) : null}

        {note ? <p style={{ font: 'var(--text-copy)', fontSize: '14px', color: 'var(--text-on-dark-secondary)', margin: 'var(--space-4) 0 0', textWrap: 'pretty' }}>{note}</p> : null}
        <p style={{ font: 'var(--text-copy)', fontSize: '14px', color: 'var(--dd-lime)', margin: 'var(--space-3) 0 0', height: stacked ? 'auto' : 76, overflow: 'hidden', textWrap: 'pretty' }}>{nodes[hot] ? nodes[hot].what : ''}</p>
      </div>

      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: 40 * count, display: stacked ? 'none' : 'block' }} aria-hidden="true">
        {nodes.map((node, i) => {
          const y = ((i + 0.5) / count) * 100;
          const on = i === hot;
          return (
            <path key={node.name} d={'M0 50 C 55 50, 45 ' + y + ', 100 ' + y}
                  fill="none" stroke={on ? 'var(--dd-lime)' : 'var(--dd-border-dark)'} strokeWidth={on ? 2 : 1}
                  vectorEffect="non-scaling-stroke" style={{ transition: 'stroke var(--dur-base) var(--ease-standard)' }} />
          );
        })}
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {nodes.map((node, i) => {
          const on = i === hot;
          return (
            <button key={node.name} onMouseEnter={() => setHot(i)} onFocus={() => setHot(i)} onClick={() => setHot(i)}
                    className="dd-network-node"
                    style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', textAlign: 'left', cursor: 'pointer', background: on ? 'var(--dd-lime)' : 'transparent', color: on ? 'var(--dd-ink)' : 'var(--text-on-dark)', border: on ? '1px solid var(--dd-lime)' : 'var(--border-on-dark)', borderRadius: 'var(--radius-pill)', padding: '0 var(--space-5)', font: 'var(--text-copy)', fontFamily: 'var(--font-head)', fontWeight: 'var(--fw-medium)', fontSize: '15px', transition: 'var(--transition-interactive)' }}>
              {node.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function TeamStructure({ people = [], network = [], networkFaces = [], hubLabel = 'Netzwerk aus Spezialisten', networkNote, assetBase = '/assets', style }) {
  const [open, setOpen] = React.useState(-1);
  const [stacked, setStacked] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setStacked(el.clientWidth < 720));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={ref} className="dd-team-stack" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)', ...style }}>
      <div className="dd-team-grid" style={{ display: 'grid', gridTemplateColumns: stacked ? '1fr' : 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--gap-grid)' }}>
        {people.map((p, i) => (
          <PersonCard key={p.name} person={p} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} assetBase={assetBase} />
        ))}
      </div>
      {network.length ? <NetworkFan hubLabel={hubLabel} note={networkNote} nodes={network} faces={networkFaces} assetBase={assetBase} stacked={stacked} /> : null}
    </div>
  );
}
