
import React from 'react';
import {
  Home,
  LayoutGrid,
  Users,
  MessageSquare,
  ClipboardList,
  History,
  CreditCard,
  ArrowLeftRight,
  User,
  Plus,
  Award,
  LogOut,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import type { ActiveRole } from '@/lib/role-session';
import { canSwitchRole, TABS_BY_ACTIVE_ROLE } from '@/lib/role-session';
import type { ProfileRole } from '@/lib/types';

const NAV_ITEMS = [
  { label: 'Início', icon: Home },
  { label: 'Habilidades Disponíveis', icon: LayoutGrid },
  { label: 'Painel do Aluno', icon: Home },
  { label: 'Painel do Tutor', icon: Users },
  { label: 'Membros', icon: Users },
  { label: 'Solicitações', icon: MessageSquare },
  { label: 'Meus Pedidos', icon: ClipboardList },
  { label: 'Histórico', icon: History },
  { label: 'Planos', icon: Award },
  { label: 'Pagamentos', icon: CreditCard },
  { label: 'Minhas Habilidades', icon: Plus },
  { label: 'Meu Perfil', icon: User },
  { label: 'Cadastro', icon: Award },
];

function RoleSwitcher({
  profileRole,
  activeRole,
  onRoleChange,
}: {
  profileRole: ProfileRole;
  activeRole: ActiveRole;
  onRoleChange: (role: ActiveRole) => void;
}) {
  const switchable = canSwitchRole(profileRole);

  const alunoActive = activeRole === 'aluno';
  const tutorActive = activeRole === 'tutor';

  const alunoClass = alunoActive ? 'text-[#ff7e00] font-bold' : 'text-[#6b7280]';
  const tutorClass = tutorActive ? 'text-[#ff7e00] font-bold' : 'text-[#6b7280]';

  if (!switchable) {
    const onlyAluno = profileRole === 'aluno';
    return (
      <div className="hidden items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs md:flex">
        {onlyAluno ? (
          <>
            <BookOpen className="h-3.5 w-3.5 text-[#ff7e00]" />
            <span className="font-bold text-[#ff7e00]">Aluno</span>
          </>
        ) : (
          <>
            <GraduationCap className="h-3.5 w-3.5 text-[#ff7e00]" />
            <span className="font-bold text-[#ff7e00]">Instrutor</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="hidden rounded-full border border-white/10 p-0.5 text-xs md:flex">
      <button
        type="button"
        onClick={() => onRoleChange('aluno')}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all ${
          alunoActive ? 'bg-[#ff7e00]/15 shadow-[0_0_12px_rgba(255,126,0,0.25)]' : 'hover:bg-white/5'
        }`}
        title="Modo aluno"
      >
        <BookOpen className={`h-3.5 w-3.5 ${alunoClass}`} />
        <span className={alunoClass}>Aluno</span>
      </button>
      <span className="self-center text-white/15">|</span>
      <button
        type="button"
        onClick={() => onRoleChange('tutor')}
        className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all ${
          tutorActive ? 'bg-[#ff7e00]/15 shadow-[0_0_12px_rgba(255,126,0,0.25)]' : 'hover:bg-white/5'
        }`}
        title="Modo instrutor"
      >
        <GraduationCap className={`h-3.5 w-3.5 ${tutorClass}`} />
        <span className={tutorClass}>Instrutor</span>
      </button>
    </div>
  );
}

export const SistemaNavbar = ({
  activeTab,
  user,
  activeRole,
  planActive,
  onTabChange,
  onRoleChange,
  onLogout,
  onOpenProfile,
}: {
  activeTab: string;
  user: { role: ProfileRole; avatar: string; name: string };
  activeRole: ActiveRole;
  planActive: boolean;
  onTabChange: (tab: string) => void;
  onRoleChange: (role: ActiveRole) => void;
  onLogout: () => void;
  onOpenProfile: () => void;
}) => {
  const visibleTabs = new Set(TABS_BY_ACTIVE_ROLE[activeRole]);
  const filteredNavItems = NAV_ITEMS.filter((item) => visibleTabs.has(item.label));

  return (
  <header className="relative z-20 border-b border-white/5 bg-black/80 backdrop-blur-md">
    <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-4 md:px-8">
      <button type="button" onClick={() => onTabChange('Início')} className="flex items-center gap-2">
        <div className="infernus-icon-box flex h-9 w-9 items-center justify-center rounded-lg">
          <ArrowLeftRight className="h-4 w-4 text-accent" />
        </div>
        <span className="font-outfit hidden text-lg font-black tracking-tight text-white sm:inline">
          SKILLNET
        </span>
      </button>

      <nav className="hidden items-center gap-6 lg:flex">
        {['Início', 'Habilidades Disponíveis', 'Planos', 'Membros'].map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => onTabChange(label)}
            className={`infernus-nav-link ${activeTab === label ? 'active' : ''}`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-2 md:gap-3">
        <span className="hidden rounded-full border border-white/10 px-3 py-1 text-xs font-bold text-primary-light md:inline">
          Plano: <span className={planActive ? 'text-accent' : 'text-red-400'}>{planActive ? 'Ativo' : 'Inativo'}</span>
        </span>
        <RoleSwitcher profileRole={user.role} activeRole={activeRole} onRoleChange={onRoleChange} />
        <button
          type="button"
          onClick={onOpenProfile}
          title="Editar meu perfil"
          className="h-9 w-9 overflow-hidden rounded-full border border-accent/50 transition-all hover:border-[#ff7e00] hover:shadow-[0_0_16px_rgba(255,126,0,0.45)]"
        >
          <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
        </button>
        <button type="button" onClick={onLogout} className="btn-infernus-primary flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </div>

    <div className="scrollbar-hide mx-auto flex max-w-[1400px] gap-2 overflow-x-auto px-4 pb-3 md:px-8">
      {filteredNavItems.map((item) => (
        <button
          key={item.label}
          type="button"
          onClick={() => onTabChange(item.label)}
          className={`infernus-tab flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold ${activeTab === item.label ? 'active' : ''}`}
        >
          <item.icon className="h-3.5 w-3.5" />
          {item.label}
        </button>
      ))}
    </div>
  </header>
  );
};

/** @deprecated use SistemaNavbar — mantido para compatibilidade */
export const Sidebar = ({
  activeTab,
  user,
  onTabChange,
}: {
  activeTab: string;
  user: any;
  onTabChange: (tab: string) => void;
}) => null;

export const Header = ({
  user,
  planActive,
  onOpenChat,
  onLogout,
}: {
  user: any;
  planActive: boolean;
  onOpenChat: (u: string) => void;
  onLogout: () => void;
}) => null;

export const PlanBanner = ({
  planName,
  isTrialing,
  endLabel,
  daysLeft,
}: {
  planName: string;
  isTrialing: boolean;
  endLabel: string;
  daysLeft: number;
}) => (
  <div className="relative z-10 mx-auto mb-8 flex max-w-[1400px] flex-wrap items-center justify-between gap-4 rounded-xl border border-accent/30 bg-black/50 px-5 py-4 backdrop-blur-sm">
    <div>
      <p className="text-sm font-black uppercase tracking-wide text-accent">
        {isTrialing ? '⚡ Período de Teste Ativo' : `⚡ Plano ${planName} Ativo`}
      </p>
      <p className="mt-1 text-sm text-text-muted">{endLabel}</p>
    </div>
    <div className="infernus-icon-box min-w-[88px] rounded-lg px-4 py-2 text-center">
      <p className="text-3xl font-black leading-none text-accent">{daysLeft}</p>
      <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">dias restantes</p>
    </div>
  </div>
);
