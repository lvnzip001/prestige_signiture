-- An admin can remove a booking record. The date becomes available because availability is read from the rows that remain.

create or replace function public.delete_booking(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not allowed';
  end if;
  delete from public.bookings where id = p_id;
  if not found then
    raise exception 'This booking could not be deleted.';
  end if;
end;
$$;

revoke all on function public.delete_booking(uuid) from public, anon;
grant execute on function public.delete_booking(uuid) to authenticated;
