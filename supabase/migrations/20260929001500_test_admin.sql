-- A second booking-desk account for testing. The password lives in Supabase Auth, not here.

insert into public.admins (email)
values ('zluvuno@gmail.com')
on conflict (email) do nothing;
