import { bookingNoticeText, deskNoticePayload } from '../_shared/desk-notice.mjs';
import { deliverFormSubmit } from '../_shared/formsubmit.mjs';

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'content-type': 'application/json' } });
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'POST') return json({ message: 'Method not allowed.' }, 405);
  const base = Deno.env.get('SUPABASE_URL') ?? '';
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const authorization = request.headers.get('authorization') || '';
  if (!authorization.toLowerCase().startsWith('bearer ')) return json({ message: 'Not allowed.' }, 401);
  const userResponse = await fetch(`${base}/auth/v1/user`, { headers: { apikey: key, authorization } });
  if (!userResponse.ok) return json({ message: 'Not allowed.' }, 401);
  const user = await userResponse.json();
  const email = String(user.email || '').trim().toLowerCase();
  const adminResponse = await fetch(`${base}/rest/v1/admins?email=eq.${encodeURIComponent(email)}&select=email`, {
    headers: { apikey: key, authorization: `Bearer ${key}` },
  });
  const admins = await adminResponse.json().catch(() => []);
  if (!adminResponse.ok || !admins?.[0]) return json({ message: 'Not allowed.' }, 403);
  const body = await request.json().catch(() => ({}));
  if (!/^[0-9a-f-]{36}$/i.test(String(body.id || ''))) return json({ message: 'That booking could not be found.' }, 400);
  const headers = { apikey: key, authorization: `Bearer ${key}` };
  const settings = await (await fetch(`${base}/rest/v1/email_settings?id=eq.true&select=notification_to`, { headers })).json();
  const recipient = settings?.[0]?.notification_to;
  const booking = (await (await fetch(`${base}/rest/v1/bookings?id=eq.${encodeURIComponent(body.id)}&select=reference,kind,program,session,dates,payment,amount_usd,contact_name,email,phone,company,status`, { headers })).json())?.[0];
  if (!recipient || !booking || booking.status !== 'confirmed') return json({ mailed: false, message: 'The inbox notice could not be sent.' }, 200);
  const delivery = await deliverFormSubmit(recipient, deskNoticePayload('confirmed', {
    name: booking.contact_name,
    details: bookingNoticeText(booking, true),
    reference: booking.reference,
  }), 12000).catch(() => ({ ok: false, activation: false }));
  return json({ mailed: delivery.ok === true, activation: delivery.activation === true });
});
