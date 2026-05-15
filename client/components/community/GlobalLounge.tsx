"use client";

import React, { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '@/lib/api-config';
import { MessageCircle, Trophy, Users, ArrowRight, TrendingUp, Star, Send, CheckCircle2 } from 'lucide-react';

interface ChatMessage {
  _id: string;
  senderId: string;
  username: string;
  content: string;
  type: 'General' | 'Question' | 'TradeSetup';
  isResponded?: boolean;
  trainerResponse?: string;
  createdAt: string;
}

interface Limits {
  used: number;
  limit: number;
  charLimit: number;
}

export default function GlobalLounge() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [limits, setLimits] = useState<Limits | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState("Guest");
  const scrollRef = useRef<HTMLDivElement>(null);

  const API_BASE = `${API_BASE_URL}/api/community`;

  useEffect(() => {
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.id) {
        setUserId(parsed.id);
        if (parsed.username) setUsername(parsed.username);
      }
    }
    fetchGlobalMessages();
  }, []);

  useEffect(() => {
    if (userId && userId !== "64f1a2b3c4d5e6f7a8b9c0d1") {
      fetchLimits();
    }
  }, [userId]);

  const fetchLimits = async () => {
    try {
      const res = await fetch(`${API_BASE}/limits/${userId}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error(`Fetch Limits Error: ${res.status}`, errData);
        throw new Error(`Failed to fetch limits: ${res.status}`);
      }
      const data = await res.json();
      setLimits(data.global);
    } catch (error) {
      console.error("Error fetching limits:", error);
      // Fallback for mock/new users
      setLimits({ used: 0, limit: 5, charLimit: 400 });
    }
  };

  const fetchGlobalMessages = async () => {
    try {
      const res = await fetch(API_BASE);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data.reverse() : []);
    } catch (error) {
      console.error("Error fetching global messages:", error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !limits || newMessage.length > limits.charLimit || limits.used >= limits.limit) return;
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: userId,
          username,
          batchId: 'global',
          content: newMessage,
          type: 'General'
        })
      });
      if (res.ok) {
        const createdMsg = await res.json();
        setMessages(prev => [...prev, createdMsg]);
        setNewMessage("");
        fetchLimits(); // Update used count
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Welcome Hero - Responsive */}
      <div className="relative p-8 sm:p-14 rounded-[2.5rem] sm:rounded-[3rem] bg-gradient-to-br from-emerald-500/20 via-emerald-500/5 to-transparent border border-emerald-500/20 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-5 pointer-events-none">
          <Users className="w-48 h-48 sm:w-64 sm:h-64 text-emerald-400" />
        </div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] mb-4 sm:mb-6">
            <Star className="w-3 h-3 fill-emerald-400" /> Open Networking
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 sm:mb-6 tracking-tighter leading-none">Global Lounge</h2>
          <p className="text-slate-400 text-base sm:text-xl max-w-2xl leading-relaxed">
            The heartbeat of TradingXSkill. Connect with thousands of traders, share breakthroughs, and stay synced with institutional flow.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-10">
        {/* Discussion Chat Area - Taking 8 columns */}
        <div className="xl:col-span-8 flex flex-col h-[550px] sm:h-[750px] rounded-[2.5rem] bg-slate-900/40 border border-white/5 overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-black text-white flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-emerald-500" />
                Pulse Chat
              </h3>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Quota: <span className={(limits?.used ?? 0) >= (limits?.limit ?? 5) ? "text-red-500" : "text-emerald-500"}>{limits?.used ?? 0}/{limits?.limit ?? 5}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
            </div>
          </div>

          {/* Chat Messages */}
          <div 
            ref={scrollRef}
            className="flex-grow overflow-y-auto p-6 space-y-6 no-scrollbar"
          >
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-slate-600 font-black text-xs uppercase tracking-[0.3em] animate-pulse">
                Establishing connection...
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-600 font-black text-xs uppercase tracking-[0.3em]">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={msg._id} className={`flex gap-4 animate-in slide-in-from-bottom-2 duration-300 ${msg.senderId === userId ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center font-black text-xs uppercase ${msg.senderId === userId ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {msg.username[0]}
                  </div>
                  <div className={`max-w-[80%] space-y-1 ${msg.senderId === userId ? 'items-end' : ''}`}>
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[10px] font-bold text-white/50">{msg.username}</span>
                      <span className="text-[8px] text-white/20 uppercase">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className={`p-4 rounded-3xl text-sm ${msg.senderId === userId ? 'bg-emerald-500/20 border border-emerald-500/20 text-emerald-50' : 'bg-white/5 border border-white/5 text-slate-300'}`}>
                      {msg.content}
                    </div>
                    {msg.trainerResponse && (
                      <div className="mt-2 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-[10px] sm:text-xs text-blue-200 animate-in slide-in-from-top-1">
                        <div className="font-black uppercase tracking-widest text-blue-500 mb-1 flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3" /> Trainer Response
                        </div>
                        {msg.trainerResponse}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Input */}
          <div className="p-6 shrink-0 bg-slate-950/20 border-t border-white/5">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center px-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  {(limits?.used ?? 0) >= (limits?.limit ?? 5) ? "Limit Reached" : `${(limits?.limit ?? 5) - (limits?.used ?? 0)} messages left today`}
                </span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${newMessage.length > (limits?.charLimit ?? 400) ? "text-red-500" : "text-slate-500"}`}>
                  {newMessage.length}/{limits?.charLimit ?? 400} Characters
                </span>
              </div>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={(limits?.used ?? 0) >= (limits?.limit ?? 5)}
                  placeholder={(limits?.used ?? 0) >= (limits?.limit ?? 5) ? "Daily limit reached. Reset at 12AM." : "Type your message..."}
                  className="flex-grow bg-slate-900/60 border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={(limits?.used ?? 0) >= (limits?.limit ?? 5) || !newMessage.trim() || newMessage.length > (limits?.charLimit ?? 400)}
                  className="w-14 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl flex items-center justify-center transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-4 space-y-8">
          <div className="xl:sticky xl:top-28 space-y-8">
            <h3 className="text-xl font-black text-white flex items-center gap-3 px-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Top Gains
            </h3>
            
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-yellow-500/10 via-slate-900/40 to-slate-900/40 border border-yellow-500/20 shadow-xl">
              <h4 className="text-xs font-black text-yellow-500 uppercase tracking-[0.25em] mb-8">Profit Hall of Fame</h4>
              <div className="space-y-6">
                {[
                  { name: "Rahul Sharma", amount: "+₹45,200", batch: "Batch 02" },
                  { name: "Anjali Gupta", amount: "+₹12,400", batch: "Batch 05" },
                  { name: "Vikram Kohli", amount: "+₹89,000", batch: "Batch 01" },
                ].map((story, i) => (
                  <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-default">
                    <div className="min-w-0">
                      <div className="text-sm font-black text-white truncate">{story.name}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{story.batch}</div>
                    </div>
                    <div className="text-sm font-black text-emerald-400 shrink-0">{story.amount}</div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-white hover:bg-white/10 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                Post Your Breakthrough <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
