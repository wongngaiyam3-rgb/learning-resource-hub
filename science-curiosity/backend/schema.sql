-- Private storage: never exposed through PostgREST or public client keys.
create schema xiaoke_private;
revoke all on schema xiaoke_private from public, anon, authenticated;
create table xiaoke_private.moderation_events (
 id uuid primary key, app_id text not null, academic_year text not null,
 class_name text not null check (class_name in ('4A','4B','4C')),
 student_number integer not null check (student_number between 1 and 25),
 created_at bigint not null, question text not null check (length(question)<=400),
 answer text, status text not null check (status in ('allowed','blocked','error','off_topic')),
 category text not null check (category in ('safe','violence','self_harm','sexual','other')),
 stage text not null, reason text not null, reviewed_at bigint,
 check (answer is null or status='allowed')
);
create index xiaoke_events_roster_time on xiaoke_private.moderation_events(app_id,academic_year,created_at desc,id desc);
create index xiaoke_events_cleanup on xiaoke_private.moderation_events(created_at);
create table xiaoke_private.rate_buckets (key text primary key, count integer not null check(count>0), expires_at bigint not null);
create index xiaoke_rate_cleanup on xiaoke_private.rate_buckets(expires_at);
create table xiaoke_private.site_settings (key text primary key,value text not null);
alter table xiaoke_private.moderation_events enable row level security;
alter table xiaoke_private.rate_buckets enable row level security;
alter table xiaoke_private.site_settings enable row level security;
revoke all on all tables in schema xiaoke_private from public, anon, authenticated;
alter default privileges in schema xiaoke_private revoke all on tables from public, anon, authenticated;
-- The backend uses the platform's server-only database connection. No public RPC
-- or client table policy grants access to records, settings, or Vault secrets.
