'use client';

import React, { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Search, Award } from 'lucide-react';
import { CATEGORIES } from '@/lib/data';
import { Sidebar, Header } from '@/components/AppLayout';
import {
  SkillCard,
  MySkillsView,
  HistoryView,
  OnboardingView,
  StudentDashboardView,
  TutorDashboardView,
  PlansView,
  PaymentMethodsView,
} from '@/components/AppViews';
import { ProfileView, MembersView, RequestsView, IncomingRequestsView } from '@/components/AppExtras';
import { ChatOverlay, ExchangeModal } from '@/components/AppModals';
import { SuccessOverlay, QuickStats, StudentProfileOverlay } from '@/components/Misc';
import {
  completeOnboarding,
  createServiceRequest,
  createExchangeRequest,
  createSkill,
  fetchHistory,
  fetchIncomingRequests,
  fetchOutgoingRequests,
  fetchPaymentMethods,
  fetchPlans,
  fetchProfiles,
  fetchServiceRequestsAsStudent,
  fetchServiceRequestsAsTutor,
  fetchSkills,
  fetchSubscriptions,
  fetchUserRelatedRequests,
  handleIncomingRequest,
  removeSkill,
  savePaymentMethod,
  subscribeToPlan,
  updateProfile,
  updateServiceRequestStatus,
} from '@/lib/supabase-data';
import { SESSION_PROFILE_KEY, SESSION_USERNAME_KEY } from '@/lib/auth';
import type { CreditTransaction, ExchangeRequest, PaymentMethod, Plan, ServiceRequest, Skill, Subscription, UserProfile } from '@/lib/types';

