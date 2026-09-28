-- A starting password stays in force until that admin replaces it.

alter table public.admins
  add column if not exists must_change_password boolean not null default true;

update public.admins set must_change_password = true;

create or replace function public.clear_password_reminder()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not allowed';
  end if;
  update public.admins
    set must_change_password = false
    where email = lower(coalesce(auth.jwt() ->> 'email', ''));
end;
$$;

revoke all on function public.clear_password_reminder() from public, anon;
grant execute on function public.clear_password_reminder() to authenticated;
