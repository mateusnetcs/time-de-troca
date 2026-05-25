
import React from 'react';
import { motion } from 'motion/react';
import { Rocket, Star, TrendingUp, X, Mail, Phone, MessageSquare } from 'lucide-react';

export const SuccessOverlay = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" />
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative text-center text-white">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-accent/40 bg-accent/20">
          <Rocket className="h-12 w-12 text-accent" />
        </div>
        <h2 className="mb-4 text-4xl font-black">Troca Solicitada!</h2>
        <p className="mb-12 text-xl text-text-muted">Seu pedido foi enviado para o colega. Boa sorte!</p>
        <button type="button" onClick={onClose} className="btn-infernus-primary rounded-2xl px-12 py-4 font-bold uppercase tracking-widest">
          Entendido
        </button>
      </motion.div>
    </div>
  );
};

/** Linha de features estilo INFERNUS (3 colunas com divisores) */
export const QuickStats = () => (
  <div className="mb-14 grid grid-cols-1 border-y border-white/10 md:grid-cols-3">
    {[
      { label: 'Trocas Realizadas', value: '142', sub: 'Na plataforma', icon: Star },
      { label: 'Membros Ativos', value: '48', sub: 'Comunidade viva', icon: TrendingUp },
      { label: 'Planos Ativos', value: '850', sub: 'Em circulação', icon: Rocket },
    ].map((stat, i) => (
      <motion.div
        key={stat.label}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.08 }}
        className={`flex items-center gap-4 px-6 py-8 ${i > 0 ? 'md:border-l md:border-white/10' : ''}`}
      >
        <div className="infernus-icon-box flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
          <stat.icon className="h-5 w-5 text-accent" />
        </div>
        <div>
          <p className="text-sm font-black text-white">{stat.label}</p>
          <p className="text-xs text-text-muted">{stat.sub}</p>
        </div>
      </motion.div>
    ))}
  </div>
);

export const StudentProfileOverlay = ({ profile, onClose }: { profile: any; onClose: () => void }) => {
  if (!profile) return null;
  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="infernus-card relative w-full max-w-lg overflow-hidden rounded-3xl shadow-2xl">
        <div className="h-28 w-full bg-primary" />
        <div className="-mt-16 px-8 pb-10 text-center">
          <div className="mx-auto h-32 w-32 overflow-hidden rounded-full border-4 border-black">
            <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
          </div>
          <h3 className="mt-4 text-2xl font-black text-white">{profile.name}</h3>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-accent">{profile.info}</p>
          <div className="mt-6 space-y-4 rounded-2xl border border-white/10 bg-black/40 p-6 text-left">
            <div className="flex items-center gap-3 text-sm text-text-muted">
              <Mail className="h-4 w-4 text-accent" /> {profile.email}
            </div>
            <div className="flex items-center gap-3 text-sm text-text-muted">
              <Phone className="h-4 w-4 text-accent" /> {profile.phone}
            </div>
            <p className="mt-4 text-sm italic text-primary-light">&quot;{profile.bio}&quot;</p>
          </div>
          <button type="button" onClick={onClose} className="btn-infernus-primary mt-8 w-full rounded-xl py-4 font-bold uppercase tracking-widest">
            Fechar Perfil
          </button>
        </div>
        <button type="button" onClick={onClose} className="absolute right-4 top-4 rounded-full border border-white/20 p-2 text-white hover:border-accent">
          <X className="h-5 w-5" />
        </button>
      </motion.div>
    </div>
  );
};
