
import React from 'react';
import { motion } from 'motion/react';
import { Rocket, Star, TrendingUp, X, Mail, Phone } from 'lucide-react';
import { displayBrazilPhone } from '@/lib/phone';
import { buildProfileContactMessage, buildWhatsAppUrl } from '@/lib/whatsapp';
import type { UserProfile } from '@/lib/types';

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

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export const StudentProfileOverlay = ({
  profile,
  viewer,
  onClose,
}: {
  profile: UserProfile | null;
  viewer: UserProfile | null;
  onClose: () => void;
}) => {
  if (!profile) return null;

  const phoneDisplay = displayBrazilPhone(profile.phone_whatsapp || profile.phone);
  const whatsappUrl =
    viewer &&
    buildWhatsAppUrl(
      profile.phone_whatsapp || profile.phone,
      buildProfileContactMessage(viewer.name),
    );

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
            <div className="flex items-center justify-between gap-3 text-sm text-text-muted">
              <div className="flex min-w-0 items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                <span>{phoneDisplay || 'Não informado'}</span>
              </div>
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Conversar no WhatsApp"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#25D366]/40 bg-[#25D366]/15 text-[#25D366] transition-colors hover:bg-[#25D366]/25"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                </a>
              )}
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
