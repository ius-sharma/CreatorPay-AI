-- Atomic deal, invoice checkpoint, audit and webhook updates for the app backend.
begin;
create function public.creatorpay_commit_deal(
  p_owner uuid, p_deal text, p_revision bigint, p_body jsonb,
  p_invoice jsonb default null, p_audit jsonb default '[]',
  p_event text default null, p_event_invoice text default null,
  p_job text default null, p_token uuid default null
) returns jsonb language plpgsql security invoker set search_path = '' as $$
declare v_row public.creatorpay_deals%rowtype; v_prior text; v_item jsonb;
begin
  select * into v_row from public.creatorpay_deals where id=p_deal and owner_id=p_owner for update;
  if not found then raise exception 'Deal access denied' using errcode='42501'; end if;
  if p_event is not null then
    select invoice_id into v_prior from public.creatorpay_webhook_events where id=p_event;
    if found then
      if v_prior is distinct from p_event_invoice then raise exception 'Webhook invoice mismatch' using errcode='22023'; end if;
      return jsonb_build_object('duplicate',true,'body',v_row.body,'revision',v_row.revision);
    end if;
  end if;
  if p_job is not null and not exists(select 1 from public.creatorpay_jobs where key=p_job and deal_id=p_deal and token=p_token and lease_until>clock_timestamp()) then
    raise exception 'Operation lease expired' using errcode='P0001';
  end if;
  if v_row.revision <> p_revision then raise exception 'Deal changed; retry' using errcode='40001'; end if;
  if p_body->>'id' is distinct from p_deal then raise exception 'Deal ID mismatch' using errcode='22023'; end if;
  if p_event is not null then
    if not exists(select 1 from public.creatorpay_invoice_links where invoice_id=p_event_invoice and deal_id=p_deal and owner_id=p_owner) then
      raise exception 'Untracked invoice' using errcode='22023';
    end if;
    insert into public.creatorpay_webhook_events(id,invoice_id) values(p_event,p_event_invoice);
    update public.creatorpay_invoice_links set body=jsonb_set(body,'{status}','"PAID"') where invoice_id=p_event_invoice;
  end if;
  if p_invoice is not null then
    if exists(select 1 from public.creatorpay_invoice_links where invoice_id=p_invoice->>'id' and (deal_id<>p_deal or owner_id<>p_owner or milestone_id<>p_invoice->>'milestoneId' or merchant_email<>p_invoice->>'merchantEmail')) then
      raise exception 'Invoice mapping mismatch' using errcode='22023';
    end if;
    insert into public.creatorpay_invoice_links(invoice_id,deal_id,owner_id,milestone_id,merchant_email,body)
    values(p_invoice->>'id',p_deal,p_owner,p_invoice->>'milestoneId',p_invoice->>'merchantEmail',p_invoice)
    on conflict(invoice_id) do update set body=excluded.body;
  end if;
  if jsonb_typeof(p_audit) <> 'array' then raise exception 'Invalid audit records' using errcode='22023'; end if;
  for v_item in select value from jsonb_array_elements(p_audit) loop
    if exists(select 1 from public.creatorpay_audit where id=v_item->>'id' and (deal_id<>p_deal or owner_id<>p_owner)) then
      raise exception 'Audit mapping mismatch' using errcode='22023';
    end if;
    insert into public.creatorpay_audit(id,deal_id,owner_id,body) values(v_item->>'id',p_deal,p_owner,v_item)
    on conflict(id) do update set body=excluded.body;
  end loop;
  update public.creatorpay_deals set body=p_body,revision=revision+1,updated_at=now() where id=p_deal;
  return jsonb_build_object('duplicate',false,'body',p_body,'revision',p_revision+1);
end;
$$;
revoke all on function public.creatorpay_commit_deal(uuid,text,bigint,jsonb,jsonb,jsonb,text,text,text,uuid) from public,anon,authenticated;
grant execute on function public.creatorpay_commit_deal(uuid,text,bigint,jsonb,jsonb,jsonb,text,text,text,uuid) to service_role;
commit;
