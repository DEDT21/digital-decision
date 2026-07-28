import React from 'react';

/* The single full-Lime section on the page: the free setup check. Form is intentionally four
   fields — anything more reads as a lead-gen funnel.
   Production wiring: a native POST to Netlify Forms (form name "setup-check"). A hidden static
   mirror of this form lives in index.html so Netlify's build bot registers it; this component
   must keep the same form name and field names. The honeypot field ("bot-field") is visually
   hidden — bots fill it, Netlify drops the submission. On success Netlify redirects to the
   form's action: /danke. */
export function SetupCheck({ id = 'setup-check', kicker = 'Kostenlos · unverbindlich', headline, intro, steps = [], buttonLabel = 'Setup-Check anfragen', reassurance, style }) {
  const inputStyle = { width: '100%', font: 'var(--text-copy)', color: 'var(--dd-ink)', background: 'var(--dd-white)', border: '1px solid rgba(10,10,10,0.18)', borderRadius: 'var(--radius-lg)', padding: '12px 14px', outlineColor: 'var(--dd-ink)', resize: 'vertical' };
  const field = (label, name, opts = {}) => (
    <label key={name} style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
      <span style={{ display: 'block', font: 'var(--text-caption)', textTransform: 'uppercase', letterSpacing: 'var(--ls-tag)', marginBottom: 'var(--space-2)' }}>
        {label}{opts.required ? ' *' : ''}
      </span>
      {opts.area
        ? <textarea rows="3" name={name} style={inputStyle} />
        : <input name={name} type={opts.type || 'text'} required={opts.required} autoComplete={opts.autoComplete} inputMode={opts.inputMode} style={inputStyle} />}
    </label>
  );

  return (
    <section id={id} style={{ background: 'var(--surface-accent)', color: 'var(--dd-ink)', padding: 'var(--pad-section-y) var(--pad-page-x)', ...style }}>
      <div style={{ maxWidth: 'var(--measure-wide)', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--space-16)', alignItems: 'start' }}>
        <div>
          <span style={{ display: 'inline-block', font: 'var(--text-kicker)', fontFamily: 'var(--font-head)', fontWeight: 'var(--fw-medium)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: 'var(--ls-kicker)', background: 'var(--dd-ink)', color: 'var(--dd-lime)', padding: '4px 12px', borderRadius: 'var(--radius-pill)' }}>{kicker}</span>
          <h2 style={{ font: 'var(--text-h2)', letterSpacing: 'var(--ls-heading)', margin: 'var(--space-5) 0 var(--space-5)', maxWidth: 620 }}>{headline}</h2>
          <p style={{ font: 'var(--text-lead)', margin: 0, maxWidth: 560, textWrap: 'pretty' }}>{intro}</p>
          <ol style={{ listStyle: 'none', margin: 'var(--space-10) 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            {steps.map((step, i) => (
              <li key={step.title} style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 'var(--space-4)', alignItems: 'start' }}>
                <span style={{ width: 40, height: 40, borderRadius: 'var(--radius-pill)', background: 'var(--dd-ink)', color: 'var(--dd-lime)', display: 'grid', placeItems: 'center', font: 'var(--text-copy)', fontFamily: 'var(--font-head)', fontWeight: 'var(--fw-bold)' }}>{i + 1}</span>
                <span>
                  <span style={{ display: 'block', font: 'var(--text-copy)', fontFamily: 'var(--font-head)', fontWeight: 'var(--fw-bold)', fontSize: '18px', letterSpacing: 'var(--ls-heading)' }}>{step.title}</span>
                  <span style={{ display: 'block', font: 'var(--text-copy)', fontSize: '15px', marginTop: 'var(--space-1)' }}>{step.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div style={{ background: 'var(--dd-ink)', color: 'var(--text-on-dark)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)' }}>
          <form name="setup-check" method="POST" action="/danke" data-netlify="true" data-netlify-honeypot="bot-field">
            <input type="hidden" name="form-name" value="setup-check" />
            {/* honeypot: invisible to humans, irresistible to bots */}
            <p style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
              <label>Bitte dieses Feld nicht ausfüllen: <input name="bot-field" tabIndex={-1} autoComplete="off" /></label>
            </p>
            {field('Name', 'name', { required: true, autoComplete: 'name' })}
            {field('E-Mail', 'email', { required: true, type: 'email', autoComplete: 'email' })}
            {field('Shop-URL', 'shop', { inputMode: 'url', autoComplete: 'url' })}
            {field('Was nervt dich gerade am meisten?', 'message', { area: true })}
            <button type="submit" style={{ width: '100%', font: 'var(--text-button)', fontFamily: 'var(--font-head)', background: 'var(--dd-lime)', color: 'var(--dd-ink)', border: 'none', borderRadius: 'var(--radius-pill)', padding: '14px 28px', cursor: 'pointer', transition: 'var(--transition-interactive)' }}>{buttonLabel}</button>
            {reassurance ? <p style={{ font: 'var(--text-caption)', color: 'var(--text-on-dark-secondary)', margin: 'var(--space-4) 0 0', textAlign: 'center' }}>{reassurance}</p> : null}
          </form>
        </div>
      </div>
    </section>
  );
}
