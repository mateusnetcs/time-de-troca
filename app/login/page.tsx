'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authenticateAppUser, SESSION_PROFILE_KEY, SESSION_USERNAME_KEY } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';
import type { Plan, ProfileRole } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [course, setCourse] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [role, setRole] = useState<ProfileRole>('aluno');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const selectedPlan = useMemo(() => plans.find((plan) => plan.id === selectedPlanId) ?? null, [plans, selectedPlanId]);

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return;
    }

    let active = true;
    const loadPlans = async () => {
      const { data, error: plansError } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('price_cents', { ascending: true });

      if (plansError || !active) {
        return;
      }

      const dbPlans = (data ?? []) as Plan[];
      setPlans(dbPlans);
      if (dbPlans.length > 0) {
        setSelectedPlanId((prev) => prev ?? dbPlans[0].id);
      }
    };

    void loadPlans();
    return () => {
      active = false;
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const session = await authenticateAppUser(username, password);
      if (!session) {
        setError('Usuário ou senha inválidos.');
        return;
      }
      localStorage.setItem(SESSION_PROFILE_KEY, session.profile_id);
      localStorage.setItem(SESSION_USERNAME_KEY, session.username);
      router.push('/sistema');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao efetuar login.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('As senhas não conferem.');
      return;
    }
    if (!selectedPlanId) {
      setError('Selecione um plano para concluir o cadastro.');
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      setError('Supabase não configurado.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: registerError } = await supabase.rpc('register_app_user', {
        p_name: name,
        p_email: email,
        p_course: course,
        p_whatsapp: whatsapp,
        p_password: password,
        p_role: role,
        p_plan_id: selectedPlanId,
      });

      if (registerError) {
        const needsLegacyFallback =
          registerError.message.includes('p_plan_id')
          || registerError.message.includes('function public.register_app_user');

        if (!needsLegacyFallback) {
          throw registerError;
        }

        const { data: legacyData, error: legacyError } = await supabase.rpc('register_app_user', {
          p_name: name,
          p_email: email,
          p_course: course,
          p_whatsapp: whatsapp,
          p_password: password,
          p_role: role,
        });

        if (legacyError) {
          throw legacyError;
        }

        const legacyCreated = Array.isArray(legacyData) ? legacyData[0] : null;
        if (!legacyCreated) {
          setError('Não foi possível concluir o cadastro.');
          return;
        }

        const hasSubscription = await supabase
          .from('subscriptions')
          .select('id')
          .eq('profile_id', legacyCreated.profile_id)
          .limit(1);

        if (!hasSubscription.error && (hasSubscription.data?.length ?? 0) === 0 && selectedPlan) {
          const endsAt = new Date();
          if (selectedPlan.billing_cycle === 'monthly') {
            endsAt.setMonth(endsAt.getMonth() + 1);
          } else if (selectedPlan.billing_cycle === 'quarterly') {
            endsAt.setMonth(endsAt.getMonth() + 3);
          } else {
            endsAt.setFullYear(endsAt.getFullYear() + 1);
          }

          const { data: sub, error: subError } = await supabase
            .from('subscriptions')
            .insert({
              profile_id: legacyCreated.profile_id,
              plan_id: selectedPlan.id,
              status: selectedPlan.price_cents === 0 ? 'trialing' : 'active',
              starts_at: new Date().toISOString(),
              ends_at: selectedPlan.price_cents === 0 ? null : endsAt.toISOString(),
              trial_ends_at: selectedPlan.price_cents === 0 ? endsAt.toISOString() : null,
            })
            .select('id')
            .single();

          if (subError) {
            throw subError;
          }

          if (selectedPlan.price_cents > 0) {
            const { error: payError } = await supabase.from('payments').insert({
              profile_id: legacyCreated.profile_id,
              subscription_id: sub.id,
              amount_cents: selectedPlan.price_cents,
              status: 'paid',
              method_type: 'pix',
              paid_at: new Date().toISOString(),
            });
            if (payError) throw payError;
          }
        }

        await supabase
          .from('profiles')
          .update({ credits: 3 })
          .eq('id', legacyCreated.profile_id)
          .lt('credits', 1);

        localStorage.setItem(SESSION_PROFILE_KEY, legacyCreated.profile_id);
        localStorage.setItem(SESSION_USERNAME_KEY, legacyCreated.username);
        router.push('/sistema');
        return;
      }

      const created = Array.isArray(data) ? data[0] : null;
      if (!created) {
        setError('Não foi possível concluir o cadastro.');
        return;
      }

      localStorage.setItem(SESSION_PROFILE_KEY, created.profile_id);
      localStorage.setItem(SESSION_USERNAME_KEY, created.username);
      router.push('/sistema');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao cadastrar usuário.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg-main flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-surface border border-border-main rounded-3xl p-8">
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 rounded-xl py-2 text-sm font-bold ${mode === 'login' ? 'bg-primary text-white' : 'bg-bg-main border border-border-main text-text-muted'}`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 rounded-xl py-2 text-sm font-bold ${mode === 'register' ? 'bg-primary text-white' : 'bg-bg-main border border-border-main text-text-muted'}`}
          >
            Cadastrar
          </button>
        </div>

        <h1 className="text-3xl font-black">{mode === 'login' ? 'Entrar no SkillNet' : 'Criar conta'}</h1>
        <p className="text-text-muted mt-2 text-sm">
          {mode === 'login' ? 'Use seu e-mail cadastrado e a senha.' : 'Preencha os dados para criar seu acesso.'}
        </p>

        <form className="space-y-4 mt-8" onSubmit={mode === 'login' ? handleLogin : handleRegister}>
          {mode === 'register' && (
            <>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome"
                className="w-full bg-bg-main border border-border-main rounded-xl p-3 text-sm"
                required
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-mail"
                className="w-full bg-bg-main border border-border-main rounded-xl p-3 text-sm"
                required
              />
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="Curso"
                className="w-full bg-bg-main border border-border-main rounded-xl p-3 text-sm"
                required
              />
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="WhatsApp"
                className="w-full bg-bg-main border border-border-main rounded-xl p-3 text-sm"
                required
              />
              <div className="rounded-xl border border-border-main bg-bg-main p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Você é</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('aluno')}
                    className={`rounded-lg px-3 py-2 text-sm font-bold transition ${role === 'aluno' ? 'bg-primary text-white' : 'border border-border-main text-text-muted'}`}
                  >
                    Aluno
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('tutor')}
                    className={`rounded-lg px-3 py-2 text-sm font-bold transition ${role === 'tutor' ? 'bg-primary text-white' : 'border border-border-main text-text-muted'}`}
                  >
                    Instrutor
                  </button>
                </div>
              </div>
              <div className="rounded-xl border border-border-main bg-bg-main p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Escolha seu plano</p>
                {plans.length === 0 ? (
                  <p className="text-xs text-text-muted">Nenhum plano carregado no momento.</p>
                ) : (
                  <div className="space-y-2">
                    {plans.map((plan) => {
                      const selected = selectedPlanId === plan.id;
                      return (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`w-full rounded-lg border p-3 text-left transition ${selected ? 'border-primary bg-primary/5' : 'border-border-main'}`}
                        >
                          <p className="text-sm font-bold text-text-main">{plan.name}</p>
                          <p className="text-xs text-text-muted">{plan.description}</p>
                          <p className="mt-1 text-xs font-semibold text-primary">
                            {plan.price_cents === 0 ? 'Gratuito' : `R$ ${(plan.price_cents / 100).toFixed(2)} / ${plan.billing_cycle}`}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {mode === 'login' && (
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="E-mail de login"
              className="w-full bg-bg-main border border-border-main rounded-xl p-3 text-sm"
              required
            />
          )}

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="w-full bg-bg-main border border-border-main rounded-xl p-3 text-sm"
            required
          />

          {mode === 'register' && (
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar senha"
              className="w-full bg-bg-main border border-border-main rounded-xl p-3 text-sm"
              required
            />
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white rounded-xl py-3 font-bold disabled:opacity-70"
          >
            {loading ? (mode === 'login' ? 'Entrando...' : 'Cadastrando...') : mode === 'login' ? 'Entrar' : 'Cadastrar e entrar'}
          </button>
        </form>

        <Link href="/" className="block text-center text-sm text-text-muted mt-6">
          Voltar para a landing page
        </Link>
      </div>
    </main>
  );
}
