'use client';

import React, { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'motion/react';
import { Search, Award, LayoutGrid, UserPlus } from 'lucide-react';
import { CATEGORIES } from '@/lib/data';
import { SistemaNavbar, PlanBanner } from '@/components/AppLayout';
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
import { ChatOverlay, ExchangeModal, ProfileOnboardingModal } from '@/components/AppModals';
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
import {
  type ActiveRole,
  clearActiveRole,
  defaultTabForRole,
  isTabAllowedForRole,
  persistActiveRole,
  resolveActiveRole,
} from '@/lib/role-session';
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
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<ActiveRole>('aluno');
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
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setActiveRole(resolveActiveRole(user.role, user.id));
  }, [user?.id, user?.role]);

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

  const handleRoleChange = (role: ActiveRole) => {
    if (!user) return;
    persistActiveRole(user.id, role);
    setActiveRole(role);
    if (!isTabAllowedForRole(activeTab, role)) {
      setActiveTab(defaultTabForRole(role));
    }
  };

  const handleExchange = async () => {
    if (!user || !exchanging) return;
    if (activeRole !== 'aluno') {
      setError('Alterne para o modo Aluno para solicitar habilidades.');
      return;
    }
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
    if (activeUserId) clearActiveRole(activeUserId);
    localStorage.removeItem(SESSION_PROFILE_KEY);
    localStorage.removeItem(SESSION_USERNAME_KEY);
    router.push('/login');
  };

  if (!isMounted || (isLoading && !user)) {
    return (
      <div className="sistema-shell flex min-h-screen items-center justify-center">
        <div className="infernus-bg" />
        <p className="relative z-10 text-accent">Carregando sistema...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="sistema-shell flex min-h-screen items-center justify-center">
        <div className="infernus-bg" />
        <p className="relative z-10 text-text-muted">Usuário não encontrado.</p>
      </div>
    );
  }

  const daysLeft = currentSubscription
    ? Math.max(
        0,
        Math.ceil(
          ((currentSubscription.status === 'trialing'
            ? new Date(currentSubscription.trial_ends_at ?? nowTs).getTime()
            : new Date(currentSubscription.ends_at ?? nowTs).getTime()) - nowTs)
          / (1000 * 60 * 60 * 24),
        ),
      )
    : 0;

  return (
    <div className={`sistema-shell sistema-role-${activeRole} relative min-h-screen font-sans`} data-active-role={activeRole}>
      <div className="infernus-bg" />
      <div className="infernus-grid" />

      <SistemaNavbar
        activeTab={activeTab}
        user={user}
        activeRole={activeRole}
        planActive={isCurrentPlanActive}
        onTabChange={setActiveTab}
        onRoleChange={handleRoleChange}
        onLogout={handleLogout}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      <main className="custom-scrollbar relative z-10 mx-auto min-h-screen max-w-[1400px] px-4 pb-16 pt-6 md:px-8">
        {currentSubscription && currentPlan && (
          <PlanBanner
            planName={currentPlan.name}
            isTrialing={currentSubscription.status === 'trialing'}
            endLabel={
              currentSubscription.status === 'trialing'
                ? `Período grátis até ${currentSubscription.trial_ends_at ? new Date(currentSubscription.trial_ends_at).toLocaleDateString() : 'data não informada'}`
                : `Renovação prevista para ${currentSubscription.ends_at ? new Date(currentSubscription.ends_at).toLocaleDateString() : 'sem data definida'}`
            }
            daysLeft={daysLeft}
          />
        )}

        {error && (
          <div className="mb-6 rounded-xl border border-accent/50 bg-black/60 px-4 py-3 text-sm text-accent">
            {error}
          </div>
        )}

        {activeTab === 'Início' && (
          <div className="animate-in fade-in duration-700">
            <section className="mb-12 flex flex-col items-center px-2 text-center md:px-8">
              <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/50 bg-black/60 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                ⚡ Seu pacto com o aprendizado
              </p>
              <h1 className="font-outfit infernus-title-glow mb-4 max-w-4xl text-4xl font-black uppercase leading-none tracking-tight text-white md:text-6xl lg:text-7xl">
                SkillNet
              </h1>
              <p className="mb-2 max-w-xl text-lg text-text-muted md:text-xl">
                {activeRole === 'aluno'
                  ? 'O que você quer aprender hoje?'
                  : 'O que você quer ensinar hoje?'}
              </p>
              <p className="mb-10 max-w-lg text-sm text-primary-light">
                {activeRole === 'aluno'
                  ? 'Troque suas habilidades e ajude um colega.'
                  : 'Gerencie suas habilidades e atenda solicitações dos alunos.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                {activeRole === 'aluno' ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab('Habilidades Disponíveis')}
                    className="btn-infernus-primary flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Ver Habilidades
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab('Minhas Habilidades')}
                    className="btn-infernus-primary flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold"
                  >
                    <LayoutGrid className="h-4 w-4" />
                    Minhas Habilidades
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    activeRole === 'aluno'
                      ? setActiveTab('Painel do Aluno')
                      : setActiveTab('Painel do Tutor')
                  }
                  className="btn-infernus-outline flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold"
                >
                  <UserPlus className="h-4 w-4" />
                  {activeRole === 'aluno' ? 'Painel do Aluno' : 'Painel do Instrutor'}
                </button>
                <button
                  type="button"
                  onClick={() => (user.onboarded ? setProfileModalOpen(true) : setActiveTab('Cadastro'))}
                  className="btn-infernus-outline flex items-center gap-2 rounded-full px-8 py-3.5 text-sm font-bold"
                >
                  <UserPlus className="h-4 w-4" />
                  {user.onboarded ? 'Meu Perfil' : 'Completar Cadastro'}
                </button>
              </div>
            </section>

            <QuickStats />

            {activeRole === 'aluno' ? (
              <>
                <section className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                  <Search className="h-5 w-5 text-accent" />
                  <span className="text-sm font-bold uppercase tracking-[0.25em] text-white">Destaques</span>
                </section>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {availableSkillCards.slice(0, 3).map((s) => (
                    <SkillCard
                      key={s.id}
                      skill={s}
                      onExchange={setExchanging}
                      onOpenChat={setActiveChat}
                      onSelectStudent={setSelectedStudent}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <section className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                  <Search className="h-5 w-5 text-accent" />
                  <span className="text-sm font-bold uppercase tracking-[0.25em] text-white">Suas habilidades publicadas</span>
                </section>
                {mySkills.length === 0 ? (
                  <p className="text-center text-[#9ca3af]">Publique sua primeira habilidade em Minhas Habilidades.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {mySkills.slice(0, 3).map((s) => (
                      <SkillCard
                        key={s.id}
                        skill={s}
                        onExchange={() => setError('No modo Instrutor, use Solicitações para ver pedidos dos alunos.')}
                        onOpenChat={setActiveChat}
                        onSelectStudent={setSelectedStudent}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'Habilidades Disponíveis' && activeRole === 'aluno' && (
          <div className="space-y-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <h2 className="font-outfit text-3xl font-black uppercase text-white infernus-title-glow">Habilidades</h2>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setFilter(c)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                      filter === c ? 'btn-infernus-primary' : 'btn-infernus-outline'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredSkills.map(s => (
                <SkillCard key={s.id} skill={s} onExchange={setExchanging} onOpenChat={setActiveChat} onSelectStudent={setSelectedStudent} />
              ))}
            </div>
          </div>
        )}
        {activeTab !== 'Início' && activeTab !== 'Habilidades Disponíveis' && (
          <div className="infernus-card rounded-2xl p-6 md:p-8">
            {activeTab === 'Painel do Aluno' && activeRole === 'aluno' && (
              <StudentDashboardView stats={studentStats} trialEndsAt={user.trial_ends_at} requests={studentRequestCards} />
            )}
            {activeTab === 'Painel do Tutor' && activeRole === 'tutor' && (
              <TutorDashboardView
                services={tutorServices}
                requests={tutorRequestCards}
                onAction={(id, status) => updateServiceRequestStatus(id, status).then(loadData)}
              />
            )}
            {activeTab === 'Planos' && <PlansView plans={plans} onSubscribe={(planId) => { const plan = plans.find((item) => item.id === planId); if (!plan) return Promise.resolve(); return subscribeToPlan(user.id, plan, paymentMethods[0]?.type ?? 'pix').then(loadData); }} />}
            {activeTab === 'Pagamentos' && <PaymentMethodsView methods={paymentMethods} onSave={(payload) => savePaymentMethod(user.id, payload).then(loadData)} />}
            {activeTab === 'Membros' && <MembersView members={profiles} onSelectMember={setSelectedStudent} />}
            {activeTab === 'Solicitações' && activeRole === 'tutor' && (
              <IncomingRequestsView
                requests={incomingRequestCards}
                onAction={(id, status) => {
                  const req = incomingRequests.find((r) => r.id === id);
                  if (!req) return Promise.resolve();
                  return handleIncomingRequest(req, status as any).then(loadData);
                }}
              />
            )}
            {activeTab === 'Meus Pedidos' && activeRole === 'aluno' && <RequestsView requests={outgoingRequestCards} />}
            {activeTab === 'Histórico' && <HistoryView history={historyCards} />}
            {activeTab === 'Minhas Habilidades' && activeRole === 'tutor' && (
              <MySkillsView
                mySkills={mySkills}
                onPublish={(payload) => createSkill(user.id, { ...payload, credits: 1 }).then(loadData)}
                onDelete={(id) => removeSkill(id, user.id).then(loadData)}
              />
            )}
            {activeTab === 'Meu Perfil' && <ProfileView user={user} onUpdate={(payload) => updateProfile(user.id, payload).then(loadData)} />}
            {activeTab === 'Cadastro' && (
              <div className="flex justify-center py-2">
                <OnboardingView
                  currentData={user}
                  onFinish={(data) => completeOnboarding(user, data).then(loadData)}
                />
              </div>
            )}
          </div>
        )}
      </main>

      <AnimatePresence>
        {exchanging && <ExchangeModal isOpen={!!exchanging} onClose={() => setExchanging(null)} skill={exchanging} onConfirm={handleExchange} />}
        {success && <SuccessOverlay isOpen={success} onClose={() => setSuccess(false)} />}
        {activeChat && <ChatOverlay isOpen={!!activeChat} onClose={() => setActiveChat(null)} targetStudent={activeChat} />}
        {selectedStudent && <StudentProfileOverlay profile={selectedStudent} onClose={() => setSelectedStudent(null)} />}
        {profileModalOpen && (
          <ProfileOnboardingModal
            isOpen={profileModalOpen}
            onClose={() => setProfileModalOpen(false)}
            user={user}
            onFinish={(data) => completeOnboarding(user, data).then(loadData)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
