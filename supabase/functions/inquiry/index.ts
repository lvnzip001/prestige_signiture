import { db, json } from '../_shared/client.ts';
import { validateInquiry } from '../_shared/email.mjs';
Deno.serve(async request => {
  if (request.method !== 'POST') return json({ message: 'Method not allowed' }, 405);
  const origins = (Deno.env.get('PUBLIC_SITE_ORIGINS') || '').split(',').map(x => x.trim());
  if (!origins.includes(request.headers.get('origin') || '') || !request.headers.get('origin')) return json({ message: 'Origin not allowed' }, 403);
  const raw = await request.text();
  if (raw.length > 16000) return json({ message: 'Request too large' }, 413);
  let body, details;
  try { body = JSON.parse(raw); details = validateInquiry(body); }
  catch (error) { return json({ message: error instanceof Error ? error.message : 'Check the details.' }, 400); }
  // Turnstile is required for automated submissions; an origin header alone is not spam protection.
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY');
  if (!secret) return json({ message: 'Online inquiries are unavailable. Please use the email draft or call Prestige.' }, 503);
  try {
    const verification = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: new URLSearchParams({ secret, response: String(body.turnstileToken || '') }), signal: AbortSignal.timeout(10000) });
    const result = await verification.json();
    if (!result.success || result.action !== 'inquiry' || !origins.some(origin => { try { return new URL(origin).hostname === result.hostname; } catch { return false; } })) return json({ message: 'Please complete the spam check and try again.' }, 400);
    const { error } = await db().rpc('accept_inquiry', { p_id: body.requestId, p_details: details });
    if (error) return json({ message: error.message.includes('Too many inquiries') ? 'Too many inquiries. Please try later or call Prestige.' : 'We could not save your inquiry. Please try again or call Prestige.' }, error.message.includes('Too many inquiries') ? 429 : 503);
    return json({ accepted: true, message: 'Thank you. Your inquiry has been received by Prestige.' }, 202);
  } catch { return json({ message: 'We could not submit your inquiry. Please try again or use the email draft.' }, 503); }
});
