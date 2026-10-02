/* Event-triggered Netlify Function: fires automatically on every VERIFIED form submission
   (spam that Akismet or the honeypot catches never reaches this function).
   Sends a push notification via ntfy.sh — the topic name acts as the secret, so it lives in
   the NTFY_TOPIC environment variable (Netlify UI → Environment variables), not in the repo.
   Without the variable the function is a silent no-op and the submission is still stored.

   Datenschutz: ntfy.sh ist ein öffentlicher Dienst und steht nicht in der
   Datenschutzerklärung. Die Push enthält deshalb bewusst KEINE Formulardaten (kein Name,
   keine E-Mail, keine Nachricht), nur den Hinweis, dass eine Anfrage eingegangen ist.
   Die Details stehen im Netlify-Dashboard unter Forms → setup-check. */

export async function handler() {
  const topic = process.env.NTFY_TOPIC;
  if (!topic) {
    console.warn('NTFY_TOPIC not set — skipping push notification');
    return { statusCode: 200, body: 'ok (no topic configured)' };
  }

  const res = await fetch(`https://ntfy.sh/${topic}`, {
    method: 'POST',
    headers: {
      /* header values must stay ASCII */
      'Title': 'Neue Setup-Check-Anfrage',
      'Tags': 'tada',
      'Priority': 'high'
    },
    body: 'Details im Netlify-Dashboard unter Forms.'
  });

  if (!res.ok) console.error('ntfy push failed:', res.status, await res.text());
  return { statusCode: 200, body: 'ok' };
}
