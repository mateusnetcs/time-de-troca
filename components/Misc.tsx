
import React from 'react';
import { motion } from 'motion/react';
import { Rocket, Star, TrendingUp, X, MapPin, Mail, Phone, MessageSquare } from 'lucide-react';

export const SuccessOverlay = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-emerald-600/90 backdrop-blur-md" />
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative text-center text-white">
        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-8"><Rocket className="w-12 h-12" /></div>
        <h2 className="text-4xl font-black mb-4">Troca Solicitada!</h2>
        <p className="text-xl mb-12 opacity-80">Seu pedido foi enviado para o colega. Boa sorte!</p>
        <button onClick={onClose} className="bg-white text-emerald-600 font-bold px-12 py-4 rounded-2xl hover:scale-105 transition-transform uppercase tracking-widest">Entendido</button>
      </motion.div>
    </div>
  );
};

export const QuickStats = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
    {[
      { label: 'Trocas Realizadas', value: '142', icon: Star, color: 'text-amber-500', bg: 'bg-amber-500/10' },
      { label: 'Membros Ativos', value: '48', icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
      { label: 'Créditos em Fluxo', value: '850', icon: Rocket, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
    ].map((stat, i) => (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="bg-surface border border-border-main p-6 rounded-3xl flex items-center gap-4">
        <div className={`${stat.bg} p-4 rounded-2xl`}><stat.icon className={`w-6 h-6 ${stat.color}`} /></div>
        <div><p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{stat.label}</p><p className="text-2xl font-black text-text-main">{stat.value}</p></div>
      </motion.div>
    ))}
  </div>
);

export const StudentProfileOverlay = ({ profile, onClose }: { profile: any, onClose: () => void }) => {
  if (!profile) return null;
  return (
    <div className="fixed inset-0 z-[105] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[3rem] relative shadow-2xl overflow-hidden">
        <div className="h-32 bg-primary w-full" />
        <div className="px-8 pb-10 -mt-16 text-center">
          <div className="w-32 h-32 rounded-full border-8 border-white mx-auto overflow-hidden shadow-lg"><img src={profile.avatar} className="w-full h-full object-cover" /></div>
          <h3 className="text-2xl font-black mt-4">{profile.name}</h3>
          <p className="text-primary text-xs font-bold uppercase tracking-widest mt-1 mb-6">{profile.info}</p>
          <div className="space-y-4 text-left bg-slate-50 p-6 rounded-2xl border border-border-main">
            <div className="flex items-center gap-3 text-sm font-medium text-text-muted"><Mail className="w-4 h-4" /> {profile.email}</div>
            <div className="flex items-center gap-3 text-sm font-medium text-text-muted"><Phone className="w-4 h-4" /> {profile.phone}</div>
            <p className="text-sm text-text-main leading-relaxed mt-4 italic">&quot;{profile.bio}&quot;</p>
          </div>
          <button onClick={onClose} className="mt-8 w-full bg-primary text-white font-bold py-4 rounded-xl uppercase tracking-widest">Fechar Perfil</button>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 bg-white/20 text-white p-2 rounded-full hover:bg-white/40"><X className="w-5 h-5" /></button>
      </motion.div>
    </div>
  );
};
