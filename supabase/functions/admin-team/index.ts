const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'content-type': 'application/json' },
  });
}

function startingPassword() {
  const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, byte => alphabet[byte % alphabet.length]).join('');
}

function serviceHeaders(service: string) {
  return { apikey: service, authorization: `Bearer ${service}`, 'content-type': 'application/json' };
}

async function caller(supabaseUrl: string, service: string, authorization: string) {
  if (!authorization.toLowerCase().startsWith('bearer ')) return '';
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: service, authorization },
  });
  if (!response.ok) return '';
  const user = await response.json();
  return String(user.email || '').trim().toLowerCase();
}

async function admins(supabaseUrl: string, service: string) {
  const response = await fetch(`${supabaseUrl}/rest/v1/admins?select=email,must_change_password&order=email.asc`, {
    headers: serviceHeaders(service),
  });
  if (!response.ok) return null;
  return await response.json() as { email: string; must_change_password: boolean }[];
}

async function findUser(supabaseUrl: string, service: string, email: string) {
  const response = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=1&per_page=200`, {
    headers: serviceHeaders(service),
  });
  if (!response.ok) return null;
  const body = await response.json();
  const users = Array.isArray(body.users) ? body.users : [];
  return users.find((user: { email?: string }) => String(user.email || '').toLowerCase() === email) ?? null;
}

async function setPassword(supabaseUrl: string, service: string, id: string, password: string) {
  return fetch(`${supabaseUrl}/auth/v1/admin/users/${id}`, {
    method: 'PUT',
    headers: serviceHeaders(service),
    body: JSON.stringify({ password, email_confirm: true }),
  });
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (request.method !== 'POST') return json({ message: 'Method not allowed.' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  const actor = await caller(supabaseUrl, service, request.headers.get('authorization') || '');
  if (!actor) return json({ message: 'Sign in again.' }, 401);

  const roster = await admins(supabaseUrl, service);
  if (!roster) return json({ message: 'The desk could not be reached. Try again in a moment.' }, 503);
  if (!roster.some(admin => admin.email === actor)) return json({ message: 'Not allowed.' }, 403);

  let body: { action?: unknown; email?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ message: 'Check the email and try again.' }, 400);
  }

  const action = String(body.action || '');
  if (action === 'list') {
    return json({
      admins: roster.map(admin => ({ email: admin.email, mustChangePassword: admin.must_change_password })),
    });
  }

  const email = String(body.email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ message: 'Check the email and try again.' }, 400);
  const headers = serviceHeaders(service);

  if (action === 'create') {
    if (roster.some(admin => admin.email === email)) return json({ message: 'That email is already an admin.' }, 409);
    const password = startingPassword();
    let user = await findUser(supabaseUrl, service, email);
    if (user) {
      const updated = await setPassword(supabaseUrl, service, user.id, password);
      if (!updated.ok) return json({ message: 'The account could not be created.' }, 503);
    } else {
      const created = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password, email_confirm: true }),
      });
      if (!created.ok) return json({ message: 'The account could not be created.' }, 503);
      user = await created.json();
    }
    const inserted = await fetch(`${supabaseUrl}/rest/v1/admins`, {
      method: 'POST',
      headers: { ...headers, prefer: 'return=minimal' },
      body: JSON.stringify({ email, must_change_password: true }),
    });
    if (!inserted.ok) return json({ message: 'The account could not be added to the desk.' }, 503);
    return json({ email, password });
  }

  if (action === 'reset') {
    if (email === actor) return json({ message: 'Change your own password under Account.' }, 400);
    if (!roster.some(admin => admin.email === email)) return json({ message: 'That email is not an admin.' }, 404);
    const password = startingPassword();
    let user = await findUser(supabaseUrl, service, email);
    if (user) {
      const updated = await setPassword(supabaseUrl, service, user.id, password);
      if (!updated.ok) return json({ message: 'The password could not be reset.' }, 503);
    } else {
      const created = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password, email_confirm: true }),
      });
      if (!created.ok) return json({ message: 'The password could not be reset.' }, 503);
    }
    const marked = await fetch(`${supabaseUrl}/rest/v1/admins?email=eq.${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: { ...headers, prefer: 'return=minimal' },
      body: JSON.stringify({ must_change_password: true }),
    });
    if (!marked.ok) return json({ message: 'The password could not be reset.' }, 503);
    return json({ email, password });
  }

  if (action === 'delete') {
    if (email === actor) return json({ message: 'Another admin has to remove the account you are signed in with.' }, 400);
    if (!roster.some(admin => admin.email === email)) return json({ message: 'That email is not an admin.' }, 404);
    if (roster.length < 2) return json({ message: 'The desk needs at least one admin.' }, 400);
    const removed = await fetch(`${supabaseUrl}/rest/v1/admins?email=eq.${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: { ...headers, prefer: 'return=minimal' },
    });
    if (!removed.ok) return json({ message: 'The account could not be removed.' }, 503);
    const user = await findUser(supabaseUrl, service, email);
    if (user) {
      await fetch(`${supabaseUrl}/auth/v1/admin/users/${user.id}`, { method: 'DELETE', headers });
    }
    return json({ email });
  }

  return json({ message: 'Check the email and try again.' }, 400);
});
