-- One recoverable contract draft per account; payment records are untouched.
alter table public.creatorpay_workspaces
  add column if not exists contract_draft jsonb not null default '{"prompt":"","useTeamRules":false}'::jsonb,
  add column if not exists draft_revision integer not null default 0,
  add column if not exists draft_saved_at timestamptz;

create or replace function public.creatorpay_save_draft(p_owner uuid, p_revision integer, p_draft jsonb)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare result jsonb;
begin
  if p_draft is null or jsonb_typeof(p_draft) <> 'object'
    or jsonb_typeof(p_draft->'prompt') is distinct from 'string'
    or length(p_draft->>'prompt') > 12000
    or jsonb_typeof(p_draft->'useTeamRules') is distinct from 'boolean'
    or p_revision is null or p_revision < 0 then
    raise exception 'Invalid contract draft.' using errcode = '22023';
  end if;
  update public.creatorpay_workspaces
    set contract_draft = jsonb_build_object('prompt',p_draft->>'prompt','useTeamRules',p_draft->'useTeamRules'),
        draft_revision = draft_revision + 1, draft_saved_at = now()
    where owner_id = p_owner and draft_revision = p_revision
    returning jsonb_build_object('draft',contract_draft,'revision',draft_revision,'savedAt',draft_saved_at) into result;
  if result is null then raise exception 'Draft changed in another tab. Load the saved draft before saving again.' using errcode = '40001'; end if;
  return result;
end $$;
revoke all on function public.creatorpay_save_draft(uuid,integer,jsonb) from public, anon, authenticated;
grant execute on function public.creatorpay_save_draft(uuid,integer,jsonb) to service_role;
