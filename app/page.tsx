'use client';

import React, { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Search, Award } from 'lucide-react';
import { CATEGORIES } from '@/lib/data';
import { Sidebar, Header } from '@/components/AppLayout';
import { SkillCard, MySkillsView, HistoryView, OnboardingView } from '@/components/AppViews';
import { ProfileView, MembersView, RequestsView, IncomingRequestsView } from '@/components/AppExtras';
import { ChatOverlay, ExchangeModal } from '@/components/AppModals';
import { SuccessOverlay, QuickStats, StudentProfileOverlay } from '@/components/Misc';
import {
  completeOnboarding,
  createExchangeRequest,
  createSkill,
  fetchHistory,
  fetchIncomingRequests,
  fetchOutgoingRequests,
  fetchProfiles,
  fetchSkills,
  fetchUserRelatedRequests,
  handleIncomingRequest,
  removeSkill,
  updateProfile,
} from '@/lib/supabase-data';
import { getSupabaseClient } from '@/lib/supabase';
import type { CreditTransaction, ExchangeRequest, Skill, UserProfile } from '@/lib/types';

export default function TimeDeTrocaApp() {
  const [activeTab, setActiveTab] = useState('Início');
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
  const [activeUserId, setActiveUserId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const user = useMemo(
    () => profiles.find((profile) => profile.id === activeUserId) ?? null,
    [profiles, activeUserId],
  );

  const profileById = useMemo(
    () => Object.fromEntries(profiles.map((profile) => [profile.id, profile])),
    [profiles],
  );
  const skillById = useMemo(() => Object.fromEntries(skills.map((skill) => [skill.id, skill])), [skills]);
  const requestById = useMemo(
    () => Object.fromEntries(relatedRequests.map((request) => [request.id, request])),
    [relatedRequests],
  );

  const skillCards = useMemo(
    () =>
      skills
        .map((skill) => {
          const owner = profileById[skill.owner_profile_id];
          return {
            ...skill,
            image: skill.image_url,
            student: owner?.name ?? 'Membro',
            owner,
          };
        })
        .filter((skill) => Boolean(skill.owner)),
    [skills, profileById],
  );

  const filteredSkills = useMemo(
    () => skillCards.filter((skill) => filter === 'Tudo' || skill.category === filter),
    [skillCards, filter],
  );

  const mySkills = useMemo(
    () => skillCards.filter((skill) => skill.owner_profile_id === user?.id),
    [skillCards, user?.id],
  );

  const outgoingRequestCards = useMemo(
    () =>
      requests.map((request) => {
        const skill = skillById[request.skill_id];
        const provider = profileById[request.provider_profile_id];
        return {
          id: request.id,
          title: skill?.title ?? 'Habilidade removida',
          student: provider?.name ?? 'Membro',
          image: skill?.image_url ?? 'https://picsum.photos/seed/request/200/200',
          status: request.status,
        };
      }),
    [requests, skillById, profileById],
  );

  const incomingRequestCards = useMemo(
    () =>
      incomingRequests.map((request) => {
        const skill = skillById[request.skill_id];
        const requester = profileById[request.requester_profile_id];
        return {
          id: request.id,
          from: requester?.name ?? 'Membro',
          title: skill?.title ?? 'Habilidade',
          fromAvatar: requester?.avatar ?? 'https://picsum.photos/seed/incoming/200/200',
          credits: skill?.credits ?? 1,
        };
      }),
    [incomingRequests, skillById, profileById],
  );

  const historyCards = useMemo(
    () =>
      history.map((entry) => {
        const relatedRequest = entry.reference_exchange_id ? requestById[entry.reference_exchange_id] : null;
        const relatedSkill = relatedRequest ? skillById[relatedRequest.skill_id] : null;
        const counterpartId = relatedRequest
          ? relatedRequest.requester_profile_id === user?.id
            ? relatedRequest.provider_profile_id
            : relatedRequest.requester_profile_id
          : null;
        const counterpart = counterpartId ? profileById[counterpartId] : null;

        return {
          id: entry.id,
          title: relatedSkill?.title ?? entry.note ?? 'Movimentação de créditos',
          student: counterpart?.name ?? 'Sistema',
          type: entry.amount > 0 ? 'earned' : 'spent',
        };
      }),
    [history, requestById, skillById, profileById, user?.id],
  );

  const loadData = useCallback(
    async (requestedUserId?: string) => {
      setIsLoading(true);
      setError(null);
      try {
        const [dbProfiles, dbSkills] = await Promise.all([fetchProfiles(), fetchSkills()]);
        const nextUserId = requestedUserId ?? activeUserId ?? dbProfiles[0]?.id ?? null;

        setProfiles(dbProfiles);
        setSkills(dbSkills);
        setActiveUserId(nextUserId);

        if (!nextUserId) {
          setRequests([]);
          setIncomingRequests([]);
          setHistory([]);
          setRelatedRequests([]);
          return;
        }

        const [outgoing, incoming, historyEntries, related] = await Promise.all([
          fetchOutgoingRequests(nextUserId),
          fetchIncomingRequests(nextUserId),
          fetchHistory(nextUserId),
          fetchUserRelatedRequests(nextUserId),
        ]);

        setRequests(outgoing);
        setIncomingRequests(incoming);
        setHistory(historyEntries);
        setRelatedRequests(related);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Falha ao carregar dados do Supabase.');
      } finally {
        setIsLoading(false);
      }
    },
    [activeUserId],
  );

  useEffect(() => {
    // Initial bootstrap of app state from Supabase.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData]);

  const handleExchange = async () => {
    if (!user || !exchanging) return;
    try {
      await createExchangeRequest(user, exchanging as Skill);
      setSuccess(true);
      await loadData(user.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível solicitar a troca.');
    }
  };

  const handleOnboardingFinish = async (data: any) => {
    if (!user) return;
    try {
      await completeOnboarding(user, data);
      setActiveTab('Início');
      await loadData(user.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Falha ao concluir cadastro.');
    }
  };

  const handleIncomingAction = async (id: number, status: string) => {
    if (!user) return;
    const selectedRequest = incomingRequests.find((request) => request.id === id);
    if (!selectedRequest) return;
    const requestSkill = skillById[selectedRequest.skill_id];
    try {
      await handleIncomingRequest(
        selectedRequest,
        status as 'pending' | 'accepted' | 'declined',
        user,
        requestSkill?.credits ?? 1,
      );
      await loadData(user.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível processar a solicitação.');
    }
  };

  const handleSwitchUser = async (profileId: string) => {
    setActiveUserId(profileId);
    setSelectedStudent(null);
    setExchanging(null);
    await loadData(profileId);
    setActiveTab('Início');
  };

  const handleProfileUpdate = async (payload: any) => {
    if (!user) return;
    try {
      await updateProfile(user.id, payload);
      await loadData(user.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível salvar o perfil.');
    }
  };

  const handleSkillPublish = async (payload: { title: string; category: string; description: string }) => {
    if (!user) return;
    try {
      await createSkill(user.id, { ...payload, credits: 1 });
      await loadData(user.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível publicar a habilidade.');
    }
  };

  const handleSkillDelete = async (skillId: number) => {
    if (!user) return;
    try {
      await removeSkill(skillId, user.id);
      await loadData(user.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Não foi possível remover a habilidade.');
    }
  };

  if (!isMounted) return null;

  if (!getSupabaseClient()) {
    return (
      <div className="min-h-screen bg-bg-main p-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-900">
          <h1 className="text-xl font-black mb-2">Configuração necessária</h1>
          <p>
            Defina <code>NEXT_PUBLIC_SUPABASE_URL</code> e <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> no arquivo{' '}
            <code>.env.local</code> para habilitar a integração com Supabase.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main">
        <p className="text-text-muted">Carregando dados do Supabase...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-main">
        <p className="text-text-muted">Nenhum perfil encontrado no banco.</p>
      </div>
    );
  }

  return (
    <div className="flex bg-bg-main min-h-screen font-sans text-text-main selection:bg-primary/10">
      <Sidebar
        activeTab={activeTab}
        user={user}
        users={profiles}
        onTabChange={setActiveTab}
        onSwitchUser={handleSwitchUser}
      />
      
      <main className="flex-1 p-4 md:p-12 overflow-y-auto max-h-screen custom-scrollbar">
        <Header user={user} credits={user.credits} onOpenChat={setActiveChat} />

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {activeTab === 'Início' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl font-black mb-2 tracking-tight">O que você quer aprender hoje?</h1>
            <p className="text-text-muted mb-8 text-lg font-medium">Troque suas habilidades e ajude um colega.</p>
            <QuickStats />
            <div className="flex items-center gap-4 mb-4"><Search className="w-5 h-5 text-text-muted" /><span className="text-sm font-bold text-text-muted uppercase">Destaques</span></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skillCards.slice(0, 3).map(s => <SkillCard key={s.id} skill={s} onExchange={setExchanging} onOpenChat={setActiveChat} onSelectStudent={setSelectedStudent} />)}
            </div>
            {!user.onboarded && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-12 bg-indigo-600 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl">
                <div className="bg-white/20 p-6 rounded-3xl"><Award className="w-12 h-12" /></div>
                <div className="flex-1"><h3 className="text-2xl font-black mb-2 uppercase">Ganhe seu 1º Crédito!</h3><p className="opacity-80 font-medium">Complete seu cadastro para começar a aprender agora mesmo.</p></div>
                <button onClick={() => setActiveTab('Cadastro')} className="bg-white text-indigo-600 font-black px-10 py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest text-sm">Finalizar Cadastro</button>
              </motion.div>
            )}
          </div>
        )}

        {activeTab === 'Habilidades Disponíveis' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <h2 className="text-3xl font-black">Habilidades</h2>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setFilter(c)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter === c ? 'bg-primary text-white shadow-lg' : 'bg-surface border border-border-main text-text-muted hover:border-primary/40'}`}>{c}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSkills.map(s => <SkillCard key={s.id} skill={s} onExchange={setExchanging} onOpenChat={setActiveChat} onSelectStudent={setSelectedStudent} />)}
            </div>
          </div>
        )}

        {activeTab === 'Membros' && <MembersView members={profiles} onSelectMember={setSelectedStudent} />}
        {activeTab === 'Solicitações' && <IncomingRequestsView requests={incomingRequestCards} onAction={handleIncomingAction} />}
        {activeTab === 'Meus Pedidos' && <RequestsView requests={outgoingRequestCards} />}
        {activeTab === 'Histórico' && <HistoryView history={historyCards} />}
        {activeTab === 'Minhas Habilidades' && <MySkillsView mySkills={mySkills} onPublish={handleSkillPublish} onDelete={handleSkillDelete} />}
        {activeTab === 'Meu Perfil' && <ProfileView user={user} onUpdate={handleProfileUpdate} />}
        {activeTab === 'Cadastro' && <OnboardingView currentData={user} onFinish={handleOnboardingFinish} />}
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
