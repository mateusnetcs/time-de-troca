import { getSupabaseClient } from '@/lib/supabase';
import { formatBrazilPhone } from '@/lib/phone';
import type {
  CreditTransaction,
  ExchangeRequest,
  PaymentMethod,
  PaymentMethodType,
  Plan,
  RequestStatus,
  ServiceRequest,
  ServiceRequestStatus,
  Skill,
  Subscription,
  UserProfile,
  OnboardingInput,
  GlobalChatMessage,
} from '@/lib/types';

type NewSkillInput = {
  title: string;
  description: string;
  category: string;
  credits: number;
};

function requireClient() {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error(
      'Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local para usar o Supabase.',
    );
  }
  return client;
}

export async function fetchProfiles() {
  const supabase = requireClient();
  const { data, error } = await supabase.from('profiles').select('*').order('name');
  if (error) throw error;
  return (data ?? []) as UserProfile[];
}

export async function fetchSkills() {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Skill[];
}

export async function fetchOutgoingRequests(profileId: string) {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from('exchange_requests')
    .select('*')
    .eq('requester_profile_id', profileId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ExchangeRequest[];
}

export async function fetchIncomingRequests(profileId: string) {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from('exchange_requests')
    .select('*')
    .eq('provider_profile_id', profileId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ExchangeRequest[];
}

export async function fetchHistory(profileId: string) {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as CreditTransaction[];
}

export async function fetchUserRelatedRequests(profileId: string) {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from('exchange_requests')
    .select('*')
    .or(`requester_profile_id.eq.${profileId},provider_profile_id.eq.${profileId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ExchangeRequest[];
}

export async function fetchPlans() {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('price_cents', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Plan[];
}

export async function fetchSubscriptions(profileId: string) {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Subscription[];
}

export async function fetchPaymentMethods(profileId: string) {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('profile_id', profileId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PaymentMethod[];
}

export async function fetchServiceRequestsAsStudent(profileId: string) {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
    .eq('student_profile_id', profileId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ServiceRequest[];
}

export async function fetchServiceRequestsAsTutor(profileId: string) {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from('service_requests')
    .select('*')
    .eq('tutor_profile_id', profileId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ServiceRequest[];
}

export async function createSkill(ownerId: string, input: NewSkillInput) {
  const supabase = requireClient();
  const { error } = await supabase.from('skills').insert({
    title: input.title,
    description: input.description,
    category: input.category,
    credits: input.credits,
    owner_profile_id: ownerId,
    image_url: `https://picsum.photos/seed/${encodeURIComponent(input.title)}/400/300`,
  });
  if (error) throw error;
}

export async function removeSkill(skillId: number, ownerId: string) {
  const supabase = requireClient();
  const { error } = await supabase
    .from('skills')
    .update({ is_active: false })
    .eq('id', skillId)
    .eq('owner_profile_id', ownerId);
  if (error) throw error;
}

export async function updateProfile(profileId: string, patch: Partial<UserProfile>) {
  const supabase = requireClient();
  const { error } = await supabase.from('profiles').update(patch).eq('id', profileId);
  if (error) throw error;
}

export async function savePaymentMethod(
  profileId: string,
  input: {
    type: PaymentMethodType;
    provider?: string;
    last4?: string;
    pix_key?: string;
    is_default?: boolean;
  },
) {
  const supabase = requireClient();
  const payload = {
    profile_id: profileId,
    type: input.type,
    provider: input.provider ?? null,
    last4: input.last4 ?? null,
    pix_key: input.pix_key ?? null,
    is_default: input.is_default ?? true,
  };
  const { error } = await supabase.from('payment_methods').insert(payload);
  if (error) throw error;
}

export async function subscribeToPlan(
  profileId: string,
  plan: Plan,
  methodType: PaymentMethodType,
) {
  const supabase = requireClient();

  const endsAt = new Date();
  if (plan.billing_cycle === 'monthly') {
    endsAt.setMonth(endsAt.getMonth() + 1);
  } else if (plan.billing_cycle === 'quarterly') {
    endsAt.setMonth(endsAt.getMonth() + 3);
  } else {
    endsAt.setFullYear(endsAt.getFullYear() + 1);
  }

  const { data: sub, error: subError } = await supabase
    .from('subscriptions')
    .insert({
      profile_id: profileId,
      plan_id: plan.id,
      status: plan.price_cents === 0 ? 'trialing' : 'active',
      starts_at: new Date().toISOString(),
      ends_at: plan.price_cents === 0 ? null : endsAt.toISOString(),
      trial_ends_at: plan.price_cents === 0 ? endsAt.toISOString() : null,
    })
    .select('id')
    .single();

  if (subError) throw subError;

  if (plan.price_cents > 0) {
    const { error: payError } = await supabase.from('payments').insert({
      profile_id: profileId,
      subscription_id: sub.id,
      amount_cents: plan.price_cents,
      status: 'paid',
      method_type: methodType,
      paid_at: new Date().toISOString(),
    });
    if (payError) throw payError;
  }
}

export async function createServiceRequest(studentId: string, skill: Skill) {
  const supabase = requireClient();
  const { error } = await supabase.from('service_requests').insert({
    student_profile_id: studentId,
    tutor_profile_id: skill.owner_profile_id,
    skill_id: skill.id,
    status: 'pending',
  });
  if (error) throw error;
}

export async function updateServiceRequestStatus(
  requestId: number,
  status: ServiceRequestStatus,
) {
  const supabase = requireClient();
  const patch: { status: ServiceRequestStatus; scheduled_at?: string | null } = { status };
  if (status === 'scheduled') {
    patch.scheduled_at = new Date().toISOString();
  }
  const { error } = await supabase
    .from('service_requests')
    .update(patch)
    .eq('id', requestId);
  if (error) throw error;
}

export async function completeOnboarding(
  profile: UserProfile,
  input: OnboardingInput,
) {
  const supabase = requireClient();

  const nextProfile: Partial<UserProfile> = {
    name: input.name,
    email: input.email,
    institution: input.institution,
    course: input.course,
    period: input.period,
    avatar: input.avatar,
    info: `${input.course} - ${input.period || '-'}º Período`,
    skills_offer: input.skillsOffer,
    skills_seek: input.skillsSeek,
    role: input.role ?? profile.role ?? 'aluno',
    phone: formatBrazilPhone(input.phone_whatsapp ?? profile.phone_whatsapp ?? profile.phone),
    phone_whatsapp: formatBrazilPhone(
      input.phone_whatsapp ?? profile.phone_whatsapp ?? profile.phone,
    ),
    onboarded: true,
    credits: profile.onboarded ? profile.credits : profile.credits + 1,
    trial_started_at: profile.trial_started_at ?? new Date().toISOString(),
    trial_ends_at: profile.trial_ends_at ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const { error } = await supabase.from('profiles').update(nextProfile).eq('id', profile.id);
  if (error) throw error;

  if (!profile.onboarded) {
    const { error: txError } = await supabase.from('credit_transactions').insert({
      profile_id: profile.id,
      amount: 1,
      kind: 'onboarding_bonus',
      note: 'Bônus de conclusão do cadastro',
    });
    if (txError) throw txError;
  }
}

export async function createExchangeRequest(currentUser: UserProfile, skill: Skill) {
  if (currentUser.id === skill.owner_profile_id) {
    throw new Error('Você não pode solicitar a sua própria habilidade.');
  }

  const supabase = requireClient();
  const { data: subscriptions, error: subscriptionError } = await supabase
    .from('subscriptions')
    .select('status, ends_at, trial_ends_at')
    .eq('profile_id', currentUser.id)
    .in('status', ['trialing', 'active'])
    .order('created_at', { ascending: false });
  if (subscriptionError) throw subscriptionError;

  const nowTs = Date.now();
  const hasActivePlan = (subscriptions ?? []).some((sub) => {
    if (sub.status === 'trialing') {
      return Boolean(sub.trial_ends_at) && new Date(sub.trial_ends_at).getTime() >= nowTs;
    }
    return !sub.ends_at || new Date(sub.ends_at).getTime() >= nowTs;
  });

  if (!hasActivePlan) {
    throw new Error('Seu plano está inativo. Ative um plano para solicitar habilidades.');
  }

  const { data: request, error: requestError } = await supabase
    .from('exchange_requests')
    .insert({
      skill_id: skill.id,
      requester_profile_id: currentUser.id,
      provider_profile_id: skill.owner_profile_id,
      status: 'pending',
    })
    .select('id')
    .single();
  if (requestError) {
    if (requestError.code === '23514') {
      throw new Error('Não foi possível criar a solicitação. Escolha uma habilidade de outro usuário.');
    }
    throw requestError;
  }
}

export async function handleIncomingRequest(
  request: ExchangeRequest,
  status: RequestStatus,
) {
  const supabase = requireClient();
  const { error: statusError } = await supabase
    .from('exchange_requests')
    .update({ status })
    .eq('id', request.id);
  if (statusError) throw statusError;
}

const GLOBAL_CHAT_PAGE_SIZE = 200;

export async function fetchGlobalChatMessages(): Promise<GlobalChatMessage[]> {
  const supabase = requireClient();
  const { data, error } = await supabase
    .from('global_chat_messages')
    .select('*')
    .order('created_at', { ascending: true })
    .limit(GLOBAL_CHAT_PAGE_SIZE);
  if (error) throw error;
  return (data ?? []) as GlobalChatMessage[];
}

export async function sendGlobalChatMessage(
  profileId: string,
  content: string,
): Promise<GlobalChatMessage> {
  const supabase = requireClient();
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error('Digite uma mensagem para enviar.');
  }

  const { data, error } = await supabase
    .from('global_chat_messages')
    .insert({ profile_id: profileId, content: trimmed })
    .select('*')
    .single();
  if (error) throw error;
  return data as GlobalChatMessage;
}

export function subscribeToGlobalChat(onMessage: (message: GlobalChatMessage) => void) {
  const supabase = requireClient();
  const channel = supabase
    .channel('global-chat-geral')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'global_chat_messages' },
      (payload) => {
        onMessage(payload.new as GlobalChatMessage);
      },
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
