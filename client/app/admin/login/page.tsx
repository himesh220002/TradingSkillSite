"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        if (data.message) {
          setSuccess(data.message);
          setTimeout(() => router.push('/admin'), 2000);
        } else {
          router.push('/admin');
        }
      } else {
        setError(data.message || 'Access denied.');
      }
    } catch (err) {
      setError('Connection failed. Is the server running?');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-black/5 dark:border-white/5 shadow-2xl shadow-emerald-500/10">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Security Check</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Enter password to access the dashboard.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin Password"
              className="w-full pl-14 pr-6 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm font-medium px-4 py-3 bg-red-500/10 rounded-xl">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-emerald-500 text-sm font-medium px-4 py-3 bg-emerald-500/10 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
              {success}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-[2rem] font-bold transition-all hover:scale-105 active:scale-95"
          >
            Verify Identity
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="mt-8 text-center">
          <button className="text-xs text-slate-400 hover:text-emerald-500 transition-colors">
            Forgot Master Password?
          </button>
        </div>
      </div>
    </div>
  );
}
