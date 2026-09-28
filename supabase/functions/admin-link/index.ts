const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  return new Response(JSON.stringify({ message: 'Sign in on the booking desk with the academy password.' }), {
    status: request.method === 'POST' ? 200 : 405,
    headers: { ...cors, 'content-type': 'application/json' },
  });
});
