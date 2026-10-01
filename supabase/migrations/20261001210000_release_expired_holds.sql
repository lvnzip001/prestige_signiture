-- A finished hold opens the date and moves the record to Released.
create or replace function public.expire_holds()
returns void
language sql
security definer
set search_path = public
as $$
  update public.bookings
  set status = 'released', hold_until = null
  where status in ('pending', 'expired')
    and hold_until is not null
    and hold_until <= now();
$$;

create or replace function public.release_expired_holds()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not allowed';
  end if;
  perform public.expire_holds();
end;
$$;

revoke all on function public.release_expired_holds() from public, anon;
grant execute on function public.release_expired_holds() to authenticated;

select public.expire_holds();
