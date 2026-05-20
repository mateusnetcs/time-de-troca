
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Rocket, Zap, Star } from 'lucide-react';

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
        <div className="p-6 bg-white flex gap-2"><input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type a message..." className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20" /><button className="bg-primary text-white p-3 rounded-xl"><Send className="w-5 h-5" /></button></div>
      </motion.div>
    </div>
  );
};

export const ExchangeModal = ({ isOpen, onClose, skill, onConfirm }: { isOpen: boolean, onClose: () => void, skill: any, onConfirm: () => void }) => {
  if (!isOpen || !skill) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[3rem] relative shadow-2xl p-10 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8"><Zap className="w-10 h-10 text-emerald-600" /></div>
        <h3 className="text-2xl font-black mb-4">Firmar Pacto de Troca?</h3>
        <p className="text-text-muted mb-8">Ao confirmar, você entregará <span className="font-bold text-primary">{skill.credits} Crédito(s)</span> para <span className="font-bold text-text-main">{skill.student}</span> em troca da habilidade <span className="font-bold text-primary">{skill.title}</span>.</p>
        <div className="grid grid-cols-2 gap-4"><button onClick={onClose} className="bg-bg-main text-text-muted font-bold py-4 rounded-2xl uppercase">Cancelar</button><button onClick={() => { onConfirm(); onClose(); }} className="bg-primary text-white font-bold py-4 rounded-2xl uppercase">Confirmar Troca</button></div>
      </motion.div>
    </div>
  );
};
