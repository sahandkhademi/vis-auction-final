-- Enable required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily incremental backup at 2 AM UTC
SELECT cron.schedule(
  'daily-incremental-backup',
  '0 2 * * *',
  $$
  SELECT
    net.http_post(
      url := CONCAT(current_setting('app.settings.supabase_url'), '/functions/v1/initiate-backup'),
      headers := json_build_object(
        'Content-Type', 'application/json',
        'Authorization', CONCAT('Bearer ', current_setting('app.settings.service_role_key'))
      )::jsonb,
      body := '{}'::jsonb
    ) as request_id;
  $$
);