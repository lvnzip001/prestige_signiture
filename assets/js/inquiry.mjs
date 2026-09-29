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
  const recipient = BOOKING_CONFIG.formSubmitRecipient;
  if (!recipient) throw new Error('Inquiry email is not available.');
  const reference = crypto.randomUUID();
  const payload = { ...values, requestId: reference, consent: values.consent || 'yes' };
  delete payload.company_website;
  const host = location.hostname;
  const endpoint = BOOKING_CONFIG.inquiryEndpoint || (host === '127.0.0.1' || host === 'localhost' ? 'https://nrehqharpjphuwvijket.supabase.co/functions/v1/inquiry' : '');
  const store = endpoint ? fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(30000),
  }).then(async response => {
    const record = await response.json().catch(() => ({}));
    if (!response.ok || record.accepted !== true) throw new Error(record.message || 'The academy desk could not store this inquiry.');
    return true;
  }) : Promise.resolve(false);
  const mail = fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({
      _subject: 'Prestige Academy — New discovery inquiry',
      _template: 'table',
      name: String(values.name || '').trim(),
      inquiry: inquiryText(values),
      reference,
    }),
    signal: AbortSignal.timeout(30000),
  }).then(async response => {
    const data = await response.json().catch(() => ({}));
    if (data.success === true || data.success === 'true') return true;
    if (/needs activation/i.test(String(data.message || ''))) throw new Error('The inquiry inbox still needs to be activated. Open the activation email from FormSubmit, then send this inquiry again.');
    throw new Error('Your inquiry could not be sent.');
  });
  const [stored, sent] = await Promise.allSettled([store, mail]);
  const saved = stored.status === 'fulfilled' && stored.value === true;
  if (sent.status === 'fulfilled') return { sent: true, saved };
  const reason = sent.reason?.name === 'TimeoutError' ? 'The email notice took too long.' : (sent.reason?.message || 'Your inquiry could not be sent.');
  throw new Error(saved ? `${reason} Your inquiry is saved on the academy desk.` : reason);
}
