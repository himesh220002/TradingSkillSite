"use client"

import React, { useState } from 'react';
import { API_BASE_URL } from '@/lib/api-config';
import { ShieldCheck, Lock, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminSettings() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/change-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: 'Failed to update password.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Server connection error.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your administrative security and global configurations.</p>
      </div>

      <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 space-y-8">
        <div className="flex items-center gap-4 pb-6 border-b border-black/5 dark:border-white/5">
          <div className="p-3 bg-emerald-500/10 rounded-2xl">
            <Lock className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Security Settings</h2>
            <p className="text-xs text-slate-500">Update your administrative access password.</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-6">
          <div className="grid gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">New Password</label>
              <input 
                type="password" 
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password" 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Confirm New Password</label>
              <input 
                type="password" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password" 
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          {message.text && (
            <div className={cn(
              "flex items-center gap-2 text-sm font-medium px-4 py-3 rounded-xl",
              message.type === 'success' ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"
            )}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {message.text}
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      <div className="p-8 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-6">
        <div className="p-4 bg-emerald-500/10 rounded-3xl">
          <ShieldCheck className="w-8 h-8 text-emerald-500" />
        </div>
        <div>
          <h3 className="font-bold text-emerald-600 dark:text-emerald-400">Master Password Recovery</h3>
          <p className="text-sm text-slate-500 max-w-sm mt-1">If you forget your password, use your master password at the login screen to automatically reset it to <span className="font-mono font-bold text-slate-900 dark:text-white">admin123</span>.</p>
        </div>
      </div>
    </div>
  );
}

