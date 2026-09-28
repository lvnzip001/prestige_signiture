-- Admin inquiry notifications only. No customer or booking emails.
create table public.email_settings (
  id boolean primary key default true check (id),
  enabled boolean not null default false,
  sender_name text not null default 'The Prestige Signature Standard Academy' check (length(sender_name) between 1 and 100 and sender_name !~ E'[\r\n<>]'),
  reply_to text not null default 'nwimbley@prestigesignaturestandard.com' check (reply_to ~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$'),
  notification_to text not null default 'nwimbley@prestigesignaturestandard.com' check (notification_to ~ '^[^@[:space:]]+@[^@[:space:]]+[.][^@[:space:]]+$')
);
insert into public.email_settings(id) values(true);
create table public.email_templates (
  key text primary key,
  label text not null,
  subject text not null check(length(subject) between 1 and 200 and subject !~ E'[\r\n]'),
  body text not null check(length(body) between 1 and 8000)
);
insert into public.email_templates values
('inquiry_admin','New inquiry notification','New discovery inquiry',E'A discovery inquiry has been received.\n\n{{details}}');
create table public.inquiries (
 id uuid primary key, email text not null, details jsonb not null, created_at timestamptz not null default now()
);
create table public.email_outbox (
 id uuid primary key default gen_random_uuid(),
 event_key text not null unique, template_key text not null references public.email_templates,
 recipient text not null, variables jsonb not null,
 state text not null default 'queued' check(state in ('queued','sending','sent','failed','skipped')),
 attempts integer not null default 0, available_at timestamptz not null default now(),
 first_attempt_at timestamptz, locked_at timestamptz, payload jsonb, provider_id text,
 delivery_status text, last_error text, created_at timestamptz not null default now()
);
create index email_outbox_queue on public.email_outbox(state, available_at);
alter table public.email_settings enable row level security;
alter table public.email_templates enable row level security;
alter table public.email_outbox enable row level security;
alter table public.inquiries enable row level security;
create policy email_settings_admin on public.email_settings for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy email_templates_admin on public.email_templates for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy email_outbox_admin on public.email_outbox for select to authenticated using(public.is_admin());
create policy inquiries_admin on public.inquiries for select to authenticated using(public.is_admin());
revoke all on public.email_settings, public.email_templates, public.email_outbox, public.inquiries from public, anon, authenticated;
grant select on public.email_settings to authenticated;
grant update (notification_to) on public.email_settings to authenticated;
grant select on public.email_outbox, public.inquiries to authenticated;
grant all on public.email_settings, public.email_templates, public.email_outbox, public.inquiries to service_role;

create function public.accept_inquiry(p_id uuid, p_details jsonb) returns void language plpgsql security definer set search_path=public as $$
declare details text;
begin
 perform pg_advisory_xact_lock(hashtextextended(lower(p_details->>'email'), 1));
 if exists(select 1 from public.inquiries where id=p_id) then return; end if;
 if (select count(*) from public.inquiries where email=lower(p_details->>'email') and created_at > now()-interval '1 hour') >= 3 then raise exception 'Too many inquiries. Please try later or call Prestige.'; end if;
 insert into public.inquiries values(p_id,lower(p_details->>'email'),p_details,now());
 select string_agg(key || ': ' || value,E'\n' order by key) into details from jsonb_each_text(p_details);
 insert into public.email_outbox(event_key,template_key,recipient,variables) select p_id || ':admin','inquiry_admin',notification_to,jsonb_build_object('name',p_details->>'name','details',details) from public.email_settings;
end $$;

create function public.claim_email() returns setof public.email_outbox language plpgsql security definer set search_path=public as $$
begin
 if not (select enabled from public.email_settings where id) then return; end if;
 -- FormSubmit has no documented idempotency key. A crashed send needs manual review.
 update public.email_outbox set state='failed',last_error='Delivery uncertain: check the inbox before resending.' where state='sending' and locked_at<now()-interval '5 minutes';
 return query with candidate as (
 select id from public.email_outbox where state='queued' and available_at<=now() order by created_at for update skip locked limit 1
 ) update public.email_outbox q set state='sending',locked_at=now(),first_attempt_at=coalesce(first_attempt_at,now()),attempts=attempts+1 from candidate c where q.id=c.id returning q.*;
end $$;
revoke all on function public.accept_inquiry(uuid,jsonb), public.claim_email() from public, anon, authenticated;
grant execute on function public.accept_inquiry(uuid,jsonb), public.claim_email() to service_role;
