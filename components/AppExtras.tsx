
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera } from 'lucide-react';

export const ProfileView = ({ user, onUpdate }: { user: any, onUpdate: (u: any) => void }) => {
  const [formData, setFormData] = useState(user);
  const [showSuccess, setShowSuccess] = useState(false);
  const handleFile = (e: any) => {
    const f = e.target.files?.[0];
    if (f) { const r = new FileReader(); r.onloadend = () => setFormData({ ...formData, avatar: r.result as string }); r.readAsDataURL(f); }
  };
  const save = (e: any) => { e.preventDefault(); onUpdate(formData); setShowSuccess(true); setTimeout(() => setShowSuccess(false), 2000); };
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-8 bg-surface p-8 rounded-3xl border border-border-main relative">
      <AnimatePresence>{showSuccess && <motion.div exit={{ opacity: 0 }} className="absolute top-0 left-0 right-0 bg-emerald-500 text-white text-center py-2 text-xs font-bold">Salvo!</motion.div>}</AnimatePresence>
      <div className="flex flex-col items-center gap-4">
        <div className="relative"><img src={formData.avatar} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl" /><button type="button" onClick={() => (document.getElementById('p-file') as any).click()} className="btn-infernus-primary absolute bottom-0 right-0 rounded-full p-2"><Camera className="w-4 h-4" /></button></div>
        <input id="p-file" type="file" className="hidden" onChange={handleFile} />
      </div>
      <form onSubmit={save} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className="bg-bg-main border p-3 rounded-xl text-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Nome" />
        <input className="bg-bg-main border p-3 rounded-xl text-sm" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="Email" />
        <input className="bg-bg-main border p-3 rounded-xl text-sm" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="Telefone" />
        <input className="bg-bg-main border p-3 rounded-xl text-sm" value={formData.phone_whatsapp || ''} onChange={e => setFormData({ ...formData, phone_whatsapp: e.target.value })} placeholder="WhatsApp" />
        <select className="bg-bg-main border p-3 rounded-xl text-sm" value={formData.role || 'aluno'} onChange={e => setFormData({ ...formData, role: e.target.value })}>
          <option value="aluno">Aluno</option>
          <option value="tutor">Tutor</option>
          <option value="aluno_tutor">Aluno e Tutor</option>
        </select>
        <input className="bg-bg-main border p-3 rounded-xl text-sm" value={formData.info} onChange={e => setFormData({ ...formData, info: e.target.value })} placeholder="Curso" />
        <textarea className="md:col-span-2 bg-bg-main border p-3 rounded-xl text-sm h-24" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} placeholder="Bio" />
        <button type="submit" className="btn-infernus-primary md:col-span-2 rounded-xl py-3 font-bold">Salvar</button>
      </form>
    </motion.div>
  );
};

const ROLE_LABELS: Record<string, string> = {
  aluno: 'Aluno',
  tutor: 'Tutor',
  aluno_tutor: 'Aluno e Tutor',
};

function memberSubtitle(member: { role?: string; period?: string; info?: string; course?: string }) {
  const role = ROLE_LABELS[member.role ?? ''] ?? 'Membro';
  const detail = member.period || member.info || member.course || '';
  return detail ? `${role} • ${detail}` : role;
}

export const MembersView = ({ members, onSelectMember }: { members: any[]; onSelectMember: (p: any) => void }) => (
  <div className="animate-in fade-in duration-500">
    <div className="infernus-member-grid grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {members.length === 0 ? (
        <p className="col-span-full py-12 text-center text-[#9ca3af]">Nenhum membro cadastrado ainda.</p>
      ) : (
        members.map((p) => (
          <button
            key={p.id ?? p.name}
            type="button"
            onClick={() => onSelectMember(p)}
            className="infernus-member-card flex cursor-pointer flex-col items-center p-6 text-center"
          >
            <div className="mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-white/25">
              <img src={p.avatar} alt={p.name} className="h-full w-full object-cover" />
            </div>
            <h4 className="font-bold text-white">{p.name}</h4>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#cee7f3]">{memberSubtitle(p)}</p>
          </button>
        ))
      )}
    </div>
  </div>
);

export const RequestsView = ({ requests }: { requests: any[] }) => (
  <div className="space-y-4">
    {requests.length === 0 ? <p className="text-center text-text-muted">Nenhum pedido ativado.</p> : requests.map((r) => (
      <div key={r.id} className="bg-surface border p-6 rounded-2xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden"><img src={r.image} className="w-full h-full object-cover" /></div>
          <div><h4 className="font-bold text-text-main">{r.title}</h4><p className="text-xs text-text-muted">Para: {r.student}</p></div>
        </div>
        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${r.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span>
      </div>
    ))}
  </div>
);

export const IncomingRequestsView = ({ requests, onAction }: { requests: any[], onAction: (id: number, status: string) => void }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {requests.length === 0 ? <p className="text-center md:col-span-2 text-text-muted">Sem novas solicitações.</p> : requests.map((r) => (
      <div key={r.id} className="bg-surface p-6 rounded-[2rem] border border-border-main hover:border-primary transition-all">
        <div className="flex items-center gap-4 mb-6">
          <img src={r.fromAvatar} className="w-14 h-14 rounded-full border-2 border-white shadow-md" />
          <div><h4 className="font-bold text-text-main">{r.from}</h4><p className="text-sm italic">&quot;{r.title}&quot;</p></div>
        </div>
        <div className="grid grid-cols-2 gap-3"><button type="button" onClick={() => onAction(r.id, 'accepted')} className="btn-infernus-primary text-[10px] font-bold py-3 rounded-xl uppercase">Aceitar</button><button type="button" onClick={() => onAction(r.id, 'declined')} className="btn-infernus-outline text-[10px] font-bold py-3 rounded-xl uppercase">Recusar</button></div>
      </div>
    ))}
  </div>
);
