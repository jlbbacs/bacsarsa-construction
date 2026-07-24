-- Automatic retention policy for activity_logs. No one -- not even a Super
-- Admin -- can delete individual rows through the app (017 deliberately
-- has no delete/update policy on this table, so the audit trail can't be
-- selectively tampered with). Instead, entries older than 90 days are
-- purged on a fixed, uniform schedule via pg_cron, running inside the
-- database itself rather than as an action any client can invoke.
--
-- Adjust the interval below if 90 days isn't the retention window you
-- want; re-running this file is safe (it replaces the existing schedule).

create extension if not exists pg_cron;

select cron.unschedule(jobid) from cron.job where jobname = 'purge-old-activity-logs';

select cron.schedule(
  'purge-old-activity-logs',
  '0 3 * * *', -- daily at 03:00 UTC
  $$ delete from activity_logs where created_at < now() - interval '90 days' $$
);
