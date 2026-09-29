-- Store a website inquiry for the academy desk without queueing a second email.
-- The contact page already sends the FormSubmit notice.

create or replace function public.save_website_inquiry(p_id uuid, p_details jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  visitor text := lower(p_details->>'email');
begin
  perform pg_advisory_xact_lock(hashtextextended(visitor, 1));
  if exists(select 1 from public.inquiries where id = p_id) then
    return;
  end if;
  if (select count(*) from public.inquiries where email = visitor and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'Too many inquiries. Please try later or call Prestige.';
  end if;
  insert into public.inquiries(id, email, details, created_at)
  values (p_id, visitor, p_details, now());
end;
$$;

revoke all on function public.save_website_inquiry(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.save_website_inquiry(uuid, jsonb) to service_role;

create or replace function public.delete_inquiry(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not allowed';
  end if;
  delete from public.inquiries where id = p_id;
  if not found then
    raise exception 'This inquiry could not be deleted.';
  end if;
end;
$$;

revoke all on function public.delete_inquiry(uuid) from public, anon;
grant execute on function public.delete_inquiry(uuid) to authenticated;
