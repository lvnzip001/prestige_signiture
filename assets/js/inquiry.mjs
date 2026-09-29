import { BOOKING_CONFIG } from './booking-config.mjs';
const labels = { name: 'Name', company: 'Organization', title: 'Title', email: 'Email', phone: 'Phone', industry: 'Industry', employee_count: 'People to train', city_state: 'City / State', training_interest: 'Training interest', desired_timing: 'Desired timing', service_challenge: 'Service challenge' };
export function inquiryText(values) {
  return Object.entries(labels).map(([key, label]) => `${label}: ${String(values[key] ?? '').trim()}`).filter(line => !line.endsWith(': ')).join('\n');
}
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
  if (intro) intro.textContent = 'Tell us about your team. Prestige will follow up about your training.';
  return async values => {
    if (!token) throw new Error('Please complete the check before sending your inquiry.');
    try {
      const response = await fetch(BOOKING_CONFIG.inquiryEndpoint, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...values, requestId, turnstileToken: token }), signal: AbortSignal.timeout(20000) });
      const data = await response.json();
      if (!response.ok || data.accepted !== true) throw new Error(data.message || 'Your inquiry could not be submitted. Please try again.');
      requestId = crypto.randomUUID();
      return data.message;
    } finally { token = ''; window.turnstile.reset(widget); }
  };
}

export async function sendInquiry(values) {
  const reference = crypto.randomUUID();
  const payload = { ...values, requestId: reference, consent: values.consent || 'yes' };
  delete payload.company_website;
  const endpoint = BOOKING_CONFIG.inquiryEndpoint || 'https://nrehqharpjphuwvijket.supabase.co/functions/v1/inquiry';
  let record = {};
  let response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30000),
    });
    record = await response.json().catch(() => ({}));
  } catch (error) {
    const reason = error?.name === 'TimeoutError' ? 'The email notice took too long.' : 'Your inquiry could not be sent.';
    throw new Error(reason);
  }
  if (!response.ok || record.accepted !== true) throw new Error(record.message || 'Your inquiry could not be sent.');
  if (record.mailed === true) return { sent: true, saved: true };
  const reason = record.activation ? 'The inquiry inbox still needs to be activated. Open the activation email from FormSubmit, then send this inquiry again.' : 'Your inquiry could not be sent.';
  throw new Error(`${reason} Your inquiry is saved on the academy desk.`);
}
