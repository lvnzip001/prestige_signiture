import { db } from '../_shared/client.ts';
import { validateInquiry } from '../_shared/email.mjs';
import { DESK_NOTICES } from '../_shared/desk-notice.mjs';
import { deliverFormSubmit, inquiryDetailsText } from '../_shared/formsubmit.mjs';

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, 'content-type': 'application/json', 'cache-control': 'no-store' },
});

const academyOrigins = ['https://prestigesignaturestandard.com', 'https://www.prestigesignaturestandard.com'];

function allowed(origin: string) {
  const configured = (Deno.env.get('PUBLIC_SITE_ORIGINS') || '').split(',').map(item => item.trim()).filter(Boolean);
  if (configured.includes(origin) || academyOrigins.includes(origin)) return 'public';
  try {
    const host = new URL(origin).hostname;
    if (host === 'localhost' || host === '127.0.0.1') return 'local';
  } catch { /* The origin is not a usable URL. */ }
  return '';
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'POST') return json({ message: 'Method not allowed' }, 405);
  const access = allowed(request.headers.get('origin') || '');
  if (!access) return json({ message: 'Origin not allowed' }, 403);
  const raw = await request.text();
  if (raw.length > 16000) return json({ message: 'Request too large' }, 413);
  let body, details;
  try { body = JSON.parse(raw); details = validateInquiry(body); }
  catch (error) { return json({ message: error instanceof Error ? error.message : 'Check the details.' }, 400); }
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY');
  if (secret && access !== 'local') {
    try {
      const origins = [...new Set([...(Deno.env.get('PUBLIC_SITE_ORIGINS') || '').split(',').map(item => item.trim()).filter(Boolean), ...academyOrigins])];
      const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: new URLSearchParams({ secret, response: String(body.turnstileToken || '') }), signal: AbortSignal.timeout(10000) });
      const result = await verification.json();
      if (!result.success || result.action !== 'inquiry' || !origins.some(origin => { try { return new URL(origin).hostname === result.hostname; } catch { return false; } })) return json({ message: 'Please complete the check before sending your inquiry.' }, 400);
    } catch { return json({ message: 'We could not submit your inquiry. Please try again or call Prestige.' }, 503); }
  }
  try {
    const client = db();
    const { error } = await client.rpc('save_website_inquiry', { p_id: body.requestId, p_details: details });
    if (error) return json({ message: error.message.includes('Too many inquiries') ? 'Too many inquiries. Please try later or call Prestige.' : 'We could not save your inquiry. Please try again or call Prestige.' }, error.message.includes('Too many inquiries') ? 429 : 503);
    const stored = await client.from('inquiries').select('created_at').eq('id', body.requestId).maybeSingle();
    const age = Date.now() - Date.parse(stored.data?.created_at);
    let mailed = false;
    let activation = false;
    if (Number.isFinite(age) && age <= 30000) {
      const settings = await client.from('email_settings').select('notification_to').eq('id', true).maybeSingle();
      const recipient = settings.data?.notification_to;
      if (recipient) {
        const delivery = await deliverFormSubmit(recipient, {
          _subject: DESK_NOTICES.inquiry,
          _template: 'table',
          name: details.name,
          inquiry: inquiryDetailsText(details),
          reference: body.requestId,
        }, 12000).catch(() => ({ ok: false, activation: false }));
        mailed = delivery.ok === true;
        activation = delivery.activation === true;
      }
    }
    return json({ accepted: true, mailed, activation, message: 'Thank you. Your inquiry has been received by Prestige.' }, 202);
  } catch { return json({ message: 'We could not submit your inquiry. Please try again or call Prestige.' }, 503); }
});
