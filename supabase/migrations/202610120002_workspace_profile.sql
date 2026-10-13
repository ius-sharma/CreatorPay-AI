-- Display preferences only. Existing payment and draft records are unchanged.
alter table public.creatorpay_workspaces
  add column if not exists workspace_name text not null default 'Creator workspace'
  check (length(btrim(workspace_name)) between 1 and 80);
