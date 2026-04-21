-- Alex Sales Bot — Database Setup
-- Run this entire block in Supabase SQL Editor

create extension if not exists pg_net;

create table if not exists alex_leads (
  id uuid default gen_random_uuid() primary key,
  telegram_chat_id text unique not null,
  name text,
  email text,
  country text,
  pain_point text,
  status text default 'NEW',
  registered_at timestamptz,
  attended_at timestamptz,
  followup_started_at timestamptz,
  last_contacted_at timestamptz,
  interest_level text default 'warm',
  objections_raised text,
  notes text,
  data_collected boolean default false,
  wind_down_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists alex_conversations (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references alex_leads(id) on delete cascade,
  role text not null,
  message text not null,
  created_at timestamptz default now()
);

create index if not exists idx_alex_conv_lead_created
  on alex_conversations(lead_id, created_at);

create or replace function update_alex_leads_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_alex_leads_updated_at on alex_leads;
create trigger trg_alex_leads_updated_at
  before update on alex_leads
  for each row execute function update_alex_leads_updated_at();

-- Cron jobs (replace YOUR_SERVICE_ROLE_KEY below with your Supabase service role key)
select cron.schedule(
  'alex-daily-8am',
  '0 7 * * *',
  $$
  select net.http_post(
    url := 'https://jebixaluhhuidxmnlgit.supabase.co/functions/v1/alex-daily',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

select cron.schedule(
  'alex-training-live',
  '45 18 * * 0',
  $$
  select net.http_post(
    url := 'https://jebixaluhhuidxmnlgit.supabase.co/functions/v1/alex-daily',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
    body := '{"training_live":true}'::jsonb
  );
  $$
);
