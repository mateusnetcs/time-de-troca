import { getSupabaseClient } from '@/lib/supabase';
import type { CreditTransaction, ExchangeRequest, RequestStatus, Skill, UserProfile } from '@/lib/types';

type NewSkillInput = {
  title: string;
  description: string;
  category: string;
  credits: number;
};

type OnboardingInput = {
  name: string;
  email: string;
  institution: string;
  course: string;
  period: string;
  avatar: string;
  skillsOffer: string;
  skillsSeek: string;
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
    onboarded: true,
    credits: profile.onboarded ? profile.credits : profile.credits + 1,
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
  if (currentUser.credits < skill.credits) {
    throw new Error('Saldo insuficiente para realizar esta troca.');
  }
  const supabase = requireClient();

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
  if (requestError) throw requestError;

  const nextCredits = currentUser.credits - skill.credits;
  const { error: creditsError } = await supabase
    .from('profiles')
    .update({ credits: nextCredits })
    .eq('id', currentUser.id);
  if (creditsError) throw creditsError;

  const { error: txError } = await supabase.from('credit_transactions').insert({
    profile_id: currentUser.id,
    amount: -skill.credits,
    kind: 'exchange_spent',
    reference_exchange_id: request.id,
    note: `Troca solicitada: ${skill.title}`,
  });
  if (txError) throw txError;
}

export async function handleIncomingRequest(
  request: ExchangeRequest,
  status: RequestStatus,
  currentProvider: UserProfile,
  creditsForRequest: number,
) {
  const supabase = requireClient();
  const { error: statusError } = await supabase
    .from('exchange_requests')
    .update({ status })
    .eq('id', request.id);
  if (statusError) throw statusError;

  if (status !== 'accepted') return;

  const nextCredits = currentProvider.credits + creditsForRequest;
  const { error: creditsError } = await supabase
    .from('profiles')
    .update({ credits: nextCredits })
    .eq('id', currentProvider.id);
  if (creditsError) throw creditsError;

  const { error: txError } = await supabase.from('credit_transactions').insert({
    profile_id: currentProvider.id,
    amount: creditsForRequest,
    kind: 'exchange_earned',
    reference_exchange_id: request.id,
    note: 'Créditos recebidos por troca aceita',
  });
  if (txError) throw txError;
}
