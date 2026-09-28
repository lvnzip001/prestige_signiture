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

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'GET') return json({ message: 'Method not allowed.' }, 405);
  const reference = new URL(request.url).searchParams.get('ref') ?? '';
  if (!/^[a-z0-9]{32}$/.test(reference)) return json({ message: 'Please contact Prestige to check your booking status.' }, 400);
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/booking_status`, {
    method: 'POST',
    headers: {
      apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ p_reference: reference }),
  });
  if (!response.ok) return json({ message: 'Please contact Prestige to check your booking status.' }, 503);
  const status = await response.json();
  if (!['pending', 'confirmed', 'released', 'expired'].includes(status)) {
    return json({ message: 'Please contact Prestige to check your booking status.' }, 404);
  }
  return json({ status });
});
