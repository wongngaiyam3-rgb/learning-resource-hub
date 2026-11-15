create table public.inheritance_settings (
 id text primary key,
 salt text not null,
 password_hash text not null,
 iterations integer not null check(iterations >= 100000)
);
create table public.inheritance_sessions (
 id uuid primary key default gen_random_uuid(),
 class text not null check (class in ('4A','4B','4C')),
 student_no integer not null check (student_no between 1 and 25),
 token_hash text not null unique,
 created_at timestamptz not null default clock_timestamp()
);
create table public.inheritance_answers (
 event_id uuid primary key,
 seq bigint generated always as identity unique,
 session_id uuid not null references public.inheritance_sessions(id) on delete cascade,
 question_id text not null,
 choice smallint not null check (choice between 0 and 2),
 correct boolean not null,
 created_at timestamptz not null default clock_timestamp()
);
create index inheritance_answers_session on public.inheritance_answers(session_id,seq);
create index inheritance_sessions_roster on public.inheritance_sessions(class,student_no,created_at desc);
create table public.inheritance_teacher_sessions (
 token_hash text primary key,
 expires_at timestamptz not null
);
create table public.inheritance_login_attempts (
 id bigint generated always as identity primary key,
 ip_hash text not null,
 created_at timestamptz not null default clock_timestamp()
);
create index inheritance_login_attempts_ip_time on public.inheritance_login_attempts(ip_hash,created_at);
alter table public.inheritance_settings enable row level security;
alter table public.inheritance_sessions enable row level security;
alter table public.inheritance_answers enable row level security;
alter table public.inheritance_teacher_sessions enable row level security;
alter table public.inheritance_login_attempts enable row level security;
revoke all on public.inheritance_settings,public.inheritance_sessions,public.inheritance_answers,public.inheritance_teacher_sessions,public.inheritance_login_attempts from anon,authenticated;
grant all on public.inheritance_settings,public.inheritance_sessions,public.inheritance_answers,public.inheritance_teacher_sessions,public.inheritance_login_attempts to service_role;
grant usage,select on sequence public.inheritance_answers_seq_seq,public.inheritance_login_attempts_id_seq to service_role;
