-- Job status enum
create type public.job_status as enum ('open', 'in_progress', 'closed', 'cancelled');

-- Jobs table
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  posted_by uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null,
  budget_min numeric(12,2),
  budget_max numeric(12,2),
  currency text not null default 'USD',
  country_code text,
  status public.job_status not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index idx_jobs_status on public.jobs(status);
create index idx_jobs_category on public.jobs(category);
create index idx_jobs_country on public.jobs(country_code);
create index idx_jobs_posted_by on public.jobs(posted_by);
create index idx_jobs_created_at on public.jobs(created_at desc);

-- updated_at trigger
create trigger jobs_set_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

-- Validation trigger: only users with active_role = 'client' can insert
create or replace function public.enforce_client_role_on_job_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role app_role;
begin
  if new.posted_by <> auth.uid() then
    raise exception 'Cannot post a job on behalf of another user';
  end if;

  select active_role into v_role from public.profiles where id = auth.uid();

  if v_role is null or v_role <> 'client' then
    raise exception 'You must be in client mode to post a job';
  end if;

  return new;
end;
$$;

create trigger jobs_enforce_client_role
before insert on public.jobs
for each row execute function public.enforce_client_role_on_job_insert();

-- Enable RLS
alter table public.jobs enable row level security;

-- Anyone (incl. anon) can browse open jobs
create policy "Open jobs are viewable by everyone"
on public.jobs
for select
to anon, authenticated
using (status = 'open');

-- Owners can see all of their own jobs (any status)
create policy "Owners can view their own jobs"
on public.jobs
for select
to authenticated
using (auth.uid() = posted_by);

-- Authenticated users can insert their own jobs (trigger validates role)
create policy "Authenticated users can post jobs"
on public.jobs
for insert
to authenticated
with check (auth.uid() = posted_by);

-- Owners can update their own jobs
create policy "Owners can update their own jobs"
on public.jobs
for update
to authenticated
using (auth.uid() = posted_by)
with check (auth.uid() = posted_by);

-- Owners can delete their own jobs
create policy "Owners can delete their own jobs"
on public.jobs
for delete
to authenticated
using (auth.uid() = posted_by);