
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Send, Zap } from 'lucide-react';
import { OnboardingView } from '@/components/AppViews';
import type { OnboardingInput, UserProfile } from '@/lib/types';

export const ChatOverlay = ({ isOpen, onClose, targetStudent }: { isOpen: boolean, onClose: () => void, targetStudent: string }) => {
  const [msg, setMsg] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-[2.5rem] relative overflow-hidden shadow-2xl">
        <div className="bg-primary p-8 text-white flex justify-between items-center">
          <div><h3 className="text-xl font-bold">Chat com {targetStudent}</h3><p className="text-xs opacity-70">Online agora</p></div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform"><X className="w-6 h-6" /></button>
        </div>
        <div className="h-80 p-6 bg-slate-50 flex flex-col justify-end"><p className="bg-white p-4 rounded-2xl rounded-bl-none text-sm inline-block max-w-[80%] shadow-sm">Olá! Vi seu interesse em uma das minhas habilidades. Como posso te ajudar?</p></div>
        <div className="p-6 bg-white flex gap-2"><input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type a message..." className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-accent/20" /><button type="button" className="btn-action rounded-xl p-3"><Send className="w-5 h-5" /></button></div>
      </motion.div>
    </div>
  );
};

export const ExchangeModal = ({ isOpen, onClose, skill, onConfirm }: { isOpen: boolean, onClose: () => void, skill: any, onConfirm: () => void }) => {
  if (!isOpen || !skill) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="exchange-modal-overlay absolute inset-0"
      />
      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="exchange-modal-panel relative w-full max-w-[520px] px-10 py-12 text-center md:px-14 md:py-14"
      >
        <div className="exchange-modal-icon mx-auto mb-10 flex h-[88px] w-[88px] items-center justify-center rounded-full">
          <Zap className="h-11 w-11" strokeWidth={2.25} />
        </div>

        <p className="exchange-modal-text mx-auto mb-12 max-w-[400px] text-lg md:text-xl">
          Tem certeza que deseja{' '}
          <span className="exchange-modal-highlight">confirmar</span> a troca?
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button type="button" onClick={onClose} className="exchange-modal-btn-cancel px-4 py-[18px] transition-opacity">
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="exchange-modal-btn-confirm px-4 py-[18px] transition-all"
          >
            Confirmar Troca
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const ProfileOnboardingModal = ({
  isOpen,
  onClose,
  user,
  onFinish,
}: {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onFinish: (data: OnboardingInput) => void | Promise<void>;
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="exchange-modal-overlay absolute inset-0"
      />
      <motion.div
        initial={{ y: 20, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 w-full max-w-4xl max-h-[92vh] overflow-y-auto"
      >
        <OnboardingView
          currentData={user}
          onClose={onClose}
          onFinish={async (data) => {
            await onFinish(data);
            onClose();
          }}
        />
      </motion.div>
    </div>
  );
};
