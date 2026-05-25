import Link from 'next/link';

const highlights = [
  { title: 'Tutores verificados', description: 'Perfis avaliados para você aprender com mais confiança.' },
  { title: 'Contratação rápida', description: 'Solicite um serviço em poucos cliques e acompanhe o status.' },
  { title: 'Pagamento flexível', description: 'PIX, crédito ou débito para facilitar sua assinatura.' },
];

const plans = [
  {
    name: 'Básico',
    price: 'R$ 19,90/mês',
    badge: '7 dias grátis',
    features: ['5 solicitações de serviço por mês', 'Acesso ao chat com tutores', 'Perfil básico', 'Suporte por email'],
    cta: 'Começar Grátis',
  },
  {
    name: 'Premium',
    price: 'R$ 29,90/mês',
    badge: 'Recomendado',
    features: ['12 solicitações de serviço por mês', 'Acesso prioritário ao chat', 'Perfil destacado', 'Suporte prioritário', 'Badge de membro premium', 'Estatísticas detalhadas'],
    cta: 'Assinar Premium',
  },
];

const steps = [
  { title: '1. Crie sua conta', description: 'Cadastre-se em minutos e configure seu perfil de aluno ou tutor.' },
  { title: '2. Escolha o plano', description: 'Ative o teste grátis e evolua para o plano que fizer mais sentido.' },
  { title: '3. Conecte e aprenda', description: 'Solicite serviços, converse com tutores e acompanhe resultados.' },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg-main text-text-main">
      <section className="max-w-6xl mx-auto px-6 py-10 md:py-14">
        <header className="flex items-center justify-between mb-14">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">SkillNet</h1>
          <Link href="/login" className="btn-action rounded-xl px-6 py-2.5 font-bold shadow-sm">
            Entrar
          </Link>
        </header>

        <section className="grid md:grid-cols-2 gap-10 items-center mb-16">
          <div>
            <p className="text-primary font-bold uppercase text-xs tracking-[0.2em] mb-3">Plataforma de conexão acadêmica</p>
            <h2 className="text-4xl md:text-5xl font-black leading-tight">
              Aprenda com quem sabe e ensine o que você domina.
            </h2>
            <p className="text-text-muted mt-5 text-lg">
              Uma experiência elegante para alunos e tutores, com assinatura simples, acompanhamento de solicitações e suporte contínuo.
            </p>
            <div className="flex gap-3 mt-8">
              <Link href="/login" className="btn-action rounded-xl px-6 py-3 font-bold">
                Começar agora
              </Link>
              <a href="#planos" className="border border-border-main px-6 py-3 rounded-xl font-bold">
                Ver planos
              </a>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-indigo-200/20 border border-primary/20 rounded-3xl p-8">
            <p className="font-bold text-sm mb-2">Para alunos e tutores</p>
            <p className="text-text-muted text-sm mb-6">Tudo em um único ambiente, com foco em resultado.</p>
            <div className="space-y-3">
              {highlights.map((item) => (
                <div key={item.title} className="bg-white/70 border border-white rounded-2xl p-4">
                  <p className="font-bold">{item.title}</p>
                  <p className="text-sm text-text-muted mt-1">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h3 className="text-2xl font-black mb-6">Por que escolher a SkillNet</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {highlights.map((item) => (
              <div key={item.title} className="bg-surface border border-border-main rounded-2xl p-6">
                <p className="font-bold">{item.title}</p>
                <p className="text-sm text-text-muted mt-2">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="planos" className="mb-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h3 className="text-2xl font-black">Planos de assinatura</h3>
              <p className="text-text-muted mt-1">Comece com teste grátis e evolua no seu ritmo.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plans.map((plan) => (
              <div key={plan.name} className="bg-surface border border-border-main rounded-3xl p-8 relative shadow-sm">
                <span className="absolute top-5 right-5 text-[10px] uppercase font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                  {plan.badge}
                </span>
                <h4 className="text-3xl font-black">{plan.name}</h4>
                <p className="text-4xl font-black text-primary mt-3">{plan.price}</p>
                <ul className="space-y-3 mt-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="text-sm">{feature}</li>
                  ))}
                </ul>
                <Link href="/login" className="btn-action mt-8 block rounded-xl py-3 text-center font-bold">
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h3 className="text-2xl font-black mb-6">Como funciona</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {steps.map((step) => (
              <div key={step.title} className="bg-surface border border-border-main rounded-2xl p-6">
                <p className="font-bold">{step.title}</p>
                <p className="text-sm text-text-muted mt-2">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-primary text-white rounded-3xl p-8 md:p-10 text-center mb-8">
          <h3 className="text-3xl font-black">Pronto para entrar na SkillNet?</h3>
          <p className="opacity-85 mt-3">Acesse sua conta, escolha seu plano e comece a evoluir hoje.</p>
          <Link href="/login" className="inline-block mt-7 bg-white text-primary px-8 py-3 rounded-xl font-black">
            Entrar no sistema
          </Link>
        </section>
      </section>
    </main>
  );
}
