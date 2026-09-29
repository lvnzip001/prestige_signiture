import { bookingNoticeText, deskNoticePayload } from '../_shared/desk-notice.mjs';

const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, apikey, content-type',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'content-type': 'application/json' },
  });
}

const safe = /^(Check the details and try again\.|Choose a weekday training date\.|This program is not open on that date yet\.|Registration for this session is closed\.|This session has just filled\. Choose another available session\.)$/;

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'POST') return json({ message: 'Method not allowed.' }, 405);
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return json({ message: 'Check the details and try again.' }, 400);
  }
  if (typeof body.company_website === 'string' && body.company_website.trim()) {
    return json({ message: 'Check the details and try again.' }, 400);
  }
  const consent = body.consent;
  if (!(consent === true || consent === 'on' || consent === 'true')) {
    return json({ message: 'Check the details and try again.' }, 400);
  }
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/create_booking`, {
    method: 'POST',
    headers: {
      apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      p_kind: body.kind ?? '',
      p_program: body.program ?? '',
      p_start: body.date ?? null,
      p_session: body.session ?? '',
      p_payment: body.payment ?? '',
      p_name: body.name ?? '',
      p_email: body.email ?? '',
      p_phone: body.phone ?? '',
      p_company: body.company ?? '',
      p_agreement: body.agreement ?? '',
      p_slot_id: body.slotId ?? '',
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload?.message === 'string' ? payload.message : '';
    const known = message.split('\n').map((line: string) => line.trim()).find((line: string) => safe.test(line)) ?? '';
    const status = /just filled|closed/i.test(known) ? 409 : 400;
    return json({ message: known || 'We couldn’t complete your booking. Please contact Prestige.' }, status);
  }
  if (!payload?.checkoutUrl || !payload?.reference) return json({ message: 'We couldn’t complete your booking. Please contact Prestige.' }, 503);
  await notifyNewBooking(String(payload.reference));
  return json({ checkoutUrl: payload.checkoutUrl, reference: payload.reference, status: 'pending' });
});

async function notifyNewBooking(reference: string) {
  try {
    const base = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const headers = { apikey: key, authorization: `Bearer ${key}` };
    const settingsResponse = await fetch(`${base}/rest/v1/email_settings?id=eq.true&select=notification_to`, { headers });
    const settings = await settingsResponse.json();
    const recipient = settings?.[0]?.notification_to;
    if (!recipient) return;
    const bookingResponse = await fetch(`${base}/rest/v1/bookings?reference=eq.${encodeURIComponent(reference)}&select=created_at,kind,program,session,dates,payment,amount_usd,contact_name,email,phone,company`, { headers });
    const booking = (await bookingResponse.json())?.[0];
    const age = Date.now() - Date.parse(booking?.created_at);
    if (!booking || !Number.isFinite(age) || age > 30000) return;
    const kind = booking.kind === 'enrollment' ? 'enrollment' : 'payment';
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        origin: 'https://prestigesignaturestandard.com',
        referer: 'https://prestigesignaturestandard.com/contact.html',
      },
      body: JSON.stringify(deskNoticePayload(kind, {
        name: booking.contact_name,
        details: bookingNoticeText(booking),
        reference,
      })),
      signal: AbortSignal.timeout(8000),
    });
    await response.json().catch(() => ({}));
  } catch { /* The booking stands even when the inbox notice does not. */ }
}
