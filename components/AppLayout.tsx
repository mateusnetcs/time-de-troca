
import React from 'react';
import { 
  Home, LayoutGrid, Users, MessageSquare, ClipboardList, History, CreditCard,
  ArrowLeftRight, User, Plus, Award, LogOut, BookOpen, GraduationCap
} from 'lucide-react';

export const SimulatedUserSwitcher = ({ currentUser }: { currentUser: any }) => (
  <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 mb-8">
    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">Simular Perfil</p>
    <div className="px-3 py-2 rounded-lg text-[10px] font-bold border bg-primary border-primary text-white text-center">
      {currentUser.name}
    </div>
  </div>
);

export const Sidebar = ({ activeTab, user, onTabChange }: { 
  activeTab: string, user: any, onTabChange: (tab: string) => void
}) => {
  const navItems = [
    { label: 'Início', icon: Home },
    { label: 'Painel do Aluno', icon: Home },
    { label: 'Painel do Tutor', icon: Users },
    { label: 'Habilidades Disponíveis', icon: LayoutGrid },
    { label: 'Membros', icon: Users },
    { label: 'Solicitações', icon: MessageSquare },
    { label: 'Meus Pedidos', icon: ClipboardList },
    { label: 'Histórico', icon: History },
    { label: 'Planos', icon: Award },
    { label: 'Pagamentos', icon: CreditCard },
  ];

  return (
    <aside className="bg-surface border-r border-border-main p-8 flex flex-col h-screen sticky top-0 hidden md:flex w-72">
      <div className="flex items-center gap-3 text-primary font-black text-xl mb-12">
        <div className="bg-primary/10 p-2 rounded-xl"><ArrowLeftRight className="w-5 h-5" /></div>
        <span className="tracking-tight">Time de Troca</span>
      </div>
      <SimulatedUserSwitcher currentUser={user} />
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
        <p className="text-[10px] text-text-muted mt-2 uppercase">Perfil: {user.role || 'aluno'}</p>
      </div>
    </aside>
  );
};

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
}) => (
  <header className="flex justify-between items-center mb-8">
    <div className="flex items-center gap-4">
      <h2 className="text-sm font-medium text-text-muted">Bem vindo, {user.name}</h2>
      <button onClick={() => onOpenChat('Antonieta')} className="p-2 rounded-full hover:bg-slate-100 text-primary transition-colors active:scale-90" title="Minhas Mensagens">
        <MessageSquare className="w-5 h-5" />
      </button>
    </div>
    <div className="flex items-center gap-4">
      <div className="bg-surface border border-border-main px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold">
        <span className="text-text-muted">Plano:</span>
        <span className={planActive ? 'text-success' : 'text-amber-600'}>
          {planActive ? 'Ativo' : 'Inativo'}
        </span>
      </div>
      <div
        className="flex items-center gap-3 rounded-full border border-border-main bg-surface px-3 py-2 text-sm font-semibold text-text-muted"
        title="Perfil definido no cadastro"
      >
        <span className={`inline-flex items-center gap-1 ${user.role === 'aluno' ? 'text-primary' : ''}`}>
          <BookOpen className="h-4 w-4" />
          Aluno
        </span>
        <span className="relative h-6 w-11 rounded-full bg-primary/20 p-1">
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-primary transition-transform ${user.role === 'aluno' ? 'translate-x-0' : 'translate-x-5'}`}
          />
        </span>
        <span className={`inline-flex items-center gap-1 ${user.role !== 'aluno' ? 'text-primary' : ''}`}>
          <GraduationCap className="h-4 w-4" />
          Tutor
        </span>
      </div>
      <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white overflow-hidden shadow-sm">
        <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
      </div>
      <button onClick={onLogout} className="p-2 rounded-full hover:bg-slate-100 text-text-muted" title="Sair">
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  </header>
);
