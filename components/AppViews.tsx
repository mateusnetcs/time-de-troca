
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, ChevronRight, Award, 
  ArrowLeftRight, Camera, User
} from 'lucide-react';
import { CATEGORIES } from '@/lib/data';

export const SkillCard = ({ skill, onExchange, onOpenChat, onSelectStudent }: { 
  skill: any, onExchange: (s: any) => void, onOpenChat: (s: string) => void, onSelectStudent: (p: any) => void
}) => (
  <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface rounded-2xl border border-border-main p-5 card-shadow group transition-all">
    <div className="flex items-start justify-between mb-4">
      <span className="bg-primary-light text-primary text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">{skill.category}</span>
      <button className="text-text-muted hover:text-primary transition-colors"><Plus className="w-4 h-4" /></button>
    </div>
    <h3 className="font-bold text-text-main mb-2 leading-tight">{skill.title}</h3>
    <p className="text-sm text-text-muted line-clamp-2 h-10 mb-6 leading-relaxed">Ajudo você a dominar {skill.title.toLowerCase()} com uma abordagem prática para o trabalho final.</p>
    <div className="flex items-center justify-between pt-4 border-t border-border-main">
      <button onClick={() => onSelectStudent(skill.owner)} className="flex items-center gap-2 group/author active:scale-95 transition-transform">
        <div className="w-6 h-6 rounded-full bg-slate-100 border border-border-main overflow-hidden group-hover/author:ring-2 group-hover/author:ring-primary/30 transition-all">
          <img src={skill.owner?.avatar} alt={skill.student} className="w-full h-full object-cover" />
        </div>
        <span className="text-xs font-semibold text-text-main group-hover/author:text-primary transition-colors">{skill.student}</span>
      </button>
      <div className="flex items-center gap-3">
        <span className="font-bold text-text-main text-sm">{skill.credits} T-C</span>
        <button onClick={() => onExchange(skill)} className="bg-primary text-white p-1.5 rounded-lg hover:bg-primary/90 transition-all active:scale-90"><ChevronRight className="w-4 h-4" /></button>
      </div>
    </div>
  </motion.div>
);

