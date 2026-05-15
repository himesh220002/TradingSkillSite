"use client";

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api-config';
import { MessageSquare, Shield, CheckCircle2, Search, Filter, Send, Clock, Users } from 'lucide-react';

interface CommunityMessage {
  _id: string;
  senderId: string;
  username: string;
  batchId: { _id: string, batchName: string } | string | null;
  content: string;
  type: 'General' | 'Question' | 'TradeSetup';
  isResponded: boolean;
  trainerResponse?: string;
  createdAt: string;
}

export default function CommunityManager() {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [filter, setFilter] = useState<'all' | 'unresponded' | 'responded'>('unresponded');
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  const API_BASE = `${API_BASE_URL}/api/community`;

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/all`);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching admin messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = async (messageId: string) => {
    const response = replyText[messageId];
    if (!response?.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/${messageId}/reply`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response })
      });

      if (res.ok) {
        const updated = await res.json();
        setMessages(prev => prev.map(m => m._id === messageId ? updated : m));
        setReplyText(prev => ({ ...prev, [messageId]: '' }));
      }
    } catch (error) {
      console.error("Error replying:", error);
    }
  };

  const filteredMessages = messages.filter(m => {
    if (filter === 'unresponded') return !m.isResponded;
    if (filter === 'responded') return m.isResponded;
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-slate-900/40 p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-emerald-500" />
            </div>
            Community Q&A
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage student inquiries and provide expert trade analysis.</p>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-950/50 p-1.5 rounded-2xl border border-black/5 dark:border-white/5">
          {[
            { id: 'unresponded', label: 'Pending' },
            { id: 'responded', label: 'Answered' },
            { id: 'all', label: 'All' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => setFilter(opt.id as any)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === opt.id
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 pb-20">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-6 text-slate-400">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">Syncing Intel...</span>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="py-40 flex flex-col items-center justify-center bg-white dark:bg-slate-900/20 border-2 border-dashed border-black/5 dark:border-white/5 rounded-[3rem] text-center">
            <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Queue Empty</h3>
            <p className="text-slate-500 dark:text-slate-500 mt-2 font-medium">All students have been taken care of. Great job!</p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div key={msg._id} className="group relative bg-white dark:bg-slate-900/40 border border-black/5 dark:border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500">
              <div className="p-8 sm:p-10">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-emerald-500/20">
                      {msg.username[0]}
                    </div>
                    <div>
                      <div className="text-lg font-black text-slate-900 dark:text-white">{msg.username}</div>
                      <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-1.5">
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                          <Users className="w-3.5 h-3.5" /> {typeof msg.batchId === 'object' ? msg.batchId?.batchName : 'Public'}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <Clock className="w-3.5 h-3.5" /> {new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {msg.isResponded ? (
                    <span className="px-5 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">Answered</span>
                  ) : (
                    <span className="px-5 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest border border-amber-500/20 animate-pulse">Action Required</span>
                  )}
                </div>

                <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed italic font-medium">
                  <div className="absolute -top-3 -left-3 w-8 h-8 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-full flex items-center justify-center text-slate-300">"</div>
                  {msg.content}
                </div>

                {msg.isResponded ? (
                  <div className="mt-8 p-8 rounded-3xl bg-emerald-500/[0.03] dark:bg-emerald-500/5 border border-emerald-500/10 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-4">
                      <Shield className="w-4 h-4" /> Official Response
                    </div>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-emerald-100/80 leading-relaxed font-semibold">
                      {msg.trainerResponse}
                    </p>
                  </div>
                ) : (
                  <div className="mt-10 space-y-5">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Send className="w-3.5 h-3.5" /> Draft Official Reply
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">Press Cmd+Enter to send</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <textarea
                        value={replyText[msg._id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [msg._id]: e.target.value })}
                        placeholder="Provide your expert guidance here..."
                        className="flex-grow bg-slate-50 dark:bg-slate-950 border border-black/5 dark:border-white/10 rounded-2xl p-6 text-sm sm:text-base text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 min-h-[140px] transition-all resize-none shadow-inner"
                      />
                      <button
                        onClick={() => handleReply(msg._id)}
                        disabled={!replyText[msg._id]?.trim()}
                        className="sm:w-20 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:grayscale text-white rounded-2xl flex items-center justify-center transition-all group shrink-0 shadow-lg shadow-emerald-500/20 active:scale-95"
                      >
                        <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
