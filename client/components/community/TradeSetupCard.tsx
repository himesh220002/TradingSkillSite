"use client";

import React from 'react';
import { ThumbsUp, CheckCircle, MessageSquare, TrendingUp } from 'lucide-react';

interface TradeSetupCardProps {
  id: string;
  author: string;
  strategy: string;
  chartUrl: string;
  upvotes: number;
  comments: number;
  isVerified?: boolean;
  isTrending?: boolean;
  isUpvoted?: boolean;
  onUpvote?: () => void;
  userRole?: 'student' | 'trainer';
}

export function TradeSetupCard({
  author,
  strategy,
  chartUrl,
  upvotes,
  comments,
  isVerified,
  isTrending,
  isUpvoted,
  onUpvote,
  userRole
}: TradeSetupCardProps) {
  return (
    <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-emerald-500/50 transition-all duration-500 shadow-2xl flex flex-col h-full">
      {/* Chart Image Container */}
      <div className="relative h-56 w-full overflow-hidden shrink-0">
        <img 
          src={chartUrl} 
          alt="Trade Analysis" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-80" />
        
        {/* Badges */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          {isTrending && (
            <span className="flex items-center gap-2 bg-orange-500/20 backdrop-blur-md text-orange-400 text-[10px] font-black px-3 py-1.5 rounded-full border border-orange-500/30 uppercase tracking-widest">
              <TrendingUp className="w-3 h-3" />
              Trending
            </span>
          )}
          {isVerified && (
            <span className="flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md text-emerald-400 text-[10px] font-black px-3 py-1.5 rounded-full border border-emerald-500/30 uppercase tracking-widest">
              <CheckCircle className="w-3 h-3" />
              Trainer Verified
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-8 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="min-w-0">
            <h4 className="text-white font-black text-lg truncate">{author}</h4>
            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest block mt-1">{strategy}</span>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onUpvote?.();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all ${
                isUpvoted 
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
                : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:border-white/20'
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isUpvoted ? 'fill-emerald-400' : ''}`} />
              <span className="text-xs font-black">{userRole === 'trainer' ? (isVerified ? 'Toggle Unverify' : 'Verify & Upvote') : upvotes}</span>
            </button>
            <div className="flex items-center gap-2 text-slate-500">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-bold">{comments}</span>
            </div>
          </div>
          
          <button className="text-[10px] font-black text-white/30 hover:text-white transition-colors tracking-widest uppercase py-2">
            Details
          </button>
        </div>
      </div>
    </div>
  );
}
