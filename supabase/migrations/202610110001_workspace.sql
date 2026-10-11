-- CreatorPay authenticated workspace foundation. Apply in Supabase SQL Editor.
-- Browser clients may read their own records, but cannot write payment state.
begin;

create table public.creatorpay_workspaces (
  owner_id uuid primary key references auth.users(id) on delete restrict,
  active_deal_id text,
  team_roster jsonb not null default '[]'::jsonb check (jsonb_typeof(team_roster) = 'array'),
  created_at timestamptz not null default now()
);
create table public.creatorpay_deals (
  id text primary key,
  owner_id uuid not null references public.creatorpay_workspaces(owner_id) on delete restrict,
  body jsonb not null check (jsonb_typeof(body) = 'object' and body ? 'id' and body->>'id' = id),
  revision bigint not null default 0 check (revision >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, owner_id)
);
create index creatorpay_deals_owner_idx on public.creatorpay_deals(owner_id, created_at desc);
create table public.creatorpay_invoice_links (
  invoice_id text primary key,
  deal_id text not null,
  owner_id uuid not null,
  milestone_id text not null,
  merchant_email text not null,
  environment text not null default 'sandbox' check (environment = 'sandbox'),
  body jsonb not null check (jsonb_typeof(body) = 'object'),
  foreign key (deal_id, owner_id) references public.creatorpay_deals(id, owner_id) on delete restrict,
  unique (deal_id, milestone_id)
);
create table public.creatorpay_audit (
  id text primary key,
  deal_id text not null,
  owner_id uuid not null,
  body jsonb not null check (jsonb_typeof(body) = 'object'),
  foreign key (deal_id, owner_id) references public.creatorpay_deals(id, owner_id) on delete restrict
);
create table public.creatorpay_webhook_events (
  id text primary key,
  invoice_id text not null references public.creatorpay_invoice_links(invoice_id) on delete restrict,
  processed_at timestamptz not null default now()
);
create table public.creatorpay_jobs (
  key text primary key,
  deal_id text not null references public.creatorpay_deals(id) on delete restrict,
  token uuid,
  lease_until timestamptz not null default '-infinity',
  invoice_id text
);
create table public.creatorpay_usage (
  bucket text not null,
  day date not null,
  owner_id uuid references auth.users(id) on delete restrict,
  count integer not null default 0 check (count >= 0),
  last_at timestamptz,
  primary key (bucket, day)
);

alter table public.creatorpay_workspaces enable row level security;
alter table public.creatorpay_deals enable row level security;
alter table public.creatorpay_invoice_links enable row level security;
alter table public.creatorpay_audit enable row level security;
alter table public.creatorpay_webhook_events enable row level security;
alter table public.creatorpay_jobs enable row level security;
alter table public.creatorpay_usage enable row level security;

revoke all on public.creatorpay_workspaces, public.creatorpay_deals,
  public.creatorpay_invoice_links, public.creatorpay_audit,
  public.creatorpay_webhook_events, public.creatorpay_jobs, public.creatorpay_usage
  from public, anon, authenticated;
grant select on public.creatorpay_workspaces, public.creatorpay_deals,
  public.creatorpay_invoice_links, public.creatorpay_audit, public.creatorpay_usage to authenticated;
grant all on public.creatorpay_workspaces, public.creatorpay_deals,
  public.creatorpay_invoice_links, public.creatorpay_audit,
  public.creatorpay_webhook_events, public.creatorpay_jobs, public.creatorpay_usage to service_role;

create policy workspace_owner_read on public.creatorpay_workspaces for select to authenticated using (owner_id = (select auth.uid()));
create policy deal_owner_read on public.creatorpay_deals for select to authenticated using (owner_id = (select auth.uid()));
create policy invoice_owner_read on public.creatorpay_invoice_links for select to authenticated using (owner_id = (select auth.uid()));
create policy audit_owner_read on public.creatorpay_audit for select to authenticated using (owner_id = (select auth.uid()));
create policy usage_owner_read on public.creatorpay_usage for select to authenticated using (owner_id = (select auth.uid()));

