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
  return json({ checkoutUrl: payload.checkoutUrl, reference: payload.reference, status: 'pending' });
});
