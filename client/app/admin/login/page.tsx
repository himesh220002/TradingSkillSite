"use client"

import React, { useState } from 'react';
import { API_BASE_URL } from '@/lib/api-config';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Access Granted. Redirecting...');
        localStorage.setItem('adminToken', data.token);
        setTimeout(() => router.push('/admin'), 1500);
      } else {
        setError(data.message || 'Incorrect Admin Password');
      }
    } catch (err) {
      setError('Connection failed. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 mb-6 shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)]">
            <ShieldCheck className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">Admin <span className="text-emerald-500">Gateway</span></h1>
          <p className="text-slate-500 text-sm mt-2 font-medium tracking-wide uppercase">Institutional access only</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[1.5rem] md:rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
          {/* Decorative gradients */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[80px] rounded-full group-hover:bg-emerald-500/20 transition-all duration-700" />

          <form onSubmit={handleLogin} className="relative z-10 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-500 uppercase tracking-widest ml-4">Terminal Password</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900/50 border-2 border-white/5 focus:border-emerald-500/50 rounded-2xl py-4 pl-14 pr-6 text-white placeholder:text-slate-700 outline-none transition-all font-mono"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-slate-950 hover:bg-emerald-500 hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-950 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all group/btn active:scale-95"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Establish Connection
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">
          Secure Terminal v2.0.4 • 256-bit Encryption
        </p>
      </div>
    </div>
  );
}
