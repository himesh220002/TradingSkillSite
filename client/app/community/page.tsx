"use client";

import React, { useEffect, useState } from 'react';
import GlobalLounge from '@/components/community/GlobalLounge';
import BatchWarRoom from '@/components/community/BatchWarRoom';
import { Sparkles, Users, Lock, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api-config';

export default function CommunityPage() {
  const [activeMode, setActiveMode] = useState<'global' | 'batch'>('global');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userBatchId, setUserBatchId] = useState<string | undefined>();
  const [enrolledBatches, setEnrolledBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const storedUser = localStorage.getItem('userData');
      if (!storedUser) {
        setIsLoading(false);
        return;
      }
      const parsed = JSON.parse(storedUser);
      
      const res = await fetch(`${API_BASE_URL}/api/auth/profile/${parsed.id}`);
      if (!res.ok) throw new Error("Failed profile fetch");
      const data = await res.json();
      
      if (data.enrolledBatches && data.enrolledBatches.length > 0) {
        setIsEnrolled(true);
        setEnrolledBatches(data.enrolledBatches);
      }
    } catch (error) {
      console.error("Profile error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-20 px-4 md:px-8">
      {/* Background Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-6">
            <Sparkles className="w-3 h-3" />
            TradingXSkill Ecosystem
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tighter mb-6 leading-[0.9]">
            Community <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Pulse</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-xl font-medium max-w-3xl leading-relaxed">
            From global networking to batch-locked precision. Choose your arena and start growing with fellow traders.
          </p>
        </header>

        {/* Selection Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-12">
          <div
            onClick={() => setActiveMode('global')}
            role="button"
            tabIndex={0}
            className={`group relative p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] text-left transition-all duration-500 border cursor-pointer overflow-hidden ${activeMode === 'global'
                ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20 shadow-2xl shadow-emerald-500/10'
                : 'bg-slate-900/40 border-white/5 hover:border-white/10'
              }`}
          >
            <div className="relative z-10">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 transition-colors ${activeMode === 'global' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-400 group-hover:text-white'
                }`}>
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">Global Lounge</h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">Open for all traders. General discussions and success stories.</p>
            </div>
          </div>

          <div
            onClick={() => setActiveMode('batch')}
            role="button"
            tabIndex={0}
            className={`group relative p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] text-left transition-all duration-500 border cursor-pointer overflow-hidden ${activeMode === 'batch'
                ? 'bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20 shadow-2xl shadow-blue-500/10'
                : 'bg-slate-900/40 border-white/5 hover:border-white/10'
              }`}
          >
            <div className="relative z-10">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 transition-colors ${activeMode === 'batch' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-slate-400 group-hover:text-white'
                }`}>
                <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">Batch War Rooms</h3>
                {userBatchId && activeMode === 'batch' && (
                  <button onClick={(e) => { e.stopPropagation(); setUserBatchId(undefined); }} className="text-[10px] text-blue-400 font-black uppercase tracking-widest hover:text-white transition-colors">Change Batch</button>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">Exclusive for enrolled students. Q&A and trade log verification.</p>
            </div>
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="relative min-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeMode === 'global' ? (
            <GlobalLounge />
          ) : !isEnrolled ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 rounded-[3rem] bg-slate-900/40 border border-white/5 text-center">
              <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mb-8">
                <Lock className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-2xl font-black text-white mb-4">Enrolled Access Only</h3>
              <p className="text-slate-400 max-w-md mb-8">
                Batch War Rooms are exclusive learning environments for TradingXSkill students. Enroll in a batch to unlock your private community.
              </p>
              <button className="group flex items-center gap-3 px-8 py-4 bg-white text-black font-black rounded-2xl hover:scale-105 transition-transform">
                Explore Courses <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : userBatchId ? (
            <BatchWarRoom batchId={userBatchId} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in-95 duration-700">
              {enrolledBatches.map((batch) => (
                <button
                  key={batch._id}
                  onClick={() => setUserBatchId(batch._id)}
                  className="group p-8 rounded-[2.5rem] bg-slate-900/40 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-left relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />
                  <div className="relative z-10">
                    <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-4">Enrolled Batch</div>
                    <h4 className="text-2xl font-black text-white mb-2 group-hover:text-blue-400 transition-colors">{batch.batchName}</h4>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{batch.courseId?.title}</p>
                    <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-white uppercase tracking-widest group-hover:gap-4 transition-all">
                      Enter War Room <ChevronRight className="w-3 h-3 text-blue-500" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
