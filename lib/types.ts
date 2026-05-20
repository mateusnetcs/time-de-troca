export type RequestStatus = 'pending' | 'accepted' | 'declined';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
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
