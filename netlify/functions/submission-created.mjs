/* Event-triggered Netlify Function: fires automatically on every VERIFIED form submission
   (spam that Akismet or the honeypot catches never reaches this function).
   Sends a push notification via ntfy.sh — the topic name acts as the secret, so it lives in
   the NTFY_TOPIC environment variable (Netlify UI → Environment variables), not in the repo.
   Without the variable the function is a silent no-op and the submission is still stored. */

export async function handler(event) {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) {
    console.warn('NTFY_TOPIC not set — skipping push notification');
    return { statusCode: 200, body: 'ok (no topic configured)' };
  }

  const { payload } = JSON.parse(event.body);
  const d = payload.data || {};
  const lines = [
    d.name ? `Name: ${d.name}` : null,
    d.email ? `E-Mail: ${d.email}` : null,
    d.shop ? `Shop: ${d.shop}` : null,
    d.message ? `Nachricht: ${d.message}` : null
  ].filter(Boolean);

  const res = await fetch(`https://ntfy.sh/${topic}`, {
    method: 'POST',
    headers: {
      /* header values must stay ASCII — the body carries the UTF-8 details */
      'Title': 'Neuer Setup-Check auf digital-decision.at',
      'Tags': 'tada',
      'Priority': 'high'
    },
    body: lines.join('\n') || 'Neue Anfrage (ohne Felder?)'
  });

  if (!res.ok) console.error('ntfy push failed:', res.status, await res.text());
  return { statusCode: 200, body: 'ok' };
}
