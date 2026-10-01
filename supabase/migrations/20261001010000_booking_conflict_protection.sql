-- Use the same date/session locks for requests, manual confirmations and closures.
-- Stripe payment confirmation remains a manual academy-desk action.
create or replace function public.lock_training_slots(p_dates date[], p_session text)
returns void language plpgsql set search_path = public as $$
declare lock_day date; part text;
begin
  for lock_day, part in
    select days.day, parts.session from unnest(p_dates) days(day)
    cross join unnest(case when p_session = 'DAY' then array['AM','PM'] else array[p_session] end) parts(session)
    order by 1, 2
  loop
    perform pg_advisory_xact_lock(hashtextextended(lock_day::text || ':' || part, 0));
  end loop;
end $$;
revoke all on function public.lock_training_slots(date[],text) from public, anon, authenticated;

-- Check for a retry only after acquiring the slot locks. Two simultaneous
-- enrollment retries must reuse one request rather than consume two seats.
do $$
declare src text := pg_get_functiondef('public.create_booking(text,text,date,text,text,text,text,text,text,text,text)'::regprocedure);
begin
  if position('perform public.lock_training_slots(block, p_session);' in src) = 0 then
    if position('select b.reference, b.stripe_link into existing' in src) = 0 then
      raise exception 'Unexpected create_booking definition; review before applying';
    end if;
    src := replace(src, 'select b.reference, b.stripe_link into existing',
      E'perform public.lock_training_slots(block, p_session);\n\n  select b.reference, b.stripe_link into existing');
    execute src;
  end if;
end $$;

create or replace function public.confirm_booking(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare booking public.bookings%rowtype; assessment record;
begin
  if not public.is_admin() then raise exception 'Not allowed'; end if;
  perform public.expire_holds();
  select * into booking from public.bookings where id = p_id;
  if booking.id is null then raise exception 'This booking cannot be confirmed.'; end if;
  perform public.lock_training_slots(booking.dates, booking.session);
  -- Re-read after waiting, including any release or deletion by another admin.
  select * into booking from public.bookings where id = p_id for update;
  if booking.id is null or booking.status not in ('pending','expired') then
    raise exception 'This booking cannot be confirmed.';
  end if;
  select a.status, a.remaining into assessment
    from public.assess_slot(booking.kind, booking.program, booking.dates, booking.session, booking.id) a;
  if assessment.status is distinct from 'available' or assessment.remaining < 1 then
    raise exception 'This session is no longer available. Release the conflicting booking before confirming this one.';
  end if;
  update public.bookings set status='confirmed', hold_until=null where id=p_id;
end $$;

create or replace function public.close_date(p_date date, p_session text, p_note text)
returns uuid language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  if not public.is_admin() then raise exception 'Not allowed'; end if;
  if p_session is null or p_session not in ('AM','PM','DAY') or p_date is null then
    raise exception 'Choose a date and session.';
  end if;
  perform public.lock_training_slots(array[p_date],p_session);
  insert into public.closures(closed_on,session,note) values(p_date,p_session,nullif(trim(p_note),''))
    on conflict(closed_on,session) do update set note=excluded.note returning id into new_id;
  return new_id;
end $$;

create or replace function public.booking_status(p_reference text)
returns text language sql stable security definer set search_path = public as $$
  select case when status='pending' and hold_until <= now() then 'expired' else status end
    from public.bookings where reference=p_reference;
$$;

-- Temporary holds consume capacity; only a confirmed registration establishes a cohort.
create or replace function public.assess_slot(
  p_kind text,
  p_program text,
  p_dates date[],
  p_session text,
  p_ignore uuid default null
)
returns table(status text, remaining integer, cohort boolean)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  occupied_count integer := 0;
  blocked boolean := false;
  has_confirmed boolean := false;
begin
  if exists (
    select 1
    from unnest(p_dates) as dates(day)
    cross join unnest(case when p_session = 'DAY' then array['AM', 'PM'] else array[p_session] end) as parts(part)
    join public.closures c on c.closed_on = dates.day
    where c.session = 'DAY' or c.session = parts.part
  ) then
    return query select 'closed'::text, 0, false;
    return;
  end if;

  with requested as (
    select dates.day::date as day, parts.part
    from unnest(p_dates) as dates(day)
    cross join unnest(case when p_session = 'DAY' then array['AM', 'PM'] else array[p_session] end) as parts(part)
  ),
  active as (
    select b.id, b.status, b.kind, b.program, b.session, b.dates, booking_days.day::date as day, booking_parts.part
    from public.bookings b
    cross join unnest(b.dates) as booking_days(day)
    cross join unnest(case when b.session = 'DAY' then array['AM', 'PM'] else array[b.session] end) as booking_parts(part)
    where (b.status = 'confirmed' or (b.status = 'pending' and b.hold_until > now()))
      and (p_ignore is null or b.id <> p_ignore)
  )
  select
    count(distinct active.id) filter (
      where active.kind = 'enrollment'
        and active.program = p_program
        and active.session = p_session
        and active.dates = p_dates
    ),
    bool_or(
      active.kind = 'private'
      or active.program is distinct from p_program
      or active.session is distinct from p_session
      or active.dates is distinct from p_dates
    ),
    bool_or(active.status = 'confirmed')
  into occupied_count, blocked, has_confirmed
  from active
  join requested on requested.day = active.day and requested.part = active.part;

  occupied_count := coalesce(occupied_count, 0);
  blocked := coalesce(blocked, false);

  if blocked or p_kind = 'private' and occupied_count > 0 then
    return query select 'full'::text, 0, coalesce(has_confirmed, false);
    return;
  end if;

  if p_kind = 'private' then
    return query select 'available'::text, 1, false;
    return;
  end if;

  if occupied_count >= 25 then
    return query select 'full'::text, 0, coalesce(has_confirmed, false);
    return;
  end if;

  return query select 'available'::text, 25 - occupied_count, coalesce(has_confirmed, false);
end;
$$;
