import { BOOKING_CONFIG } from './booking-config.mjs';
let turnstileReady;
export async function prepareInquiry(form) {
  if (!BOOKING_CONFIG.inquiryEndpoint || !BOOKING_CONFIG.turnstileSiteKey) return null;
  const container = document.createElement('div');
  form.querySelector('.actions').before(container);
  turnstileReady ||= new Promise((resolve, reject) => {
    if (window.turnstile) return resolve();
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.onload = resolve; script.onerror = reject; document.head.append(script);
  });
  try { await turnstileReady; } catch { return null; }
  let token = '', requestId = crypto.randomUUID();
  const widget = window.turnstile.render(container, { sitekey: BOOKING_CONFIG.turnstileSiteKey, action: 'inquiry', callback: value => { token = value; }, 'expired-callback': () => { token = ''; }, 'error-callback': () => { token = ''; } });
  form.querySelector('[type="submit"]').textContent = 'Submit My Inquiry';
  const intro = form.previousElementSibling?.querySelector('p');
  if (intro) intro.textContent = 'Tell us about your team. Submit your inquiry to the Prestige academy desk.';
  return async values => {
    if (!token) throw new Error('Please complete the spam check before submitting.');
    try {
      const response = await fetch(BOOKING_CONFIG.inquiryEndpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...values, requestId, turnstileToken: token }), signal: AbortSignal.timeout(20000) });
      const data = await response.json();
      if (!response.ok || data.accepted !== true) throw new Error(data.message || 'Your inquiry could not be submitted. Please try again.');
      requestId = crypto.randomUUID();
      return data.message;
    } finally { token = ''; window.turnstile.reset(widget); }
  };
}
