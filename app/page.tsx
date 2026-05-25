import Link from 'next/link';
import { ArrowLeftRight, BookOpen, CreditCard, GraduationCap, Rocket, ShieldCheck, Zap } from 'lucide-react';

const highlights = [
  {
    title: 'Tutores verificados',
    description: 'Perfis avaliados para você aprender com mais confiança.',
    icon: ShieldCheck,
  },
  {
    title: 'Contratação rápida',
    description: 'Solicite um serviço em poucos cliques e acompanhe o status.',
    icon: Zap,
  },
  {
    title: 'Pagamento flexível',
    description: 'PIX, crédito ou débito para facilitar sua assinatura.',
    icon: CreditCard,
  },
];

const plans = [
  {
    name: 'Básico',
    price: 'R$ 19,90',
    cycle: 'mês',
    badge: '7 dias grátis',
    features: ['5 solicitações de serviço por mês', 'Acesso ao chat com tutores', 'Perfil básico', 'Suporte por email'],
    cta: 'Começar Grátis',
  },
  {
    name: 'Premium',
    price: 'R$ 29,90',
    cycle: 'mês',
    badge: 'Recomendado',
    features: [
      '12 solicitações de serviço por mês',
      'Acesso prioritário ao chat',
      'Perfil destacado',
      'Suporte prioritário',
      'Badge de membro premium',
      'Estatísticas detalhadas',
    ],
    cta: 'Assinar Premium',
  },
];

const steps = [
  {
    title: '1. Crie sua conta',
    description: 'Cadastre-se em minutos como aluno, instrutor ou os dois.',
    icon: BookOpen,
  },
  {
    title: '2. Escolha o plano',
    description: 'Ative o teste grátis e evolua para o plano que fizer mais sentido.',
    icon: CreditCard,
  },
  {
    title: '3. Conecte e aprenda',
    description: 'Solicite serviços, converse com tutores e acompanhe resultados.',
    icon: GraduationCap,
  },
];

export default function LandingPage() {
  return (
    <main className="sistema-shell relative min-h-screen overflow-x-hidden">
      <div className="infernus-bg" />
      <div className="infernus-grid" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-10 md:py-14">
        <header className="mb-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="infernus-icon-box flex h-10 w-10 items-center justify-center rounded-lg">
              <ArrowLeftRight className="h-5 w-5 text-[#ff7e00]" />
            </div>
            <h1 className="font-outfit text-2xl font-black tracking-tight text-white md:text-3xl">SKILLNET</h1>
          </div>
          <Link href="/login" className="btn-infernus-primary rounded-full px-6 py-2.5 text-sm font-bold">
            Entrar
          </Link>
        </header>

        <section className="mb-20 grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#ff7e00]/50 bg-black/60 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#ff7e00]">
              <Zap className="h-3.5 w-3.5" />
              Plataforma de conexão acadêmica
            </p>
            <h2 className="font-outfit infernus-title-glow text-4xl font-black leading-tight text-white md:text-5xl lg:text-6xl">
              Aprenda com quem sabe e ensine o que você domina.
            </h2>
            <p className="mt-5 max-w-lg text-lg text-[#9ca3af]">
              Experiência moderna para alunos e instrutores, com assinatura simples, acompanhamento de solicitações e
              suporte contínuo.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="btn-infernus-primary rounded-full px-8 py-3.5 text-sm font-bold">
                Começar agora
              </Link>
              <a href="#planos" className="btn-infernus-outline rounded-full px-8 py-3.5 text-sm font-bold">
                Ver planos
              </a>
            </div>
          </div>

          <div className="infernus-panel p-6 md:p-8">
            <p className="text-sm font-bold text-white">Para alunos e instrutores</p>
            <p className="mb-6 mt-1 text-sm text-[#9ca3af]">Tudo em um único ambiente, com foco em resultado.</p>
            <div className="space-y-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="infernus-inner-panel flex items-start gap-3 rounded-xl p-4"
                >
                  <div className="infernus-icon-box flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                    <item.icon className="h-4 w-4 text-[#ff7e00]" />
                  </div>
                  <div>
                    <p className="font-bold text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-[#9ca3af]">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-20">
          <h3 className="font-outfit mb-8 text-2xl font-black uppercase tracking-wide text-white md:text-3xl">
            Por que escolher a SkillNet
          </h3>
          <div className="grid gap-5 md:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.title} className="infernus-card rounded-2xl p-6">
                <div className="infernus-icon-box mb-4 flex h-11 w-11 items-center justify-center rounded-lg">
                  <item.icon className="h-5 w-5 text-[#ff7e00]" />
                </div>
                <p className="font-bold text-white">{item.title}</p>
                <p className="mt-2 text-sm text-[#9ca3af]">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="planos" className="mb-20">
          <div className="mb-8">
            <h3 className="font-outfit text-2xl font-black uppercase tracking-wide text-white md:text-3xl">
              Planos de assinatura
            </h3>
            <p className="mt-2 text-[#9ca3af]">Comece com teste grátis e evolua no seu ritmo.</p>
          </div>
          <div className="infernus-panel grid grid-cols-1 gap-6 md:grid-cols-2">
            {plans.map((plan) => (
              <div key={plan.name} className="infernus-plan-card relative p-8">
                <span className="absolute right-5 top-5 rounded-full border border-[#ff7e00]/50 bg-[#ff7e00]/10 px-3 py-1 text-[10px] font-bold uppercase text-[#ff7e00]">
                  {plan.badge}
                </span>
                <h4 className="text-3xl font-black text-white">{plan.name}</h4>
                <p className="mt-3 text-4xl font-black text-white">
                  {plan.price}{' '}
                  <span className="text-base font-medium text-[#cee7f3]">/{plan.cycle}</span>
                </p>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-[#9ca3af]">
                      <span className="mt-1 text-[#ff7e00]">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="btn-infernus-primary mt-8 block rounded-xl py-3 text-center text-sm font-bold uppercase tracking-wide"
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <h3 className="font-outfit mb-8 text-2xl font-black uppercase tracking-wide text-white md:text-3xl">
            Como funciona
          </h3>
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.title} className="infernus-card rounded-2xl p-6">
                <div className="infernus-icon-box mb-4 flex h-11 w-11 items-center justify-center rounded-lg">
                  <step.icon className="h-5 w-5 text-[#ff7e00]" />
                </div>
                <p className="font-bold text-white">{step.title}</p>
                <p className="mt-2 text-sm text-[#9ca3af]">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="infernus-panel mb-8 px-8 py-10 text-center md:px-12 md:py-14">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#ff7e00]/40 bg-[#ff7e00]/10">
            <Rocket className="h-8 w-8 text-[#ff7e00]" />
          </div>
          <h3 className="font-outfit infernus-title-glow text-3xl font-black text-white md:text-4xl">
            Pronto para entrar na SkillNet?
          </h3>
          <p className="mx-auto mt-3 max-w-md text-[#9ca3af]">
            Acesse sua conta, escolha seu plano e comece a evoluir hoje.
          </p>
          <Link
            href="/login"
            className="btn-infernus-primary mt-8 inline-block rounded-full px-10 py-3.5 text-sm font-bold uppercase tracking-wide"
          >
            Entrar no sistema
          </Link>
        </section>

        <footer className="border-t border-white/10 py-6 text-center text-xs text-[#6b7280]">
          SkillNet — troca de habilidades entre estudantes
        </footer>
      </div>
    </main>
  );
}
