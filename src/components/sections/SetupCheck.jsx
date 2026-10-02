import React from 'react';
import { Button } from '../core/Button.jsx';
import './SetupCheck.css';

/* The single full-Lime section on the page: the free setup check. Form is intentionally four
   fields; anything more reads as a lead-gen funnel.
   Production wiring: a native POST to Netlify Forms (form name "setup-check"). The form is
   registered through the hidden static mirror in index.html (the page is prerendered, so the
   React form carries no data-netlify attributes). Form name and field names must stay identical
   in both places and in netlify/functions/submission-created.mjs: name, email, shop, message,
   honeypot bot-field. On success Netlify redirects to the action: /danke/.

   Validation: without JS the browser's own constraint validation runs (required, type=email).
   Once hydrated, the form switches to noValidate and shows its own German message per field
   after the first submit attempt (aria-invalid + aria-describedby), then re-checks while typing.
   A valid submit stays a native POST; the button only switches to its sending state. */

const FIELDS = [
  { name: 'name', label: 'Name', required: true, autoComplete: 'name' },
  { name: 'email', label: 'E-Mail', required: true, type: 'email', autoComplete: 'email' },
  /* type text, so "meinshop.at" without https:// is accepted; inputMode brings the URL keyboard */
  { name: 'shop', label: 'Shop-URL', autoComplete: 'url', inputMode: 'url' },
  { name: 'message', label: 'Was nervt dich gerade am meisten?', area: true }
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(form) {
  const errors = {};
  const value = (n) => {
    const el = form.elements.namedItem(n);
    return el && typeof el.value === 'string' ? el.value.trim() : '';
  };
  if (!value('name')) errors.name = 'Bitte gib deinen Namen ein.';
  const email = value('email');
  if (!email) errors.email = 'Bitte gib deine E-Mail-Adresse ein.';
  else if (!EMAIL_RE.test(email)) errors.email = 'Bitte gib eine vollständige E-Mail-Adresse ein, zum Beispiel name@deinshop.at.';
  return errors;
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="8" fill="var(--dd-lime)" />
      <path d="M8 4.2v4.6" stroke="var(--dd-ink)" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="8" cy="11.4" r="1.05" fill="var(--dd-ink)" />
    </svg>
  );
}

/* The two people who answer: dedicated square face crops (160x160) */
const DEFAULT_AVATARS = ['/assets/team/david-edtmayer-avatar.webp', '/assets/team/thomas-jud-avatar.webp'];

export function SetupCheck({ id = 'setup-check', kicker = 'Kostenlos · unverbindlich', headline, intro, steps = [], buttonLabel = 'Setup-Check anfragen', reassurance, avatars = DEFAULT_AVATARS, style }) {
  const uid = React.useId();
  const [enhanced, setEnhanced] = React.useState(false);
  const [attempted, setAttempted] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [sending, setSending] = React.useState(false);

  React.useEffect(() => {
    setEnhanced(true);
    /* Back from /danke/ via the back/forward cache: the page comes back exactly as it was left,
       including the disabled sending button. Reset it. */
    const onShow = (e) => { if (e.persisted) setSending(false); };
    window.addEventListener('pageshow', onShow);
    return () => window.removeEventListener('pageshow', onShow);
  }, []);

  const onSubmit = (e) => {
    const form = e.currentTarget;
    const found = validate(form);
    setAttempted(true);
    setErrors(found);
    const first = FIELDS.find((f) => found[f.name]);
    if (first) {
      e.preventDefault();
      const el = form.elements.namedItem(first.name);
      if (el && el.focus) el.focus();
      return;
    }
    /* valid: let the native POST run, just show that it is on its way */
    setSending(true);
  };

  const onInput = (e) => {
    if (attempted) setErrors(validate(e.currentTarget));
  };

  const field = (f) => {
    const fieldId = uid + '-' + f.name;
    const errId = fieldId + '-error';
    const err = errors[f.name];
    const shared = {
      id: fieldId,
      name: f.name,
      className: 'dd-setup-input',
      required: f.required || undefined,
      'aria-invalid': err ? 'true' : undefined,
      'aria-describedby': err ? errId : undefined
    };
    return (
      <div key={f.name} className="dd-setup-field">
        <label className="dd-setup-label" htmlFor={fieldId}>
          {f.label}{f.required ? <span className="dd-setup-req" aria-hidden="true">*</span> : null}
        </label>
        {f.area
          ? <textarea rows="3" {...shared} />
          : <input type={f.type || 'text'} autoComplete={f.autoComplete} inputMode={f.inputMode} {...shared} />}
        {err ? <p id={errId} className="dd-setup-error"><AlertIcon />{err}</p> : null}
      </div>
    );
  };

  return (
    <section id={id} className="dd-setup" style={style}>
      <div className="dd-setup-grid">
        <div className="dd-setup-intro" data-reveal>
          <span className="dd-setup-kicker">{kicker}</span>
          <h2 className="dd-setup-headline">{headline}</h2>
          <p className="dd-setup-lead">{intro}</p>
        </div>

        <ol className="dd-setup-steps" data-reveal data-reveal-delay={120}>
          {steps.map((step, i) => (
            <li key={step.title} className="dd-setup-step">
              <span className="dd-setup-step-num" aria-hidden="true">{i + 1}</span>
              <span>
                <span className="dd-setup-step-title">{step.title}</span>
                <span className="dd-setup-step-body">{step.body}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="dd-setup-formwrap dd-setup-form dd-on-dark" data-reveal data-reveal-delay={80}>
          <form name="setup-check" method="POST" action="/danke/" noValidate={enhanced}
            onSubmit={onSubmit} onInput={onInput} aria-busy={sending || undefined}>
            <input type="hidden" name="form-name" value="setup-check" />
            {/* honeypot: invisible to humans, irresistible to bots */}
            <p className="dd-setup-hp" aria-hidden="true">
              <label>Bitte dieses Feld nicht ausfüllen: <input name="bot-field" tabIndex={-1} autoComplete="off" /></label>
            </p>
            {FIELDS.map(field)}
            <div className="dd-setup-submit">
              <Button type="submit" arrow disabled={sending}
                style={{ width: '100%', background: 'var(--dd-lime)', color: 'var(--dd-ink)', ...(sending ? { opacity: 0.8 } : null) }}>
                {sending ? 'Wird gesendet …' : buttonLabel}
              </Button>
            </div>
            {reassurance ? (
              <div className="dd-setup-reassure">
                {avatars && avatars.length ? (
                  <span className="dd-setup-avatars" aria-hidden="true">
                    {avatars.map((src) => (
                      <span key={src} className="dd-setup-avatar"><img src={src} alt="" width="36" height="36" loading="lazy" decoding="async" /></span>
                    ))}
                  </span>
                ) : null}
                <p>{reassurance}</p>
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </section>
  );
}
