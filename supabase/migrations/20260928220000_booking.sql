-- Pending training bookings. The public site cannot read or write these tables.
-- Prestige confirms a booking only after payment is seen in Stripe.

create table public.admins (
  email text primary key check (email = lower(email) and email ~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'),
  created_at timestamptz not null default now()
);

insert into public.admins (email) values ('nwimbley@prestigesignaturestandard.com');

create table public.closures (
  id uuid primary key default gen_random_uuid(),
  closed_on date not null,
  session text not null check (session in ('AM', 'PM', 'DAY')),
  note text,
  created_at timestamptz not null default now(),
  unique (closed_on, session)
);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique check (reference ~ '^[a-z0-9]{32}$'),
  kind text not null check (kind in ('private', 'enrollment')),
  program text not null check (program in ('half-day', 'full-day', 'two-day', 'full-academy')),
  session text not null check (session in ('AM', 'PM', 'DAY')),
  dates date[] not null check (cardinality(dates) between 1 and 5),
  payment text not null check (payment in ('deposit', 'full', 'enrollment')),
  amount_usd integer not null check (amount_usd > 0),
  contact_name text not null,
  email text not null,
  phone text not null,
  company text,
  agreement text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'released', 'expired')),
  hold_until timestamptz,
  stripe_link text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_dates on public.bookings using gin (dates);
create index bookings_status_hold on public.bookings (status, hold_until);
create index bookings_email on public.bookings (email);

alter table public.admins enable row level security;
alter table public.closures enable row level security;
alter table public.bookings enable row level security;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger bookings_touch
  before update on public.bookings
  for each row execute function public.touch_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

create or replace function public.training_dates(start_on date, day_count integer)
returns date[]
language plpgsql
immutable
set search_path = public
as $$
declare
  result date[] := '{}';
  cursor_day date := start_on;
begin
  if start_on is null or day_count not in (1, 2, 5) then
    return null;
  end if;
  if extract(isodow from start_on) not between 1 and 5 then
    return null;
  end if;
  while cardinality(result) < day_count loop
    if extract(isodow from cursor_day) between 1 and 5 then
      result := result || cursor_day;
    end if;
    cursor_day := cursor_day + 1;
    if cursor_day > start_on + 21 then
      return null;
    end if;
  end loop;
  return result;
end;
$$;

create or replace function public.expire_holds()
returns void
language sql
security definer
set search_path = public
as $$
  update public.bookings
  set status = 'expired'
  where status = 'pending' and hold_until <= now();
$$;

create or replace function public.payment_target(p_program text, p_payment text)
returns table(amount_usd integer, stripe_link text)
language sql
immutable
set search_path = public
as $$
  select amount, link from (values
    ('half-day', 'deposit', 1875, 'https://buy.stripe.com/7sY3CvcUCEYqaPG1tX2VG00'),
    ('half-day', 'full', 3750, 'https://buy.stripe.com/4gMaEX7Ai2bEbTK0pT2VG01'),
    ('half-day', 'enrollment', 300, 'https://buy.stripe.com/5kQ6oH8EmcQi0b2c8B2VG08'),
    ('full-day', 'deposit', 3000, 'https://buy.stripe.com/eVqeVdaMu2bE1f6dcF2VG02'),
    ('full-day', 'full', 6000, 'https://buy.stripe.com/cNiaEX2fY5nQ8HygoR2VG03'),
    ('full-day', 'enrollment', 500, 'https://buy.stripe.com/cNi8wP5sa03wf5W60h2VG09'),
    ('two-day', 'deposit', 5000, 'https://buy.stripe.com/8x214n4o63fIf5WgoR2VG04'),
    ('two-day', 'full', 10000, 'https://buy.stripe.com/3cI14ng60g2u0b26Oh2VG05'),
    ('two-day', 'enrollment', 900, 'https://buy.stripe.com/eVq6oHcUC03we1Sc8B2VG0a'),
    ('full-academy', 'deposit', 17500, 'https://buy.stripe.com/8x2f7hb0v3fI0b2fkN2VG06'),
    ('full-academy', 'full', 35000, 'https://buy.stripe.com/dRmaEX9Iq2bEf5WdcF2VG07'),
    ('full-academy', 'enrollment', 3200, 'https://buy.stripe.com/00waEX1bU9E60b27S12VG0b')
  ) as catalogue(program, payment, amount, link)
  where catalogue.program = p_program and catalogue.payment = p_payment;
