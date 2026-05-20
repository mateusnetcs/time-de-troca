create or replace function public.register_app_user(
  p_name text,
  p_email text,
  p_course text,
  p_whatsapp text,
  p_password text
)
returns table(profile_id uuid, username text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
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

  if exists (select 1 from public.profiles where lower(email) = lower(trim(p_email))) then
    raise exception 'E-mail já cadastrado';
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
    'aluno',
    true,
    timezone('utc', now()),
    timezone('utc', now()) + interval '7 days'
  )
  returning id into v_profile_id;

  insert into public.app_users (profile_id, username, password_hash, is_active)
  values (
    v_profile_id,
    lower(trim(p_email)),
    md5(p_password),
    true
  );

  return query
  select v_profile_id, lower(trim(p_email));
end;
$$;

grant execute on function public.register_app_user(text, text, text, text, text) to anon, authenticated;
