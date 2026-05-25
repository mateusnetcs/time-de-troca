
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, ChevronRight, Award, 
  ArrowLeftRight, Camera, User, X, Sparkles, UserCircle
} from 'lucide-react';
import { CATEGORIES } from '@/lib/data';
import type { OnboardingFormState, OnboardingInput, ProfileRole, UserProfile } from '@/lib/types';

const ONBOARDING_ROLE_OPTIONS: { value: ProfileRole; label: string }[] = [
  { value: 'aluno', label: 'Aluno' },
  { value: 'tutor', label: 'Instrutor' },
  { value: 'aluno_tutor', label: 'Aluno e Instrutor' },
];

function normalizeOnboardingData(data: UserProfile): OnboardingFormState {
  return {
    ...data,
    skillsOffer: data.skills_offer ?? '',
    skillsSeek: data.skills_seek ?? '',
    period: data.period ?? '',
    institution: data.institution ?? '',
    course: data.course ?? '',
    phone_whatsapp: data.phone_whatsapp || data.phone || '',
    role: data.role ?? 'aluno',
  };
}

export const SkillCard = ({ skill, onExchange, onOpenChat, onSelectStudent }: { 
  skill: any, onExchange: (s: any) => void, onOpenChat: (s: string) => void, onSelectStudent: (p: any) => void
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="skill-card-infernus group p-5 transition-all"
  >
    <div className="mb-4 flex items-start justify-between">
      <span className="rounded-md border border-[#ff7e00] bg-transparent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#ff7e00]">
        {skill.category}
      </span>
      <button type="button" className="text-[#6b7280] transition-colors hover:text-[#ff7e00]">
        <Plus className="h-4 w-4" />
      </button>
    </div>
    <h3 className="mb-2 text-lg font-bold leading-tight text-white">{skill.title}</h3>
    <p className="mb-6 line-clamp-2 h-10 text-sm leading-relaxed text-[#9ca3af]">
      Ajudo você a dominar {skill.title.toLowerCase()} com uma abordagem prática para o trabalho final.
    </p>
    <div className="flex items-center justify-between border-t border-[#374151] pt-4">
      <button type="button" onClick={() => onSelectStudent(skill.owner)} className="group/author flex items-center gap-2 transition-transform active:scale-95">
        <div className="h-7 w-7 overflow-hidden rounded-full border border-[#374151]">
          <img src={skill.owner?.avatar} alt={skill.student} className="h-full w-full object-cover" />
        </div>
        <span className="text-sm font-medium text-[#9ca3af] transition-colors group-hover/author:text-[#cee7f3]">{skill.student}</span>
      </button>
      <button
        type="button"
        onClick={() => onExchange(skill)}
        className="skill-card-action flex h-9 w-9 items-center justify-center text-white transition-transform active:scale-90"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  </motion.div>
);

export const MySkillsView = ({
  mySkills,
  onPublish,
  onDelete,
}: {
  mySkills: any[];
  onPublish: (payload: { title: string; category: string; description: string }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) => {
  const [newSkill, setNewSkill] = useState({ title: '', category: 'Exatas', description: '' });
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePublish = async () => {
    if (!newSkill.title.trim()) return;
    await onPublish(newSkill);
    setShowSuccess(true);
    setNewSkill({ title: '', category: 'Exatas', description: '' });
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="bg-surface rounded-3xl border border-border-main p-8 shadow-sm relative overflow-hidden">
        <AnimatePresence>{showSuccess && <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-center py-2 text-xs font-bold z-10">Habilidade publicada!</motion.div>}</AnimatePresence>
        <h3 className="text-xl font-bold text-text-main mb-6">Oferecer Nova Habilidade</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" value={newSkill.title} onChange={(e) => setNewSkill({ ...newSkill, title: e.target.value })} placeholder="Nome da Habilidade" className="bg-bg-main border border-border-main rounded-xl px-4 py-3 text-sm" />
          <select value={newSkill.category} onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })} className="bg-bg-main border border-border-main rounded-xl px-4 py-3 text-sm">
            {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
          </select>
          <textarea value={newSkill.description} onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })} placeholder="Descrição" className="md:col-span-2 bg-bg-main border border-border-main rounded-xl px-4 py-3 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <button type="button" onClick={handlePublish} className="btn-infernus-primary mt-8 rounded-xl px-8 py-3 font-bold active:scale-95 transition-all">Publicar</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mySkills.map(s => (
          <div key={s.id} className="bg-surface border border-border-main p-6 rounded-2xl flex items-center justify-between">
            <div><h4 className="font-bold text-text-main">{s.title}</h4><p className="text-xs text-text-muted mt-1">{s.category}</p></div>
            <button onClick={() => onDelete(s.id)} className="text-text-muted hover:text-red-500"><Plus className="w-5 h-5 rotate-45" /></button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export const HistoryView = ({ history }: { history: any[] }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <h3 className="text-xl font-bold text-text-main">Histórico</h3>
    {history.length === 0 ? <p className="text-text-muted">Nenhum registro ainda.</p> : history.map((item) => (
      <div key={item.id} className="bg-surface border border-border-main p-5 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'earned' ? 'bg-emerald-100' : 'bg-indigo-100'}`}>
            {item.type === 'earned' ? <ArrowLeftRight className="w-5 h-5 text-emerald-600" /> : <Award className="w-5 h-5 text-indigo-600" />}
          </div>
          <div><h4 className="font-bold text-text-main text-sm">{item.title}</h4><p className="text-xs text-text-muted">{item.student}</p></div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-black ${item.type === 'earned' ? 'text-emerald-600' : 'text-indigo-600'}`}>{item.type === 'earned' ? '+ Créditos' : 'Pacto'}</p>
          <p className="text-[10px] text-text-muted">{new Date(item.id).toLocaleDateString()}</p>
        </div>
      </div>
    ))}
  </motion.div>
);

export const OnboardingView = ({
  currentData,
  onFinish,
  onClose,
}: {
  currentData: UserProfile;
  onFinish: (data: OnboardingInput) => void;
  onClose?: () => void;
}) => {
  const isEditing = !!currentData?.onboarded;
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(() => normalizeOnboardingData(currentData));

  useEffect(() => {
    setFormData(normalizeOnboardingData(currentData));
    setStep(1);
  }, [currentData]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, avatar: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const finish = () => {
    onFinish({
      ...formData,
      info: `${formData.course} - ${formData.period || '-'}º Período`,
      onboarded: true,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="infernus-onboarding flex w-full flex-col overflow-hidden rounded-[2rem] border border-[#ff7e00] shadow-[0_0_48px_rgba(255,126,0,0.2)] md:min-h-[580px] md:flex-row"
    >
      <div className="infernus-onboarding-sidebar relative flex flex-col justify-between overflow-hidden p-8 text-white md:w-[36%] md:p-10">
        <div className="infernus-onboarding-sidebar-glow pointer-events-none" aria-hidden />

        <div className="relative z-10">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="mb-5 flex items-center gap-1 rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-[#cee7f3] transition-colors hover:border-[#ff7e00]/50 hover:text-white md:hidden"
            >
              <X className="h-3.5 w-3.5" /> Fechar
            </button>
          )}

          <div className="infernus-icon-box mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5">
            <ArrowLeftRight className="h-3.5 w-3.5 text-[#ff7e00]" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">SkillNet</span>
          </div>

          <h2 className="font-outfit infernus-title-glow text-2xl font-black leading-tight text-white md:text-[1.75rem]">
            {isEditing ? 'Seu perfil SkillNet' : 'Comece sua jornada.'}
          </h2>
          <p className="mt-3 max-w-[220px] text-sm leading-relaxed text-[#9ca3af]">
            {isEditing ? 'Atualize foto, dados e habilidades.' : 'Troque habilidades e cresça com a comunidade.'}
          </p>
        </div>

        <div className="relative z-10 my-8 hidden flex-col gap-3 md:flex">
          <div className="infernus-onboarding-tip rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#ff7e00]">Dica</p>
            <p className="mt-1 text-xs leading-relaxed text-[#9ca3af]">
              {step === 1
                ? 'Uma foto e dados completos aumentam a confiança nas trocas.'
                : 'Descreva o que você ensina e o que quer aprender.'}
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-[#9ca3af]">Progresso</p>
          <div className="mb-2 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ff7e00] to-[#ffb347] transition-all duration-500"
              style={{ width: step === 1 ? '50%' : '100%' }}
            />
          </div>
          <div className="space-y-3">
            {[
              { n: 1, label: 'Perfil', icon: UserCircle, hint: 'Dados pessoais' },
              { n: 2, label: 'Habilidades', icon: Sparkles, hint: 'Ensina e aprende' },
            ].map(({ n, label, icon: Icon, hint }) => {
              const active = step === n;
              const done = step > n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setStep(n)}
                  className={`infernus-onboarding-step flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-all ${
                    active ? 'infernus-onboarding-step-active' : done ? 'border-white/20 bg-white/5' : 'border-transparent hover:border-white/15 hover:bg-white/5'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      active
                        ? 'border-[#ff7e00] bg-[#ff7e00] text-white shadow-[0_0_20px_rgba(255,126,0,0.5)]'
                        : done
                          ? 'border-[#ff7e00]/40 bg-[#ff7e00]/15 text-[#ff7e00]'
                          : 'border-white/15 bg-[#0a0a0a] text-[#6b7280]'
                    }`}
                  >
                    {done && !active ? (
                      <span className="text-sm font-black">✓</span>
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className={`block text-xs font-black uppercase tracking-widest ${active ? 'text-white' : 'text-white/45'}`}>
                      {label}
                    </span>
                    <span className={`block text-[10px] ${active ? 'text-[#ff7e00]' : 'text-[#6b7280]'}`}>{hint}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative flex-1 bg-[#050505] p-6 md:p-10">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 hidden rounded-full border border-white/20 p-2 text-white transition-colors hover:border-[#ff7e00] md:block"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {step === 1 ? (
          <div className="space-y-5">
            <div className="flex justify-center pt-2">
              <div className="relative">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-2 border-[#ff7e00]/50 bg-black">
                  {formData.avatar ? (
                    <img src={formData.avatar as string} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-12 w-12 text-[#9ca3af]" />
                  )}
                </div>
                <label className="btn-infernus-primary absolute -bottom-1 -right-1 cursor-pointer rounded-full p-2.5">
                  <Camera className="h-4 w-4" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                </label>
              </div>
            </div>
            <div className="grid gap-3">
              <input
                placeholder="Nome"
                className="infernus-input w-full p-4 text-sm"
                value={formData.name as string}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <input
                placeholder="E-mail"
                className="infernus-input w-full p-4 text-sm"
                value={formData.email as string}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  placeholder="Instituição"
                  className="infernus-input w-full p-4 text-sm"
                  value={formData.institution as string}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                />
                <input
                  placeholder="Curso"
                  className="infernus-input w-full p-4 text-sm"
                  value={formData.course as string}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <input
                  placeholder="Período (ex: 8º)"
                  className="infernus-input w-full p-4 text-sm"
                  value={formData.period as string}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                />
                <input
                  placeholder="WhatsApp"
                  className="infernus-input w-full p-4 text-sm"
                  value={formData.phone_whatsapp as string}
                  onChange={(e) => setFormData({ ...formData, phone_whatsapp: e.target.value })}
                />
              </div>
              <div className="infernus-inner-panel p-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#cee7f3]">Você é</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {ONBOARDING_ROLE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: option.value })}
                      className={`infernus-role-btn px-2 py-2.5 ${formData.role === option.value ? 'active' : ''}`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button type="button" onClick={() => setStep(2)} className="btn-infernus-primary w-full rounded-2xl py-4 font-black">
              Continuar
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <textarea
              placeholder="O que você ensina?"
              className="infernus-input h-28 w-full resize-none p-4 text-sm"
              value={formData.skillsOffer as string}
              onChange={(e) => setFormData({ ...formData, skillsOffer: e.target.value })}
            />
            <textarea
              placeholder="O que você busca?"
              className="infernus-input h-28 w-full resize-none p-4 text-sm"
              value={formData.skillsSeek as string}
              onChange={(e) => setFormData({ ...formData, skillsSeek: e.target.value })}
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-infernus-outline flex-1 rounded-2xl py-4 text-sm font-bold"
              >
                Voltar
              </button>
              <button type="button" onClick={finish} className="btn-infernus-primary flex-[2] rounded-2xl py-4 font-black">
                {isEditing ? 'Salvar' : 'Finalizar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const StudentDashboardView = ({
  stats,
  trialEndsAt,
  requests,
}: {
  stats: { total: number; inProgress: number; completed: number };
  trialEndsAt: string | null;
  requests: Array<{ id: number; title: string; tutor: string; status: string }>;
}) => {
  const trialActive = trialEndsAt ? new Date(trialEndsAt) > new Date() : false;
  const statItems = [
    { label: 'Solicitados', value: stats.total },
    { label: 'Em andamento', value: stats.inProgress },
    { label: 'Concluídos', value: stats.completed },
  ];

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {statItems.map((item) => (
          <div key={item.label} className="infernus-card rounded-2xl p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#9ca3af]">{item.label}</p>
            <p className="mt-2 text-4xl font-black text-white">{item.value}</p>
          </div>
        ))}
      </div>
      <div
        className={`infernus-card rounded-2xl p-5 ${
          trialActive ? 'bg-black/40' : 'border-red-500/50 bg-red-950/20'
        }`}
      >
        <p className="text-sm font-bold uppercase tracking-wide text-[#ff7e00]">
          {trialActive ? '⚡ Período de teste ativo' : 'Período de teste expirado'}
        </p>
        <p className="mt-1 text-sm text-[#9ca3af]">
          {trialEndsAt ? `Válido até ${new Date(trialEndsAt).toLocaleDateString()}` : 'Sem período de teste cadastrado.'}
        </p>
      </div>
      <div className="space-y-3">
        <h3 className="text-lg font-bold uppercase tracking-wide text-white">Solicitações recentes</h3>
        {requests.length === 0 ? (
          <p className="text-[#9ca3af]">Nenhuma solicitação de serviço ainda.</p>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="infernus-card flex items-center justify-between rounded-xl p-4">
              <div>
                <p className="font-semibold text-white">{req.title}</p>
                <p className="text-xs text-[#9ca3af]">Tutor: {req.tutor}</p>
              </div>
              <span className="text-xs font-bold uppercase text-[#ff7e00]">{req.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const TutorDashboardView = ({
  services,
  requests,
  onAction,
}: {
  services: Array<{ id: number; title: string; category: string; whatsappUrl: string }>;
  requests: Array<{ id: number; student: string; title: string; status: string }>;
  onAction: (id: number, status: 'accepted' | 'scheduled' | 'completed' | 'declined') => Promise<void>;
}) => (
  <div className="animate-in fade-in space-y-8 duration-500">
    <div>
      <h3 className="mb-3 text-lg font-bold uppercase tracking-wide text-white">Serviços ofertados</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {services.length === 0 ? (
          <p className="text-[#9ca3af]">Você ainda não cadastrou serviços.</p>
        ) : (
          services.map((service) => (
            <div key={service.id} className="infernus-card space-y-3 rounded-xl p-4">
              <div>
                <p className="font-semibold text-white">{service.title}</p>
                <p className="text-xs text-[#9ca3af]">{service.category}</p>
              </div>
              <a
                href={service.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs font-bold text-[#ff7e00] hover:text-[#ff9533]"
              >
                Enviar mensagem para meu WhatsApp
              </a>
            </div>
          ))
        )}
      </div>
    </div>
    <div>
      <h3 className="mb-3 text-lg font-bold uppercase tracking-wide text-white">Solicitações recebidas</h3>
      <div className="space-y-3">
        {requests.length === 0 ? (
          <p className="text-[#9ca3af]">Nenhuma solicitação recebida.</p>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="infernus-card rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{req.title}</p>
                  <p className="text-xs text-[#9ca3af]">Aluno: {req.student}</p>
                </div>
                <span className="text-[10px] font-bold uppercase text-[#ff7e00]">{req.status}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                <button type="button" onClick={() => onAction(req.id, 'accepted')} className="btn-infernus-primary rounded-lg py-2 text-xs font-bold">
                  Aceitar
                </button>
                <button
                  type="button"
                  onClick={() => onAction(req.id, 'scheduled')}
                  className="btn-infernus-outline rounded-lg py-2 text-xs font-bold"
                >
                  Agendar
                </button>
                <button
                  type="button"
                  onClick={() => onAction(req.id, 'completed')}
                  className="rounded-lg border border-[#ff7e00]/50 bg-[#ff7e00]/15 py-2 text-xs font-bold text-[#ff7e00]"
                >
                  Concluir
                </button>
                <button
                  type="button"
                  onClick={() => onAction(req.id, 'declined')}
                  className="rounded-lg border border-white/15 bg-black py-2 text-xs font-bold text-[#9ca3af]"
                >
                  Recusar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);

const billingCycleLabel: Record<string, string> = {
  monthly: 'mês',
  yearly: 'ano',
  trial: 'teste',
};

export const PlansView = ({
  plans,
  onSubscribe,
}: {
  plans: Array<{ id: number; name: string; description: string; price_cents: number; billing_cycle: string }>;
  onSubscribe: (planId: number) => Promise<void>;
}) => (
  <div className="animate-in fade-in duration-500">
    <div className="infernus-panel grid grid-cols-1 gap-5 md:grid-cols-3">
      {plans.length === 0 ? (
        <p className="col-span-full py-12 text-center text-[#9ca3af]">Nenhum plano disponível no momento.</p>
      ) : (
        plans.map((plan) => (
          <div key={plan.id} className="infernus-plan-card flex flex-col p-6">
            <h3 className="text-xl font-black text-white">{plan.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#9ca3af]">{plan.description}</p>
            <p className="mt-5 text-2xl font-black text-white">
              R$ {(plan.price_cents / 100).toFixed(2)}{' '}
              <span className="text-xs font-medium text-[#cee7f3]">
                /{billingCycleLabel[plan.billing_cycle] ?? plan.billing_cycle}
              </span>
            </p>
            <button
              type="button"
              onClick={() => onSubscribe(plan.id)}
              className="btn-infernus-primary mt-6 w-full rounded-xl py-3 text-sm uppercase tracking-wide"
            >
              Assinar plano
            </button>
          </div>
        ))
      )}
    </div>
  </div>
);

export const PaymentMethodsView = ({
  methods,
  onSave,
}: {
  methods: Array<{ id: number; type: string; provider?: string | null; pix_key?: string | null; last4?: string | null }>;
  onSave: (payload: { type: 'pix' | 'credito' | 'debito'; provider?: string; pix_key?: string; last4?: string }) => Promise<void>;
}) => {
  const [type, setType] = useState<'pix' | 'credito' | 'debito'>('pix');
  const [provider, setProvider] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [last4, setLast4] = useState('');

  return (
    <div className="animate-in fade-in space-y-6 duration-500">
      <div className="infernus-panel space-y-6">
        <div className="infernus-inner-panel space-y-4 p-6">
          <h3 className="text-lg font-bold text-white">Adicionar método de pagamento</h3>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as 'pix' | 'credito' | 'debito')}
            className="infernus-input w-full p-3 text-sm"
          >
            <option value="pix">PIX</option>
            <option value="credito">Cartão de Crédito</option>
            <option value="debito">Cartão de Débito</option>
          </select>
          {type === 'pix' ? (
            <input
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder="Chave PIX"
              className="infernus-input w-full p-3 text-sm"
            />
          ) : (
            <>
              <input
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="Bandeira/Operadora"
                className="infernus-input w-full p-3 text-sm"
              />
              <input
                value={last4}
                onChange={(e) => setLast4(e.target.value)}
                placeholder="Últimos 4 dígitos"
                className="infernus-input w-full p-3 text-sm"
              />
            </>
          )}
          <button
            type="button"
            onClick={() => onSave({ type, provider, pix_key: pixKey, last4 })}
            className="btn-infernus-primary rounded-xl px-6 py-3 text-sm"
          >
            Salvar método
          </button>
        </div>

        <div className="space-y-3 px-1">
          <h4 className="font-bold text-white">Métodos salvos</h4>
          {methods.length === 0 ? (
            <p className="text-[#9ca3af]">Nenhum método cadastrado.</p>
          ) : (
            methods.map((method) => (
              <div
                key={method.id}
                className="infernus-inner-panel flex items-center justify-between rounded-xl p-4"
              >
                <span className="text-sm font-semibold uppercase text-[#ff7e00]">{method.type}</span>
                <span className="text-xs text-[#cee7f3]">
                  {method.pix_key || `${method.provider || ''} ****${method.last4 || ''}`}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