$$;

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
    select b.id, b.kind, b.program, b.session, b.dates, booking_days.day::date as day, booking_parts.part
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
    )
  into occupied_count, blocked
  from active
  join requested on requested.day = active.day and requested.part = active.part;

  occupied_count := coalesce(occupied_count, 0);
  blocked := coalesce(blocked, false);

  if blocked or p_kind = 'private' and occupied_count > 0 then
    return query select 'full'::text, 0, occupied_count > 0;
    return;
  end if;

  if p_kind = 'private' then
    return query select 'available'::text, 1, false;
    return;
  end if;

  if occupied_count >= 25 then
    return query select 'full'::text, 0, true;
    return;
  end if;

  return query select 'available'::text, 25 - occupied_count, occupied_count > 0;
end;
$$;

create or replace function public.training_slots(p_kind text, p_program text, p_month date)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  day_count integer;
  sessions text[];
  month_start date;
  month_end date;
  cursor_day date;
  block date[];
  sess text;
  assessment record;
  starts_at timestamptz;
  slots jsonb := '[]'::jsonb;
begin
  perform public.expire_holds();
  if p_kind not in ('private', 'enrollment') or p_program not in ('half-day', 'full-day', 'two-day', 'full-academy') then
    return '[]'::jsonb;
  end if;
  day_count := case p_program when 'two-day' then 2 when 'full-academy' then 5 else 1 end;
  sessions := case when p_program = 'half-day' then array['AM', 'PM'] else array['DAY'] end;
  month_start := date_trunc('month', p_month)::date;
  month_end := (month_start + interval '1 month' - interval '1 day')::date;
  cursor_day := month_start;
  while cursor_day <= month_end loop
    block := public.training_dates(cursor_day, day_count);
    if block is not null and cursor_day >= date '2026-11-02' then
      foreach sess in array sessions loop
        starts_at := (cursor_day::timestamp + case when sess = 'PM' then time '13:00' else time '09:00' end) at time zone 'America/Chicago';
        if starts_at > now() + interval '48 hours' then
          select a.status, a.remaining, a.cohort into assessment
          from public.assess_slot(p_kind, p_program, block, sess, null) as a;
          slots := slots || jsonb_build_array(jsonb_build_object(
            'id', p_kind || ':' || p_program || ':' || cursor_day::text || ':' || sess,
            'date', cursor_day,
            'dates', to_jsonb(block),
            'session', sess,
            'timeLabel', case sess
              when 'AM' then '9:00–12:00 Central'
              when 'PM' then '1:00–4:00 Central'
              else 'Training days · Central time'
            end,
            'remaining', assessment.remaining,
            'status', assessment.status,
            'cohort', assessment.cohort
          ));
        end if;
      end loop;
    end if;
    cursor_day := cursor_day + 1;
  end loop;
  return slots;
end;
$$;

