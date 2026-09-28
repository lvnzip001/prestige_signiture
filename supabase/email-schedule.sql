-- Run after the edge secrets and matching Vault secrets exist.
-- pg_cron is in pg_catalog and pg_net is in extensions on this project.
-- Vault secret names: prestige_functions_url, prestige_email_worker_secret.
-- Replace an existing job with the same name so this file does not create a second schedule.
do $$
declare existing bigint;
begin
  select jobid into existing from cron.job where jobname = 'prestige-email-dispatch';
  if existing is not null then
    perform cron.unschedule(existing);
  end if;
end $$;
select cron.schedule('prestige-email-dispatch', '* * * * *', $$
 select net.http_post(
   url := (select decrypted_secret from vault.decrypted_secrets where name='prestige_functions_url') || '/email-worker',
   headers := jsonb_build_object('Content-Type','application/json','Authorization','Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name='prestige_email_worker_secret')),
   body := '{}'::jsonb,
   timeout_milliseconds := 240000
 );
$$);