export default function SistemaPage() {
  const router = useRouter();
  const isMounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const [activeTab, setActiveTab] = useState('Início');
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [filter, setFilter] = useState('Tudo');
  const [exchanging, setExchanging] = useState<any>(null);
  const [success, setSuccess] = useState(false);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [requests, setRequests] = useState<ExchangeRequest[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<ExchangeRequest[]>([]);
  const [history, setHistory] = useState<CreditTransaction[]>([]);
  const [relatedRequests, setRelatedRequests] = useState<ExchangeRequest[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [studentServiceRequests, setStudentServiceRequests] = useState<ServiceRequest[]>([]);
  const [tutorServiceRequests, setTutorServiceRequests] = useState<ServiceRequest[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nowTs, setNowTs] = useState(0);

  const user = useMemo(() => profiles.find((profile) => profile.id === activeUserId) ?? null, [profiles, activeUserId]);
  const profileById = useMemo(() => Object.fromEntries(profiles.map((profile) => [profile.id, profile])), [profiles]);
  const skillById = useMemo(() => Object.fromEntries(skills.map((skill) => [skill.id, skill])), [skills]);
  const requestById = useMemo(() => Object.fromEntries(relatedRequests.map((request) => [request.id, request])), [relatedRequests]);

  useEffect(() => {
    const profileId = localStorage.getItem(SESSION_PROFILE_KEY);
    if (!profileId) {
      router.replace('/login');
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveUserId(profileId);
  }, [router]);

  const loadData = useCallback(async () => {
    if (!activeUserId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [dbProfiles, dbSkills, dbPlans] = await Promise.all([fetchProfiles(), fetchSkills(), fetchPlans()]);
      const [outgoing, incoming, historyEntries, related, dbSubscriptions, dbPaymentMethods, studentRequests, tutorRequests] = await Promise.all([
        fetchOutgoingRequests(activeUserId),
        fetchIncomingRequests(activeUserId),
        fetchHistory(activeUserId),
        fetchUserRelatedRequests(activeUserId),
        fetchSubscriptions(activeUserId),
        fetchPaymentMethods(activeUserId),
        fetchServiceRequestsAsStudent(activeUserId),
        fetchServiceRequestsAsTutor(activeUserId),
      ]);

      setProfiles(dbProfiles);
      setSkills(dbSkills);
      setPlans(dbPlans);
      setRequests(outgoing);
      setIncomingRequests(incoming);
      setHistory(historyEntries);
      setRelatedRequests(related);
      setSubscriptions(dbSubscriptions);
      setPaymentMethods(dbPaymentMethods);
      setStudentServiceRequests(studentRequests);
      setTutorServiceRequests(tutorRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar dados do Supabase.');
    } finally {
      setIsLoading(false);
    }
  }, [activeUserId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const updateNow = () => setNowTs(Date.now());
    updateNow();
    const timer = setInterval(updateNow, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const skillCards = useMemo(() => skills.map((skill) => ({ ...skill, student: profileById[skill.owner_profile_id]?.name ?? 'Membro', owner: profileById[skill.owner_profile_id] })).filter((skill) => Boolean(skill.owner)), [skills, profileById]);
  const availableSkillCards = useMemo(() => skillCards.filter((skill) => skill.owner_profile_id !== user?.id), [skillCards, user?.id]);
  const filteredSkills = useMemo(() => availableSkillCards.filter((skill) => filter === 'Tudo' || skill.category === filter), [availableSkillCards, filter]);
  const mySkills = useMemo(() => skillCards.filter((skill) => skill.owner_profile_id === user?.id), [skillCards, user?.id]);

  const outgoingRequestCards = useMemo(() => requests.map((request) => ({ id: request.id, title: skillById[request.skill_id]?.title ?? 'Habilidade', student: profileById[request.provider_profile_id]?.name ?? 'Membro', image: skillById[request.skill_id]?.image_url ?? 'https://picsum.photos/seed/request/200/200', status: request.status })), [requests, skillById, profileById]);
  const incomingRequestCards = useMemo(() => incomingRequests.map((request) => ({ id: request.id, from: profileById[request.requester_profile_id]?.name ?? 'Membro', title: skillById[request.skill_id]?.title ?? 'Habilidade', fromAvatar: profileById[request.requester_profile_id]?.avatar ?? 'https://picsum.photos/seed/incoming/200/200' })), [incomingRequests, profileById, skillById]);
  const historyCards = useMemo(() => history.map((entry) => {
    const related = entry.reference_exchange_id ? requestById[entry.reference_exchange_id] : null;
    const counterpartId = related ? (related.requester_profile_id === user?.id ? related.provider_profile_id : related.requester_profile_id) : null;
    return { id: entry.id, title: related ? (skillById[related.skill_id]?.title ?? entry.note ?? 'Movimentação') : (entry.note ?? 'Movimentação'), student: counterpartId ? profileById[counterpartId]?.name ?? 'Sistema' : 'Sistema', type: entry.amount > 0 ? 'earned' : 'spent' };
  }), [history, requestById, skillById, profileById, user?.id]);

  const studentRequestCards = useMemo(() => studentServiceRequests.map((req) => ({ id: req.id, title: skillById[req.skill_id]?.title ?? 'Serviço', tutor: profileById[req.tutor_profile_id]?.name ?? 'Tutor', status: req.status })), [studentServiceRequests, skillById, profileById]);
  const tutorRequestCards = useMemo(() => tutorServiceRequests.map((req) => ({ id: req.id, student: profileById[req.student_profile_id]?.name ?? 'Aluno', title: skillById[req.skill_id]?.title ?? 'Serviço', status: req.status })), [tutorServiceRequests, skillById, profileById]);

  const studentStats = useMemo(() => ({ total: studentServiceRequests.length, inProgress: studentServiceRequests.filter((req) => ['pending', 'accepted', 'scheduled'].includes(req.status)).length, completed: studentServiceRequests.filter((req) => req.status === 'completed').length }), [studentServiceRequests]);
  const tutorServices = useMemo(() => mySkills.map((service) => ({ id: service.id, title: service.title, category: service.category, whatsappUrl: `https://wa.me/${(user?.phone_whatsapp || user?.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${user?.name}, tenho interesse no serviço ${service.title}.`)}` })), [mySkills, user?.phone_whatsapp, user?.phone, user?.name]);
  const currentSubscription = useMemo(() => subscriptions[0] ?? null, [subscriptions]);
  const currentPlan = useMemo(() => {
    if (!currentSubscription) return null;
    return plans.find((plan) => plan.id === currentSubscription.plan_id) ?? null;
  }, [plans, currentSubscription]);
  const isCurrentPlanActive = useMemo(() => {
    if (!currentSubscription) return false;
    if (currentSubscription.status === 'trialing') {
      const trialEndsAt = currentSubscription.trial_ends_at;
      return trialEndsAt ? new Date(trialEndsAt).getTime() >= nowTs : false;
    }
    if (currentSubscription.status === 'active') {
      const endsAt = currentSubscription.ends_at;
      return !endsAt || new Date(endsAt).getTime() >= nowTs;
    }
    return false;
  }, [currentSubscription, nowTs]);

  const handleExchange = async () => {
    if (!user || !exchanging) return;
    try {
      setError(null);
      await createExchangeRequest(user, exchanging as Skill);
      await createServiceRequest(user.id, exchanging as Skill);
      setSuccess(true);
      setExchanging(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível solicitar essa habilidade agora.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_PROFILE_KEY);
    localStorage.removeItem(SESSION_USERNAME_KEY);
    router.push('/login');
  };

  if (!isMounted || (isLoading && !user)) {
    return <div className="min-h-screen flex items-center justify-center bg-bg-main"><p className="text-text-muted">Carregando sistema...</p></div>;
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-bg-main"><p className="text-text-muted">Usuário não encontrado.</p></div>;
  }

  return (
    <div className="flex bg-bg-main min-h-screen font-sans text-text-main selection:bg-primary/10">
      <Sidebar activeTab={activeTab} user={user} onTabChange={setActiveTab} />
      <main className="flex-1 p-4 md:p-12 overflow-y-auto max-h-screen custom-scrollbar">
        {currentSubscription && currentPlan && (
          <div className={`sticky top-2 z-30 mb-6 rounded-2xl border p-4 ${currentSubscription.status === 'trialing' ? 'border-emerald-300 bg-emerald-50' : 'border-primary/30 bg-primary/5'}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-text-main">
                  {currentSubscription.status === 'trialing' ? 'Período de Teste Ativo' : `Plano ${currentPlan.name} Ativo`}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {currentSubscription.status === 'trialing'
                    ? `Período grátis até ${currentSubscription.trial_ends_at ? new Date(currentSubscription.trial_ends_at).toLocaleDateString() : 'data não informada'}`
                    : `Renovação prevista para ${currentSubscription.ends_at ? new Date(currentSubscription.ends_at).toLocaleDateString() : 'sem data definida'}`}
                </p>
              </div>
              <div className="rounded-xl border border-border-main bg-white px-4 py-2 text-center min-w-[92px]">
                <p className="text-3xl leading-none font-black text-primary">
                  {Math.max(
                    0,
                    Math.ceil(
                      ((currentSubscription.status === 'trialing'
                        ? new Date(currentSubscription.trial_ends_at ?? nowTs).getTime()
                        : new Date(currentSubscription.ends_at ?? nowTs).getTime()) - nowTs)
                      / (1000 * 60 * 60 * 24),
                    ),
                  )}
                </p>
                <p className="text-[10px] font-bold uppercase text-text-muted">
                  dias restantes
                </p>
              </div>
            </div>
          </div>
        )}
        <Header
          user={user}
          planActive={isCurrentPlanActive}
          onOpenChat={setActiveChat}
          onLogout={handleLogout}
        />

        {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {activeTab === 'Início' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl font-black mb-2 tracking-tight">O que você quer aprender hoje?</h1>
            <p className="text-text-muted mb-8 text-lg font-medium">Troque suas habilidades e ajude um colega.</p>
            <QuickStats />
            <div className="flex items-center gap-4 mb-4"><Search className="w-5 h-5 text-text-muted" /><span className="text-sm font-bold text-text-muted uppercase">Destaques</span></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableSkillCards.slice(0, 3).map(s => <SkillCard key={s.id} skill={s} onExchange={setExchanging} onOpenChat={setActiveChat} onSelectStudent={setSelectedStudent} />)}
            </div>
            {!user.onboarded && <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-12 bg-indigo-600 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl"><div className="bg-white/20 p-6 rounded-3xl"><Award className="w-12 h-12" /></div><div className="flex-1"><h3 className="text-2xl font-black mb-2 uppercase">Ganhe seu 1º Crédito!</h3><p className="opacity-80 font-medium">Complete seu cadastro para começar a aprender agora mesmo.</p></div><button onClick={() => setActiveTab('Cadastro')} className="bg-white text-indigo-600 font-black px-10 py-5 rounded-2xl">Finalizar Cadastro</button></motion.div>}
          </div>
        )}

        {activeTab === 'Habilidades Disponíveis' && <div className="space-y-8"><div className="flex flex-col md:flex-row md:items-center justify-between gap-6"><h2 className="text-3xl font-black">Habilidades</h2><div className="flex flex-wrap gap-2">{CATEGORIES.map(c => <button key={c} onClick={() => setFilter(c)} className={`px-4 py-1.5 rounded-full text-xs font-bold ${filter === c ? 'bg-primary text-white' : 'bg-surface border border-border-main text-text-muted'}`}>{c}</button>)}</div></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredSkills.map(s => <SkillCard key={s.id} skill={s} onExchange={setExchanging} onOpenChat={setActiveChat} onSelectStudent={setSelectedStudent} />)}</div></div>}
        {activeTab === 'Painel do Aluno' && <StudentDashboardView stats={studentStats} trialEndsAt={user.trial_ends_at} requests={studentRequestCards} />}
        {activeTab === 'Painel do Tutor' && <TutorDashboardView services={tutorServices} requests={tutorRequestCards} onAction={(id, status) => updateServiceRequestStatus(id, status).then(loadData)} />}
        {activeTab === 'Planos' && <PlansView plans={plans} onSubscribe={(planId) => { const plan = plans.find((item) => item.id === planId); if (!plan) return Promise.resolve(); return subscribeToPlan(user.id, plan, paymentMethods[0]?.type ?? 'pix').then(loadData); }} />}
        {activeTab === 'Pagamentos' && <PaymentMethodsView methods={paymentMethods} onSave={(payload) => savePaymentMethod(user.id, payload).then(loadData)} />}
        {activeTab === 'Membros' && <MembersView members={profiles} onSelectMember={setSelectedStudent} />}
        {activeTab === 'Solicitações' && <IncomingRequestsView requests={incomingRequestCards} onAction={(id, status) => { const req = incomingRequests.find((r) => r.id === id); if (!req) return Promise.resolve(); return handleIncomingRequest(req, status as any).then(loadData); }} />}
        {activeTab === 'Meus Pedidos' && <RequestsView requests={outgoingRequestCards} />}
        {activeTab === 'Histórico' && <HistoryView history={historyCards} />}
        {activeTab === 'Minhas Habilidades' && <MySkillsView mySkills={mySkills} onPublish={(payload) => createSkill(user.id, { ...payload, credits: 1 }).then(loadData)} onDelete={(id) => removeSkill(id, user.id).then(loadData)} />}
        {activeTab === 'Meu Perfil' && <ProfileView user={user} onUpdate={(payload) => updateProfile(user.id, payload).then(loadData)} />}
        {activeTab === 'Cadastro' && <OnboardingView currentData={user} onFinish={(data) => completeOnboarding(user, data).then(loadData)} />}
      </main>

      <AnimatePresence>
        {exchanging && <ExchangeModal isOpen={!!exchanging} onClose={() => setExchanging(null)} skill={exchanging} onConfirm={handleExchange} />}
        {success && <SuccessOverlay isOpen={success} onClose={() => setSuccess(false)} />}
        {activeChat && <ChatOverlay isOpen={!!activeChat} onClose={() => setActiveChat(null)} targetStudent={activeChat} />}
        {selectedStudent && <StudentProfileOverlay profile={selectedStudent} onClose={() => setSelectedStudent(null)} />}
      </AnimatePresence>
    </div>
  );
}
