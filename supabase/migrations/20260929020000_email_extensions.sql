-- Scheduler extensions for the inquiry worker. Already enabled on the hosted project.
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;
