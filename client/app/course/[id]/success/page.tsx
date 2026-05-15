"use client"

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { 
  CheckCircle2, 
  ArrowRight, 
  Download, 
  Share2, 
  Ticket as TicketIcon,
  Calendar,
  User,
  Hash,
  ArrowLeft
} from "lucide-react";
import Link from 'next/link';

export default function SuccessPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const enrollmentId = searchParams.get('enrollmentId');
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, fetch enrollment details from server
    // For now, we'll mock it based on the ID or just show a success state
    setTimeout(() => setLoading(false), 1500);
  }, [enrollmentId]);

  const isManual = searchParams.get('manual') === 'true';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 transition-colors duration-500 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-emerald-500/5 blur-[120px] rounded-full -mt-40" />
      
      <div className="max-w-2xl mx-auto relative z-10">
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 rounded-full text-white shadow-2xl shadow-emerald-500/40 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">
            {isManual ? 'Request' : 'Enrollment'} <span className="text-emerald-500">{isManual ? 'Received' : 'Confirmed!'}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {isManual 
              ? 'Your manual payment request has been received. Please send the transaction screenshot to the admin for verification.' 
              : 'Welcome to the community. Your seat is reserved and your learning journey begins now.'}
          </p>
        </div>

        {/* The Ticket Visual */}
        <div className="relative group perspective-1000">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden border border-black/5 dark:border-white/5 relative">
            {/* Ticket Cutouts */}
            <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 bg-slate-50 dark:bg-slate-950 rounded-full border border-black/5 dark:border-white/5 shadow-inner" />
            <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 bg-slate-50 dark:bg-slate-950 rounded-full border border-black/5 dark:border-white/5 shadow-inner" />
            
            {/* Ticket Header */}
            <div className="p-10 border-b-2 border-dashed border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  Official Admission Ticket
                </div>
                <TicketIcon className="w-6 h-6 text-slate-300" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">
                Trading Masterclass <br />Institutional Grade
              </h2>
            </div>

            {/* Ticket Content */}
            <div className="p-10 grid grid-cols-2 gap-y-8">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <User className="w-3 h-3" /> Student
                </div>
                <div className="font-bold text-slate-900 dark:text-white">Krishna Sharma</div>
              </div>
              <div className="space-y-1 text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 justify-end">
                  <Hash className="w-3 h-3" /> Enrollment ID
                </div>
                <div className="font-mono text-xs font-bold text-slate-900 dark:text-white uppercase">
                  {enrollmentId?.substring(0, 12) || 'ENR-TRD-4921'}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Assigned Batch
                </div>
                <div className="font-bold text-emerald-500">Jan 2026 - Alpha</div>
              </div>
              <div className="space-y-1 text-right">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 justify-end">
                  Status
                </div>
                <div className={`font-bold uppercase text-xs tracking-widest ${isManual ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {isManual ? 'Pending' : 'Active'}
                </div>
              </div>
            </div>

            {/* QR Code Placeholder */}
            <div className="p-10 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col items-center gap-4">
              <div className="w-24 h-24 bg-white p-2 rounded-xl border border-black/5">
                 <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://trading-platform.com/verify/123" className="w-full h-full grayscale opacity-80" />
              </div>
              <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Scan to Verify Credentials</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <Link 
            href="/my-learning" 
            className="flex-grow flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-8 py-5 rounded-[2rem] font-black transition-all shadow-xl shadow-emerald-500/20"
          >
            Go to My Dashboard <ArrowRight className="w-5 h-5" />
          </Link>
          <button className="flex items-center justify-center gap-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-black/5 dark:border-white/5 px-8 py-5 rounded-[2rem] font-bold transition-all hover:bg-slate-100 dark:hover:bg-slate-800">
            <Download className="w-5 h-5" /> Save Ticket
          </button>
        </div>

        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-emerald-500 transition-colors text-xs font-bold uppercase tracking-widest">
            <ArrowLeft className="w-3 h-3" /> Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
