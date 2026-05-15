"use client";

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api-config';
import { Shield, MessageCircle, BarChart3, Users, Search, Filter, ThumbsUp, CheckCircle, Plus, Send, X } from 'lucide-react';
import { TradeSetupCard } from './TradeSetupCard';

interface Message {
  _id: string;
  senderId: string;
  username: string;
  content: string;
  type: 'General' | 'Question' | 'TradeSetup';
  upvotes: string[];
  isResponded?: boolean;
  trainerResponse?: string;
  isVerified?: boolean;
  createdAt: string;
  strategy?: string;
  chartUrl?: string;
  batchId?: string;
}

interface Limits {
  used: number;
  limit: number;
  charLimit: number;
}

export default function BatchWarRoom({ batchId: propBatchId }: { batchId?: string }) {
  const [activeTab, setActiveTab] = useState<'qa' | 'tradelogs'>('qa');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<'student' | 'trainer'>('student'); 
  const [isDoubtModalOpen, setIsDoubtModalOpen] = useState(false);
  const [newDoubt, setNewDoubt] = useState("");
  const [limits, setLimits] = useState<Limits | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState("Guest");
  
  const batchId = propBatchId || "69fdbaf789ce51284d91d989"; // Use prop or fallback to a real ID
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
    fetchMessages();
  }, [batchId]);

  useEffect(() => {
    if (userId && userId !== "64f1a2b3c4d5e6f7a8b9c0d1") {
      fetchLimits();
    }
  }, [userId, batchId]);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_BASE}/${batchId}`);
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLimits = async () => {
    try {
      const res = await fetch(`${API_BASE}/limits/${userId}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error(`Batch Limits Error: ${res.status}`, errData);
        throw new Error("Failed limits");
      }
      const data = await res.json();
      setLimits(data.batch);
    } catch (error) {
      setLimits({ used: 0, limit: 5, charLimit: 500 });
    }
  };

  const handleUpvote = async (id: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`${API_BASE}/${id}/upvote`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        const updatedMsg = await res.json();
        setMessages(prev => prev.map(m => m._id === id ? updatedMsg : m));
      }
    } catch (error) {
      console.error("Error upvoting:", error);
    }
  };

  const handleAskDoubt = async () => {
    if (!newDoubt.trim() || !limits || newDoubt.length > limits.charLimit || limits.used >= limits.limit) return;
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: userId,
          username,
          batchId,
          content: newDoubt,
          type: 'Question'
        })
      });
      if (res.ok) {
        const createdMsg = await res.json();
        setMessages(prev => [createdMsg, ...prev]);
        setNewDoubt("");
        setIsDoubtModalOpen(false);
        fetchLimits();
      } else {
        const err = await res.json();
        alert(err.message);
      }
    } catch (error) {
      console.error("Error posting doubt:", error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Info - Responsive Stack */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6 sm:p-8 rounded-[2rem] bg-slate-800/40 border border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
          <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-2xl sm:rounded-3xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
          </div>
          <div className="min-w-0 flex-grow">
            <h2 className="text-xl sm:text-2xl font-black text-white truncate">Batch 08: Elite Warriors</h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-slate-500 text-[10px] sm:text-xs mt-1">
              <span className="flex items-center gap-1 shrink-0"><Users className="w-3 h-3" /> 42 Enrolled</span>
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-slate-700" />
              <span className="text-emerald-500 font-bold uppercase tracking-wider">Active Room</span>
              <button 
                onClick={() => setUserRole(prev => prev === 'student' ? 'trainer' : 'student')}
                className="px-2 py-0.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                View: {userRole}
              </button>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex w-full lg:w-auto p-1 bg-slate-950/50 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
          {[
            { id: 'qa', label: 'Q&A Thread', icon: MessageCircle },
            { id: 'tradelogs', label: 'Trade Logs', icon: BarChart3 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id 
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                : 'text-slate-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[400px]">
        {activeTab === 'qa' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search previous doubts..." 
                    className="w-full bg-slate-900/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                </div>
                <div className="flex gap-3 sm:gap-4">
                  <div className="flex-1 sm:flex-none flex items-center justify-center px-4 rounded-2xl bg-white/5 border border-white/5 text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                     Used: <span className={(limits?.used ?? 0) >= (limits?.limit ?? 5) ? "text-red-500 ml-2" : "text-emerald-500 ml-2"}>{limits?.used ?? 0}/{limits?.limit ?? 5}</span>
                  </div>
                  <button 
                    onClick={() => setIsDoubtModalOpen(true)}
                    disabled={(limits?.used ?? 0) >= (limits?.limit ?? 5)}
                    className="flex-grow sm:flex-none px-6 sm:px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white text-[10px] sm:text-xs font-black rounded-2xl uppercase tracking-widest transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 active:scale-95"
                  >
                    Ask Doubt
                  </button>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {isLoading ? (
                <div className="py-20 text-center text-slate-500 animate-pulse uppercase tracking-widest font-black text-xs">
                  Syncing with Knowledge Base...
                </div>
              ) : messages.filter(m => m.type === 'Question').length === 0 ? (
                <div className="py-20 text-center text-slate-500 uppercase tracking-widest font-black text-xs">
                  No doubts recorded yet. Be the first!
                </div>
              ) : (
                messages.filter(m => m.type === 'Question').map((msg) => (
                  <div key={msg._id} className="p-5 sm:p-8 rounded-[2rem] bg-slate-900/40 border border-white/5 hover:border-white/10 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 shrink-0 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-black text-blue-400 text-xs uppercase">
                          {msg.username[0]}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-white font-bold text-sm truncate">{msg.username}</h4>
                          <span className="text-[10px] text-slate-500 font-medium">Shared on {new Date(msg.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      {msg.isResponded ? (
                        <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[8px] sm:text-[10px] font-black uppercase tracking-tighter border border-emerald-500/20">Answered</span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-[8px] sm:text-[10px] font-black uppercase tracking-tighter border border-orange-500/20">Awaiting Expert Review</span>
                      )}
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{msg.content}</p>
                      
                      {msg.trainerResponse && (
                        <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-100 animate-in slide-in-from-top-2">
                           <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">
                             <Shield className="w-3 h-3" /> Expert Feedback
                           </div>
                           {msg.trainerResponse}
                        </div>
                      )}
                    
                    <div className="mt-8 sm:pl-14 flex flex-wrap items-center gap-4">
                      <button 
                        onClick={() => handleUpvote(msg._id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${
                          userId && msg.upvotes.includes(userId) 
                          ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                          : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        <ThumbsUp className={`w-3 h-3 ${userId && msg.upvotes.includes(userId) ? 'fill-emerald-400' : ''}`} /> 
                        {userRole === 'trainer' ? (msg.isVerified ? 'Undo Respond' : 'Mark Responded') : 'Upvote'} ({msg.upvotes.length})
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'tradelogs' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-xl font-black text-white">Daily Analysis Floor</h3>
              <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black rounded-2xl uppercase tracking-widest transition-all">
                <Plus className="w-4 h-4" /> Share Chart
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-in zoom-in-95 duration-500">
              {messages.filter(m => m.type === 'TradeSetup').map((msg) => (
                <TradeSetupCard 
                  key={msg._id}
                  id={msg._id}
                  author={msg.username}
                  strategy={msg.strategy || 'General'}
                  chartUrl={msg.chartUrl || ''}
                  upvotes={msg.upvotes.length}
                  comments={0}
                  isVerified={msg.isVerified}
                  onUpvote={() => handleUpvote(msg._id)}
                  isUpvoted={userId ? msg.upvotes.includes(userId) : false}
                  userRole={userRole}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Doubt Modal */}
      {isDoubtModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-xl bg-slate-900 border border-white/10 rounded-[2.5rem] p-6 sm:p-10 shadow-2xl overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl -z-10" />
             
             <div className="flex justify-between items-center mb-8">
               <div>
                 <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Ask Your Doubt</h3>
                 <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Quota: {limits?.used ?? 0}/{limits?.limit ?? 5} used today</p>
               </div>
               <button onClick={() => setIsDoubtModalOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                 <X className="w-6 h-6 text-slate-500" />
               </button>
             </div>

             <div className="relative">
               <textarea
                 value={newDoubt}
                 onChange={(e) => setNewDoubt(e.target.value)}
                 disabled={(limits?.used ?? 0) >= (limits?.limit ?? 5)}
                 placeholder={(limits?.used ?? 0) >= (limits?.limit ?? 5) ? "Daily limit reached." : "Describe your doubt in detail..."}
                 className="w-full h-40 bg-slate-950/50 border border-white/5 rounded-3xl p-6 text-sm sm:text-base text-white focus:outline-none focus:border-blue-500/50 transition-colors resize-none mb-2 disabled:opacity-50"
               />
               <div className={`text-[10px] font-black uppercase tracking-widest text-right ${newDoubt.length > (limits?.charLimit ?? 500) ? "text-red-500" : "text-slate-600"}`}>
                 {newDoubt.length}/{limits?.charLimit ?? 500} Characters
               </div>
             </div>

             <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
               <button 
                 onClick={() => setIsDoubtModalOpen(false)}
                 className="px-8 py-4 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={handleAskDoubt}
                 disabled={(limits?.used ?? 0) >= (limits?.limit ?? 5) || !newDoubt.trim() || newDoubt.length > (limits?.charLimit ?? 500)}
                 className="px-10 py-4 bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-black rounded-2xl uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
               >
                 Submit Question <Send className="w-3 h-3" />
               </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
