create or replace function public.register_app_user(
  p_name text,
  p_email text,
  p_course text,
  p_whatsapp text,
  p_password text,
  p_role text default 'aluno',
  p_plan_id bigint default null
)
returns table(profile_id uuid, username text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_role text;
  v_plan public.plans%rowtype;
  v_subscription_id bigint;
  v_ends_at timestamptz;
  v_initial_credits integer := 1;
begin
  if trim(coalesce(p_name, '')) = '' then
    raise exception 'Nome é obrigatório';
  end if;

  if trim(coalesce(p_email, '')) = '' then
    raise exception 'E-mail é obrigatório';
  end if;

  if trim(coalesce(p_password, '')) = '' then
    raise exception 'Senha é obrigatória';
  end if;

  v_role := lower(trim(coalesce(p_role, 'aluno')));
  if v_role not in ('aluno', 'tutor', 'aluno_tutor') then
    raise exception 'Perfil inválido. Use aluno, tutor ou aluno_tutor.';
  end if;

  if exists (select 1 from public.profiles where lower(email) = lower(trim(p_email))) then
    raise exception 'E-mail já cadastrado';
  end if;

  if p_plan_id is not null then
    select * into v_plan
    from public.plans
    where id = p_plan_id
      and is_active = true
    limit 1;

    if v_plan.id is null then
      raise exception 'Plano inválido ou inativo.';
    end if;

    v_initial_credits := 3;
  end if;

  insert into public.profiles (
    name,
    email,
    phone,
    phone_whatsapp,
    course,
    info,
    role,
    onboarded,
    credits,
    trial_started_at,
    trial_ends_at
  )
  values (
    trim(p_name),
    lower(trim(p_email)),
    trim(coalesce(p_whatsapp, '')),
    trim(coalesce(p_whatsapp, '')),
    trim(coalesce(p_course, '')),
    trim(coalesce(p_course, '')),
    v_role,
    true,
    v_initial_credits,
    case
      when p_plan_id is not null and v_plan.price_cents = 0 then timezone('utc', now())
      else null
    end,
    case
      when p_plan_id is not null and v_plan.price_cents = 0 then timezone('utc', now()) + interval '7 days'
      else null
    end
  )
  returning id into v_profile_id;

  insert into public.app_users (profile_id, username, password_hash, is_active)
  values (
    v_profile_id,
    lower(trim(p_email)),
    md5(p_password),
    true
  );

  if p_plan_id is not null then
    if v_plan.price_cents > 0 then
      v_ends_at := case
        when v_plan.billing_cycle = 'monthly' then timezone('utc', now()) + interval '1 month'
        when v_plan.billing_cycle = 'quarterly' then timezone('utc', now()) + interval '3 months'
        else timezone('utc', now()) + interval '1 year'
      end;
    else
      v_ends_at := null;
    end if;

    insert into public.subscriptions (
      profile_id,
      plan_id,
      status,
      starts_at,
      ends_at,
      trial_ends_at
    )
    values (
      v_profile_id,
      v_plan.id,
      case when v_plan.price_cents = 0 then 'trialing' else 'active' end,
      timezone('utc', now()),
      v_ends_at,
      case when v_plan.price_cents = 0 then timezone('utc', now()) + interval '7 days' else null end
    )
    returning id into v_subscription_id;

    if v_plan.price_cents > 0 then
      insert into public.payments (
        profile_id,
        subscription_id,
        amount_cents,
        status,
        method_type,
        paid_at
      )
      values (
        v_profile_id,
        v_subscription_id,
        v_plan.price_cents,
        'paid',
        'pix',
        timezone('utc', now())
      );
    end if;
  end if;

  insert into public.credit_transactions (profile_id, amount, kind, note)
  values (v_profile_id, v_initial_credits, 'onboarding_bonus', 'Créditos iniciais do cadastro');

  return query
  select v_profile_id, lower(trim(p_email));
end;
$$;

grant execute on function public.register_app_user(text, text, text, text, text, text, bigint) to anon, authenticated;

update public.profiles p
set credits = 3
where p.credits < 1
  and exists (
    select 1
    from public.subscriptions s
    where s.profile_id = p.id
      and s.status in ('trialing', 'active')
  );
