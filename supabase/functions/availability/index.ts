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
  const url = new URL(request.url);
  const kind = url.searchParams.get('kind') ?? '';
  const program = url.searchParams.get('program') ?? '';
  const month = url.searchParams.get('month') ?? '';
  if (!/^(private|enrollment)$/.test(kind) || !/^(half-day|full-day|two-day|full-academy)$/.test(program) || !/^\d{4}-\d{2}$/.test(month)) {
    return json({ slots: [] });
  }
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/rest/v1/rpc/training_slots`, {
    method: 'POST',
    headers: {
      apikey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ p_kind: kind, p_program: program, p_month: `${month}-01` }),
  });
  if (!response.ok) return json({ message: 'Availability could not be loaded. Please contact Prestige.' }, 503);
  const slots = await response.json();
  return json({ slots: Array.isArray(slots) ? slots : [] });
});
