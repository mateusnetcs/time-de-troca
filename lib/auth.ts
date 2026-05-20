import { getSupabaseClient } from '@/lib/supabase';

export const SESSION_PROFILE_KEY = 'skillnet_profile_id';
export const SESSION_USERNAME_KEY = 'skillnet_username';

export async function authenticateAppUser(username: string, password: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase não configurado.');
  }

  const { data, error } = await supabase.rpc('authenticate_app_user', {
    p_username: username,
    p_password: password,
  });

  if (error) {
    throw error;
  }

  const user = Array.isArray(data) ? data[0] : null;
  if (!user) {
    return null;
  }

  return user as { profile_id: string; username: string };
}
