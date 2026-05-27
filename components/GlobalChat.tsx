'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hash, MessageCircle, Send, X } from 'lucide-react';
import {
  fetchGlobalChatMessages,
  sendGlobalChatMessage,
  subscribeToGlobalChat,
} from '@/lib/supabase-data';
import type { GlobalChatMessage, UserProfile } from '@/lib/types';

type GlobalChatProps = {
  currentUser: UserProfile;
  profilesById: Record<string, UserProfile>;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Hoje';
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function GlobalChat({ currentUser, profilesById }: GlobalChatProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<GlobalChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGlobalChatMessages();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar o chat.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    void loadMessages();
  };

  useEffect(() => {
    if (!open) return;
    const unsubscribe = subscribeToGlobalChat((message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });
    return unsubscribe;
  }, [open]);

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open, scrollToBottom]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    setSending(true);
    setError(null);
    try {
      const created = await sendGlobalChatMessage(currentUser.id, text);
      setMessages((prev) => {
        if (prev.some((m) => m.id === created.id)) return prev;
        return [...prev, created];
      });
      setDraft('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar a mensagem.');
    } finally {
      setSending(false);
    }
  };

  let lastDate = '';

  return (
    <>
      <button
        type="button"
        onClick={handleToggle}
        className="global-chat-fab fixed bottom-6 right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
        aria-label={open ? 'Fechar chat global' : 'Abrir chat global'}
      >
        {open ? <X className="h-6 w-6 text-white" /> : <MessageCircle className="h-6 w-6 text-white" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="global-chat-panel fixed bottom-24 right-6 z-[60] flex h-[min(520px,calc(100vh-7rem))] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl shadow-2xl"
          >
            <header className="global-chat-header flex shrink-0 items-center gap-2 border-b border-white/10 px-4 py-3">
              <Hash className="h-5 w-5 text-accent" />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold text-white">geral</h3>
                <p className="text-[10px] text-text-muted">Chat global da SkillNet</p>
              </div>
              <button
                type="button"
                onClick={handleToggle}
                className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div ref={listRef} className="global-chat-messages custom-scrollbar flex-1 overflow-y-auto px-3 py-4">
              {loading && (
                <p className="py-8 text-center text-xs text-text-muted">Carregando mensagens...</p>
              )}
              {!loading && messages.length === 0 && (
                <p className="py-8 text-center text-xs text-text-muted">
                  Nenhuma mensagem ainda. Seja o primeiro a falar no canal #geral.
                </p>
              )}
              {!loading &&
                messages.map((msg) => {
                  const author = profilesById[msg.profile_id];
                  const dateLabel = formatDateLabel(msg.created_at);
                  const showDate = dateLabel !== lastDate;
                  if (showDate) lastDate = dateLabel;
                  const isOwn = msg.profile_id === currentUser.id;

                  return (
                    <React.Fragment key={msg.id}>
                      {showDate && (
                        <div className="my-4 flex items-center gap-2">
                          <div className="h-px flex-1 bg-white/10" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                            {dateLabel}
                          </span>
                          <div className="h-px flex-1 bg-white/10" />
                        </div>
                      )}
                      <div
                        className={`mb-3 flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                      >
                        <img
                          src={author?.avatar ?? 'https://picsum.photos/seed/default-avatar/200/200'}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-full object-cover"
                        />
                        <div className={`min-w-0 max-w-[85%] ${isOwn ? 'text-right' : ''}`}>
                          <div className={`mb-0.5 flex items-baseline gap-2 ${isOwn ? 'justify-end' : ''}`}>
                            <span className="text-xs font-bold text-accent">
                              {author?.name ?? 'Membro'}
                            </span>
                            <span className="text-[10px] text-text-muted">
                              {formatTime(msg.created_at)}
                            </span>
                          </div>
                          <p
                            className={`global-chat-bubble inline-block rounded-lg px-3 py-2 text-left text-sm text-white ${
                              isOwn ? 'global-chat-bubble-own' : ''
                            }`}
                          >
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
            </div>

            {error && (
              <p className="shrink-0 px-4 py-1 text-[10px] text-accent">{error}</p>
            )}

            <form
              onSubmit={handleSend}
              className="global-chat-input-bar flex shrink-0 gap-2 border-t border-white/10 p-3"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Conversar em #geral como ${currentUser.name}`}
                className="global-chat-input flex-1 rounded-lg px-3 py-2.5 text-sm text-white outline-none"
                maxLength={2000}
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="global-chat-send flex h-10 w-10 shrink-0 items-center justify-center rounded-lg disabled:opacity-50"
                aria-label="Enviar"
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