create or replace function public.create_booking(
  p_kind text,
  p_program text,
  p_start date,
  p_session text,
  p_payment text,
  p_name text,
  p_email text,
  p_phone text,
  p_company text,
  p_agreement text,
  p_slot_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  day_count integer;
  block date[];
  target record;
  assessment record;
  existing record;
  starts_at timestamptz;
  new_reference text;
  part text;
  lock_day date;
begin
  perform public.expire_holds();
  if p_kind not in ('private', 'enrollment')
    or p_program not in ('half-day', 'full-day', 'two-day', 'full-academy')
    or p_session not in ('AM', 'PM', 'DAY')
    or (p_kind = 'enrollment' and p_payment is distinct from 'enrollment')
    or (p_kind = 'private' and p_payment not in ('deposit', 'full'))
    or (p_program = 'half-day' and p_session not in ('AM', 'PM'))
    or (p_program <> 'half-day' and p_session <> 'DAY')
    or p_slot_id is distinct from (p_kind || ':' || p_program || ':' || p_start::text || ':' || p_session)
    or length(trim(coalesce(p_name, ''))) not between 2 and 160
    or length(trim(coalesce(p_email, ''))) not between 6 and 254
    or trim(p_email) !~* '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'
    or length(trim(coalesce(p_phone, ''))) not between 7 and 50
    or (p_kind = 'private' and length(trim(coalesce(p_company, ''))) not between 2 and 200)
    or (p_kind = 'private' and length(trim(coalesce(p_agreement, ''))) not between 2 and 100)
    or length(coalesce(p_company, '')) > 200
    or length(coalesce(p_agreement, '')) > 100
  then
    raise exception 'Check the details and try again.';
  end if;

  day_count := case p_program when 'two-day' then 2 when 'full-academy' then 5 else 1 end;
  block := public.training_dates(p_start, day_count);
  if block is null then
    raise exception 'Choose a weekday training date.';
  end if;
  if p_start < date '2026-11-02' then
    raise exception 'This program is not open on that date yet.';
  end if;
  starts_at := (p_start::timestamp + case when p_session = 'PM' then time '13:00' else time '09:00' end) at time zone 'America/Chicago';
  if starts_at <= now() + interval '48 hours' then
    raise exception 'Registration for this session is closed.';
  end if;

  select * into target from public.payment_target(p_program, p_payment);
  if target.stripe_link is null then
    raise exception 'Check the details and try again.';
  end if;

  select b.reference, b.stripe_link into existing
  from public.bookings b
  where b.status = 'pending'
    and b.hold_until > now()
    and lower(b.email) = lower(trim(p_email))
    and b.kind = p_kind
    and b.program = p_program
    and b.session = p_session
    and b.payment = p_payment
    and b.dates = block
  order by b.created_at desc
  limit 1;
  if found then
    return jsonb_build_object(
      'reference', existing.reference,
      'checkoutUrl', existing.stripe_link || '?client_reference_id=' || existing.reference,
      'status', 'pending'
    );
  end if;

  for lock_day, part in
    select days.day::date, parts.sess
    from unnest(block) as days(day)
    cross join unnest(case when p_session = 'DAY' then array['AM', 'PM'] else array[p_session] end) as parts(sess)
    order by 1, 2
  loop
    perform pg_advisory_xact_lock(hashtextextended(lock_day::text || ':' || part, 0));
  end loop;

  select a.status, a.remaining into assessment
  from public.assess_slot(p_kind, p_program, block, p_session, null) as a;
  if assessment.status is distinct from 'available' or assessment.remaining < 1 then
    if assessment.status = 'closed' then
      raise exception 'Registration for this session is closed.';
    end if;
    raise exception 'This session has just filled. Choose another available session.';
  end if;

  new_reference := replace(gen_random_uuid()::text, '-', '');
  insert into public.bookings (
    reference, kind, program, session, dates, payment, amount_usd,
    contact_name, email, phone, company, agreement, status, hold_until, stripe_link
  ) values (
    new_reference, p_kind, p_program, p_session, block, p_payment, target.amount_usd,
    trim(p_name), lower(trim(p_email)), trim(p_phone), nullif(trim(p_company), ''), nullif(trim(p_agreement), ''),
    'pending', now() + interval '2 hours', target.stripe_link
  );

  return jsonb_build_object(
    'reference', new_reference,
    'checkoutUrl', target.stripe_link || '?client_reference_id=' || new_reference,
    'status', 'pending'
  );
end;
$$;

create or replace function public.booking_status(p_reference text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select status from public.bookings where reference = p_reference;
$$;

create or replace function public.confirm_booking(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  booking public.bookings%rowtype;
  assessment record;
begin
  if not public.is_admin() then
    raise exception 'Not allowed';
  end if;
  perform public.expire_holds();
  select * into booking from public.bookings where id = p_id;
  if booking.id is null or booking.status not in ('pending', 'expired') then
    raise exception 'This booking cannot be confirmed.';
  end if;
  select a.status, a.remaining into assessment
  from public.assess_slot(booking.kind, booking.program, booking.dates, booking.session, booking.id) as a;
  if assessment.status is distinct from 'available' or assessment.remaining < 1 then
    raise exception 'This session is no longer available. Release the conflicting booking before confirming this one.';
  end if;
  update public.bookings set status = 'confirmed', hold_until = null where id = booking.id;
end;
$$;

create or replace function public.release_booking(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not allowed';
  end if;
  update public.bookings
  set status = 'released', hold_until = null
  where id = p_id and status in ('pending', 'confirmed', 'expired');
  if not found then
    raise exception 'This booking cannot be released.';
  end if;
end;
$$;

create or replace function public.close_date(p_date date, p_session text, p_note text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Not allowed';
  end if;
  if p_session not in ('AM', 'PM', 'DAY') or p_date is null then
    raise exception 'Choose a date and session.';
  end if;
  insert into public.closures (closed_on, session, note)
  values (p_date, p_session, nullif(trim(p_note), ''))
  on conflict (closed_on, session) do update set note = excluded.note
  returning id into new_id;
  return new_id;
end;
$$;

create or replace function public.reopen_date(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not allowed';
  end if;
  delete from public.closures where id = p_id;
end;
$$;

revoke all on function public.touch_updated_at() from public, anon, authenticated;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

revoke all on function public.training_dates(date, integer) from public, anon, authenticated;
revoke all on function public.expire_holds() from public, anon, authenticated;
revoke all on function public.payment_target(text, text) from public, anon, authenticated;
revoke all on function public.assess_slot(text, text, date[], text, uuid) from public, anon, authenticated;
revoke all on function public.training_slots(text, text, date) from public, anon, authenticated;
revoke all on function public.create_booking(text, text, date, text, text, text, text, text, text, text, text) from public, anon, authenticated;
revoke all on function public.booking_status(text) from public, anon, authenticated;

revoke all on function public.confirm_booking(uuid) from public, anon;
revoke all on function public.release_booking(uuid) from public, anon;
revoke all on function public.close_date(date, text, text) from public, anon;
revoke all on function public.reopen_date(uuid) from public, anon;
grant execute on function public.confirm_booking(uuid) to authenticated;
grant execute on function public.release_booking(uuid) to authenticated;
grant execute on function public.close_date(date, text, text) to authenticated;
grant execute on function public.reopen_date(uuid) to authenticated;

grant execute on function public.training_slots(text, text, date) to service_role;
grant execute on function public.create_booking(text, text, date, text, text, text, text, text, text, text, text) to service_role;
grant execute on function public.booking_status(text) to service_role;
grant execute on function public.expire_holds() to service_role;

revoke all on public.admins from public, anon, authenticated;
revoke all on public.closures from public, anon, authenticated;
revoke all on public.bookings from public, anon, authenticated;
grant select on public.admins to authenticated;
grant select on public.closures to authenticated;
grant select on public.bookings to authenticated;

create policy admins_self on public.admins
  for select to authenticated
  using (email = lower(coalesce(auth.jwt() ->> 'email', '')));

create policy closures_admin_select on public.closures
  for select to authenticated
  using (public.is_admin());

create policy bookings_admin_select on public.bookings
  for select to authenticated
  using (public.is_admin());
