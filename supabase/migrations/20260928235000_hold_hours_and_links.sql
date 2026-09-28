-- Longer pending hold, editable from the booking desk, and the corrected Stripe links.

create table public.settings (
  key text primary key,
  value integer not null check (value > 0)
);

insert into public.settings (key, value) values ('hold_hours', 16);

alter table public.settings enable row level security;
revoke all on public.settings from public, anon, authenticated;
grant select on public.settings to authenticated;

create policy settings_admin_select on public.settings
  for select to authenticated
  using (public.is_admin());

create or replace function public.hold_hours()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select value from public.settings where key = 'hold_hours'), 16);
$$;

create or replace function public.set_hold_hours(p_hours integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not allowed';
  end if;
  if p_hours is null or p_hours not between 1 and 168 then
    raise exception 'Choose a hold between 1 and 168 hours.';
  end if;
  update public.settings set value = p_hours where key = 'hold_hours';
end;
$$;

revoke all on function public.hold_hours() from public, anon, authenticated;
revoke all on function public.set_hold_hours(integer) from public, anon;
grant execute on function public.set_hold_hours(integer) to authenticated;

create or replace function public.payment_target(p_program text, p_payment text)
returns table(amount_usd integer, stripe_link text)
language sql
immutable
set search_path = public
as $$
  select amount, link from (values
    ('half-day', 'deposit', 1875, 'https://buy.stripe.com/7sY3cvcUCeYqaPG1tX2VG00'),
    ('half-day', 'full', 3750, 'https://buy.stripe.com/4gMaEX7Ai2bEbTK0pT2VG01'),
    ('half-day', 'enrollment', 300, 'https://buy.stripe.com/5kQ6oH8EmcQi0b2c8B2VG08'),
    ('full-day', 'deposit', 3000, 'https://buy.stripe.com/eVqeVdaMu2bE1f6dcF2VG02'),
    ('full-day', 'full', 6000, 'https://buy.stripe.com/cNiaEX2fY5nQ8HygoR2VG03'),
    ('full-day', 'enrollment', 500, 'https://buy.stripe.com/cNi8wP5sa03wf5W6Oh2VG09'),
    ('two-day', 'deposit', 5000, 'https://buy.stripe.com/8x214n4o63fIf5WgoR2VG04'),
    ('two-day', 'full', 10000, 'https://buy.stripe.com/3cI14ng6Og2u0b26Oh2VG05'),
    ('two-day', 'enrollment', 900, 'https://buy.stripe.com/eVq6oHcUC03we1Sc8B2VG0a'),
    ('full-academy', 'deposit', 17500, 'https://buy.stripe.com/8x2fZhbQy3fI0b2fkN2VG06'),
    ('full-academy', 'full', 35000, 'https://buy.stripe.com/dRmaEX9Iq2bEf5WdcF2VG07'),
    ('full-academy', 'enrollment', 3200, 'https://buy.stripe.com/00waEX1bU9E60b27Sl2VG0b')
  ) as catalogue(program, payment, amount, link)
  where catalogue.program = p_program and catalogue.payment = p_payment;
$$;

revoke all on function public.payment_target(text, text) from public, anon, authenticated;

do $$
declare
  src text := pg_get_functiondef('public.create_booking(text,text,date,text,text,text,text,text,text,text,text)'::regprocedure);
begin
  src := replace(src, 'now() + interval ''2 hours''', 'now() + make_interval(hours => public.hold_hours())');
  if position('hold_hours()' in src) = 0 then
    raise exception 'The booking hold could not be updated.';
  end if;
  execute src;
end $$;