export const MySkillsView = ({
  mySkills,
  onPublish,
  onDelete,
}: {
  mySkills: any[];
  onPublish: (payload: { title: string; category: string; description: string }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) => {
  const [newSkill, setNewSkill] = useState({ title: '', category: 'Exatas', description: '' });
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePublish = async () => {
    if (!newSkill.title.trim()) return;
    await onPublish(newSkill);
    setShowSuccess(true);
    setNewSkill({ title: '', category: 'Exatas', description: '' });
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="bg-surface rounded-3xl border border-border-main p-8 shadow-sm relative overflow-hidden">
        <AnimatePresence>{showSuccess && <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-center py-2 text-xs font-bold z-10">Habilidade publicada!</motion.div>}</AnimatePresence>
        <h3 className="text-xl font-bold text-text-main mb-6">Oferecer Nova Habilidade</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" value={newSkill.title} onChange={(e) => setNewSkill({ ...newSkill, title: e.target.value })} placeholder="Nome da Habilidade" className="bg-bg-main border border-border-main rounded-xl px-4 py-3 text-sm" />
          <select value={newSkill.category} onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })} className="bg-bg-main border border-border-main rounded-xl px-4 py-3 text-sm">
            {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
          </select>
          <textarea value={newSkill.description} onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })} placeholder="Descrição" className="md:col-span-2 bg-bg-main border border-border-main rounded-xl px-4 py-3 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-primary/20" />
        </div>
        <button onClick={handlePublish} className="mt-8 bg-primary text-white font-bold px-8 py-3 rounded-xl hover:shadow-lg active:scale-95 transition-all">Publicar</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mySkills.map(s => (
          <div key={s.id} className="bg-surface border border-border-main p-6 rounded-2xl flex items-center justify-between">
            <div><h4 className="font-bold text-text-main">{s.title}</h4><p className="text-xs text-text-muted mt-1">{s.category}</p></div>
            <button onClick={() => onDelete(s.id)} className="text-text-muted hover:text-red-500"><Plus className="w-5 h-5 rotate-45" /></button>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export const HistoryView = ({ history }: { history: any[] }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
    <h3 className="text-xl font-bold text-text-main">Histórico</h3>
    {history.length === 0 ? <p className="text-text-muted">Nenhum registro ainda.</p> : history.map((item) => (
      <div key={item.id} className="bg-surface border border-border-main p-5 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.type === 'earned' ? 'bg-emerald-100' : 'bg-indigo-100'}`}>
            {item.type === 'earned' ? <ArrowLeftRight className="w-5 h-5 text-emerald-600" /> : <Award className="w-5 h-5 text-indigo-600" />}
          </div>
          <div><h4 className="font-bold text-text-main text-sm">{item.title}</h4><p className="text-xs text-text-muted">{item.student}</p></div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-black ${item.type === 'earned' ? 'text-emerald-600' : 'text-indigo-600'}`}>{item.type === 'earned' ? '+ Créditos' : 'Pacto'}</p>
          <p className="text-[10px] text-text-muted">{new Date(item.id).toLocaleDateString()}</p>
        </div>
      </div>
    ))}
  </motion.div>
);

export const OnboardingView = ({ currentData, onFinish }: { currentData: any, onFinish: (data: any) => void }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(currentData);
  const handleFileUpload = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader(); r.onloadend = () => setFormData({ ...formData, avatar: r.result as string }); r.readAsDataURL(file);
    }
  };
  return (
    <div className="flex items-center justify-center py-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white w-full max-w-4xl rounded-[3rem] border border-border-main shadow-xl flex overflow-hidden min-h-[600px]">
        <div className="bg-primary p-12 text-white md:w-1/3 flex flex-col justify-between">
          <div><h2 className="text-3xl font-black">Comece sua jornada.</h2><p className="mt-4 opacity-80">Troque habilidades e cresça.</p></div>
          <div className="space-y-4">
            {[1, 2].map(s => <div key={s} className={`flex items-center gap-3 ${step === s ? 'text-white' : 'text-white/30'}`}><div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${step === s ? 'bg-white text-primary border-white' : 'border-white/30'}`}>{s}</div><span className="text-xs font-black uppercase tracking-widest">{s === 1 ? 'Perfil' : 'Habilidades'}</span></div>)}
          </div>
        </div>
        <div className="p-10 md:w-2/3">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="flex justify-center"><div className="relative"><div className="w-28 h-28 rounded-full bg-slate-100 border-2 overflow-hidden flex items-center justify-center">{formData.avatar ? <img src={formData.avatar} alt="P" className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-text-muted" />}</div><label className="absolute -bottom-1 -right-1 bg-primary text-white p-2.5 rounded-full cursor-pointer"><Camera className="w-4 h-4" /><input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} /></label></div></div>
              <div className="grid gap-4">
                <input placeholder="Nome" className="bg-bg-main border p-4 rounded-2xl text-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <input placeholder="Email" className="bg-bg-main border p-4 rounded-2xl text-sm" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                <div className="grid grid-cols-2 gap-4"><input placeholder="Instituição" className="bg-bg-main border p-4 rounded-2xl text-sm" value={formData.institution} onChange={e => setFormData({ ...formData, institution: e.target.value })} /> <input placeholder="Curso" className="bg-bg-main border p-4 rounded-2xl text-sm" value={formData.course} onChange={e => setFormData({ ...formData, course: e.target.value })} /></div>
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-primary text-white font-black py-4 rounded-2xl">Continuar</button>
            </div>
          ) : (
            <div className="space-y-6">
              <textarea placeholder="O que você ensina?" className="w-full bg-bg-main border p-4 rounded-2xl h-24 text-sm" value={formData.skillsOffer} onChange={e => setFormData({ ...formData, skillsOffer: e.target.value })} />
              <textarea placeholder="O que você busca?" className="w-full bg-bg-main border p-4 rounded-2xl h-24 text-sm" value={formData.skillsSeek} onChange={e => setFormData({ ...formData, skillsSeek: e.target.value })} />
              <button onClick={() => onFinish({ ...formData, info: `${formData.course} - ${formData.period} Período`, onboarded: true })} className="w-full bg-primary text-white font-black py-4 rounded-2xl">Finalizar</button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
