export type RequestStatus = 'pending' | 'accepted' | 'declined';
export type ProfileRole = 'aluno' | 'tutor' | 'aluno_tutor';
export type PaymentMethodType = 'pix' | 'credito' | 'debito';
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled';
export type ServiceRequestStatus = 'pending' | 'accepted' | 'scheduled' | 'completed' | 'declined';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  phone_whatsapp: string;
  bio: string;
  info: string;
  avatar: string;
  institution: string;
  period: string;
  course: string;
  onboarded: boolean;
  skills_offer: string;
  skills_seek: string;
  credits: number;
  role: ProfileRole;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: number;
  title: string;
  description: string;
  category: string;
  credits: number;
  image_url: string;
  owner_profile_id: string;
  is_active: boolean;
  created_at: string;
}

export interface ExchangeRequest {
  id: number;
  skill_id: number;
  requester_profile_id: string;
  provider_profile_id: string;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: number;
  profile_id: string;
  amount: number;
  kind: 'onboarding_bonus' | 'exchange_spent' | 'exchange_earned';
  reference_exchange_id: number | null;
  note: string | null;
  created_at: string;
}

export interface Plan {
  id: number;
  name: string;
  description: string;
  price_cents: number;
  billing_cycle: 'monthly' | 'quarterly' | 'yearly';
  is_active: boolean;
  created_at: string;
}

export interface Subscription {
  id: number;
  profile_id: string;
  plan_id: number;
  status: SubscriptionStatus;
  starts_at: string;
  ends_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: number;
  profile_id: string;
  type: PaymentMethodType;
  provider: string | null;
  last4: string | null;
  pix_key: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  profile_id: string;
  subscription_id: number | null;
  amount_cents: number;
  status: 'pending' | 'paid' | 'failed';
  method_type: PaymentMethodType;
  paid_at: string | null;
  created_at: string;
}

export interface ServiceRequest {
  id: number;
  student_profile_id: string;
  tutor_profile_id: string;
  skill_id: number;
  status: ServiceRequestStatus;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}
