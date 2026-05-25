import type { ProfileRole } from '@/lib/types';

/** Papel em uso na sessão (aluno ou instrutor). Cadastro `aluno_tutor` pode alternar. */
export type ActiveRole = 'aluno' | 'tutor';

export const SESSION_ACTIVE_ROLE_PREFIX = 'skillnet_active_role_';

export function canSwitchRole(profileRole: ProfileRole): boolean {
  return profileRole === 'aluno_tutor';
}

export function getFixedActiveRole(profileRole: ProfileRole): ActiveRole | null {
  if (profileRole === 'aluno') return 'aluno';
  if (profileRole === 'tutor') return 'tutor';
  return null;
}

export function activeRoleStorageKey(profileId: string) {
  return `${SESSION_ACTIVE_ROLE_PREFIX}${profileId}`;
}

export function readStoredActiveRole(profileId: string): ActiveRole | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(activeRoleStorageKey(profileId));
  return stored === 'aluno' || stored === 'tutor' ? stored : null;
}

export function persistActiveRole(profileId: string, role: ActiveRole) {
  localStorage.setItem(activeRoleStorageKey(profileId), role);
}

export function clearActiveRole(profileId: string) {
  localStorage.removeItem(activeRoleStorageKey(profileId));
}

export function resolveActiveRole(profileRole: ProfileRole, profileId: string): ActiveRole {
  const fixed = getFixedActiveRole(profileRole);
  if (fixed) return fixed;
  return readStoredActiveRole(profileId) ?? 'aluno';
}

/** Abas visíveis conforme o modo ativo */
export const TABS_BY_ACTIVE_ROLE: Record<ActiveRole, string[]> = {
  aluno: [
    'Início',
    'Habilidades Disponíveis',
    'Painel do Aluno',
    'Membros',
    'Meus Pedidos',
    'Histórico',
    'Planos',
    'Pagamentos',
    'Meu Perfil',
    'Cadastro',
  ],
  tutor: [
    'Início',
    'Painel do Tutor',
    'Membros',
    'Solicitações',
    'Histórico',
    'Planos',
    'Pagamentos',
    'Minhas Habilidades',
    'Meu Perfil',
    'Cadastro',
  ],
};

export function defaultTabForRole(role: ActiveRole) {
  return role === 'aluno' ? 'Painel do Aluno' : 'Painel do Tutor';
}

export function isTabAllowedForRole(tab: string, role: ActiveRole) {
  return TABS_BY_ACTIVE_ROLE[role].includes(tab);
}
