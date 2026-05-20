
import React from 'react';
import { 
  Home, LayoutGrid, Users, MessageSquare, ClipboardList, History, 
  ArrowLeftRight, User, Plus, Award 
} from 'lucide-react';

export const SimulatedUserSwitcher = ({
  currentUser,
  users,
  onSwitch,
}: {
  currentUser: any;
  users: any[];
  onSwitch: (id: string) => void;
}) => (
  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 mb-8">
    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">Simular Perfil</p>
    <div className="grid grid-cols-2 gap-2">
      {users.map((profile) => (
        <button
          key={profile.id}
          onClick={() => onSwitch(profile.id)}
          className={`px-3 py-2 rounded-lg text-[10px] font-bold transition-all border ${
            currentUser.id === profile.id
              ? 'bg-primary border-primary text-white'
              : 'bg-white border-border-main text-text-muted hover:border-primary/40'
          }`}
        >
          {profile.name}
        </button>
      ))}
    </div>
  </div>
);

export const Sidebar = ({ activeTab, user, users, onTabChange, onSwitchUser }: { 
  activeTab: string, user: any, users: any[], onTabChange: (tab: string) => void, onSwitchUser: (id: string) => void 
}) => {
  const navItems = [
    { label: 'Início', icon: Home },
    { label: 'Habilidades Disponíveis', icon: LayoutGrid },
    { label: 'Membros', icon: Users },
    { label: 'Solicitações', icon: MessageSquare },
    { label: 'Meus Pedidos', icon: ClipboardList },
    { label: 'Histórico', icon: History },
  ];

  return (
    <aside className="bg-surface border-r border-border-main p-8 flex flex-col h-screen sticky top-0 hidden md:flex w-72">
      <div className="flex items-center gap-3 text-primary font-black text-xl mb-12">
        <div className="bg-primary/10 p-2 rounded-xl"><ArrowLeftRight className="w-5 h-5" /></div>
        <span className="tracking-tight">Time de Troca</span>
      </div>
      <SimulatedUserSwitcher currentUser={user} users={users} onSwitch={onSwitchUser} />
      <nav className="flex-1 space-y-1 overflow-y-auto pr-2 custom-scrollbar">
        {navItems.map((item) => (
          <button key={item.label} onClick={() => onTabChange(item.label)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === item.label ? 'bg-primary-light text-primary' : 'text-text-muted hover:bg-bg-main hover:text-text-main'}`}>
            <item.icon className="w-4 h-4" />{item.label}
          </button>
        ))}
        <button onClick={() => onTabChange('Minhas Habilidades')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'Minhas Habilidades' ? 'bg-primary-light text-primary' : 'text-text-muted hover:bg-bg-main hover:text-text-main'}`}>
          <Plus className="w-4 h-4" />Minhas Habilidades
        </button>
        <button onClick={() => onTabChange('Meu Perfil')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'Meu Perfil' ? 'bg-primary-light text-primary' : 'text-text-muted hover:bg-bg-main hover:text-text-main'}`}>
          <User className="w-4 h-4" />Meu Perfil
        </button>
        <button onClick={() => onTabChange('Cadastro')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all mt-4 border-2 border-dashed ${activeTab === 'Cadastro' ? 'bg-emerald-50 border-emerald-500 text-emerald-600' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
          <Award className="w-4 h-4" />{user.onboarded ? 'Revisar Cadastro' : 'Completar Cadastro'}
        </button>
      </nav>
      <div className="mt-auto pt-6 border-t border-border-main">
        <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Disciplina</p>
        <p className="text-sm font-bold text-text-main">Gestão da Inovação</p>
      </div>
    </aside>
  );
};

export const Header = ({ user, credits, onOpenChat }: { user: any, credits: number, onOpenChat: (u: string) => void }) => (
  <header className="flex justify-between items-center mb-8">
    <div className="flex items-center gap-4">
      <h2 className="text-sm font-medium text-text-muted">Bem vindo, {user.name}</h2>
      <button onClick={() => onOpenChat('Antonieta')} className="p-2 rounded-full hover:bg-slate-100 text-primary transition-colors active:scale-90" title="Minhas Mensagens">
        <MessageSquare className="w-5 h-5" />
      </button>
    </div>
    <div className="flex items-center gap-4">
      <div className="bg-surface border border-border-main px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold">
        <span className="text-text-muted">Saldo:</span>
        <span className="text-success">+{credits} {credits === 1 ? 'Crédito' : 'Créditos'}</span>
      </div>
      <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white overflow-hidden shadow-sm">
        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
      </div>
    </div>
  </header>
);