-- All AI operations share one durable allowance. Global lock serializes reservations
-- across app instances; database UTC time prevents client clock/cookie resets.
create function public.creatorpay_reserve_analysis(p_owner uuid)
returns void language plpgsql security invoker set search_path = '' as $$
declare
  v_now timestamptz := clock_timestamp();
  v_day date := (v_now at time zone 'UTC')::date;
  v_user public.creatorpay_usage%rowtype;
  v_total public.creatorpay_usage%rowtype;
begin
  if p_owner is null then
    raise exception 'Unknown account' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(711011, 1);
  insert into public.creatorpay_usage(bucket, day, owner_id) values ('user:' || p_owner::text, v_day, p_owner) on conflict do nothing;
  insert into public.creatorpay_usage(bucket, day) values ('global', v_day) on conflict do nothing;
  select * into v_user from public.creatorpay_usage where bucket = 'user:' || p_owner::text and day = v_day for update;
  select * into v_total from public.creatorpay_usage where bucket = 'global' and day = v_day for update;
  if v_user.count >= 10 then raise exception 'Daily account limit reached' using errcode = 'P0001'; end if;
  if v_user.last_at is not null and v_now - v_user.last_at < interval '10 seconds' then
    raise exception 'Wait 10 seconds between AI requests' using errcode = 'P0001';
  end if;
  if v_total.count >= 100 then raise exception 'Daily server budget reached' using errcode = 'P0001'; end if;
  update public.creatorpay_usage set count = count + 1, last_at = v_now where day = v_day and bucket in ('global', 'user:' || p_owner::text);
end;
$$;

-- Checkpoint ID survives retries. Token fencing prevents an expired worker from
-- releasing another worker's lease or updating its checkpoint.
create function public.creatorpay_acquire_job(p_key text, p_deal text, p_owner uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare v_job public.creatorpay_jobs%rowtype; v_token uuid := gen_random_uuid();
begin
  if not exists (select 1 from public.creatorpay_deals where id = p_deal and owner_id = p_owner) then
    raise exception 'Deal access denied' using errcode = '42501';
  end if;
  insert into public.creatorpay_jobs(key, deal_id) values(p_key, p_deal) on conflict do nothing;
  select * into v_job from public.creatorpay_jobs where key = p_key for update;
  if v_job.deal_id <> p_deal then raise exception 'Operation key mismatch' using errcode = '22023'; end if;
  if v_job.lease_until > clock_timestamp() then raise exception 'Operation already running' using errcode = 'P0001'; end if;
  update public.creatorpay_jobs set token = v_token, lease_until = clock_timestamp() + interval '3 minutes' where key = p_key;
  return jsonb_build_object('token', v_token, 'invoiceId', v_job.invoice_id);
end;
$$;
create function public.creatorpay_checkpoint_job(p_key text, p_token uuid, p_invoice text)
returns void language plpgsql security invoker set search_path = '' as $$
begin
  if p_invoice is null or p_invoice = '' then raise exception 'Invalid invoice ID' using errcode = '22023'; end if;
  update public.creatorpay_jobs set invoice_id = p_invoice where key = p_key and token = p_token and lease_until > clock_timestamp() and (invoice_id is null or invoice_id = p_invoice);
  if not found then raise exception 'Operation lease expired or invoice mismatch' using errcode = 'P0001'; end if;
end;
$$;
create function public.creatorpay_release_job(p_key text, p_token uuid)
returns void language sql security invoker set search_path = '' as $$
  update public.creatorpay_jobs set lease_until = '-infinity', token = null where key = p_key and token = p_token;
$$;

revoke all on function public.creatorpay_reserve_analysis(uuid), public.creatorpay_acquire_job(text,text,uuid),
  public.creatorpay_checkpoint_job(text,uuid,text), public.creatorpay_release_job(text,uuid) from public, anon, authenticated;
grant execute on function public.creatorpay_reserve_analysis(uuid), public.creatorpay_acquire_job(text,text,uuid),
  public.creatorpay_checkpoint_job(text,uuid,text), public.creatorpay_release_job(text,uuid) to service_role;

commit;
