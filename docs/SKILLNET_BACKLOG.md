# Backlog Tecnico - SkillNet

## Objetivo
Evoluir o projeto atual para o conceito do PDF "SkillNet", com:
- perfis separados de `aluno` e `tutor`;
- painel de aluno e painel de tutor;
- planos ofertados e controle de periodo de teste;
- pagamento via `pix`, `credito` e `debito`;
- acao de contato rapido para WhatsApp/celular do tutor.

## Estado Atual (base ja pronta)
- Next.js + Supabase integrados.
- Tabelas principais existentes: `profiles`, `skills`, `exchange_requests`, `credit_transactions`.
- Fluxo de troca e historico funcional.

---

## Fase 1 - Modelagem de dados (Supabase)
Prioridade: **alta**

### 1.1 Ajustes em `profiles`
- adicionar campo `role` (`aluno` | `tutor` | `aluno_tutor`);
- adicionar `phone_whatsapp` (texto);
- adicionar `trial_ends_at` (timestamptz);
- adicionar `is_trial_active` (boolean, derivado ou persistido).

### 1.2 Novas tabelas
- `plans`
  - `id`, `name`, `description`, `price_cents`, `billing_cycle`, `is_active`
- `subscriptions`
  - `id`, `profile_id`, `plan_id`, `status`, `starts_at`, `ends_at`, `trial_ends_at`
- `payment_methods`
  - `id`, `profile_id`, `type` (`pix` | `credito` | `debito`), `provider`, `last4`, `is_default`
- `payments`
  - `id`, `profile_id`, `subscription_id`, `amount_cents`, `status`, `method_type`, `paid_at`
- `service_requests` (separado de exchange, para modelo de contratacao)
  - `id`, `student_profile_id`, `tutor_profile_id`, `skill_id`, `status`, `scheduled_at`, `created_at`

### 1.3 Migrations
- criar migration incremental em `supabase/migrations/` com:
  - `ALTER TABLE` nas estruturas existentes;
  - `CREATE TABLE` das novas entidades;
  - indices por `profile_id`, `status`, `created_at`;
  - RLS policies compativeis com uso via anon key.

---

## Fase 2 - Navegacao e UX
Prioridade: **alta**

### 2.1 Abas principais
- `Painel Aluno`
- `Painel Tutor`
- `Planos`
- `Pagamentos`
- manter `Perfil`

### 2.2 Regras de exibicao por perfil
- `aluno`: foco em solicitacoes, historico, estatisticas e trial.
- `tutor`: foco em servicos ofertados e recebimento de solicitacoes.
- `aluno_tutor`: exibe ambos os paines.

---

## Fase 3 - Painel do Tutor
Prioridade: **alta**

### 3.1 Servicos ofertados
- listar habilidades/servicos publicados pelo tutor;
- criar/editar/desativar servico.

### 3.2 Contato rapido no celular
- adicionar botao "Chamar no WhatsApp";
- formato de link: `https://wa.me/<numero>?text=<mensagem>`;
- fallback: `tel:<numero>` quando nao houver WhatsApp.

### 3.3 Caixa de solicitacoes
- listar pedidos recebidos;
- aceitar/recusar/agendar.

---

## Fase 4 - Painel do Aluno
Prioridade: **alta**

### 4.1 Estatisticas do aluno
- cards:
  - total de servicos solicitados;
  - total concluidos;
  - total em andamento.

### 4.2 Quadro de teste ativo
- exibir:
  - status do trial (ativo/inativo);
  - data final do teste;
  - CTA para assinar plano.

### 4.3 Solicitacao de servico
- aluno seleciona tutor/servico;
- cria `service_requests`;
- acompanha status.

---

## Fase 5 - Planos e Pagamentos
Prioridade: **media/alta**

### 5.1 Tela de Planos
- listar `plans` ativos;
- assinar plano escolhido;
- indicar diferencas entre trial e assinatura.

### 5.2 Metodos de pagamento
- tela para cadastrar:
  - PIX (chave);
  - cartao credito/debito (tokenizado, sem guardar numero bruto).

### 5.3 Confirmacao de pagamento
- registrar `payments`;
- atualizar `subscriptions` e permissao de uso.

> Observacao: para producao, integrar gateway (ex: Mercado Pago, Stripe/Pagar.me).  
> Nesta fase inicial, manter stub/simulacao controlada no banco.

---

## Fase 6 - Seguranca e qualidade
Prioridade: **alta**

- reforcar RLS por dono do registro (`profile_id`);
- validar role no backend antes de acoes de tutor/aluno;
- mascarar dados sensiveis de pagamento;
- adicionar logs de auditoria para alteracoes de assinatura/pagamento.

---

## Entregas sugeridas por sprint

### Sprint 1
- migrations novas;
- campos extras em `profiles`;
- abas aluno/tutor funcionando;
- painel tutor basico com contato WhatsApp.

### Sprint 2
- painel aluno com estatisticas e quadro trial;
- tabela e fluxo de `service_requests`;
- tela de planos.

### Sprint 3
- metodos de pagamento + assinaturas;
- hardening de RLS e regras de acesso;
- ajustes finais de UX e testes E2E.

---

## Criterios de aceite (resumo)
- usuario consegue se cadastrar como aluno/tutor;
- painel muda conforme papel;
- tutor recebe contato por link de celular/WhatsApp;
- aluno visualiza estatisticas e status do trial;
- planos aparecem e assinatura e registrada no banco;
- metodo de pagamento pode ser definido como pix/credito/debito.
