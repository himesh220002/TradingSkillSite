"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  Users as UsersIcon,
  TrendingUp,
  Copy,
  Check,
  Save,
  X,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Batch {
  _id: string;
  courseId: { _id: string; title: string };
  batchName: string;
  studentCount: number;
  maxStudents: number;
  startDate: string;
  status: string;
  progressPercentage: number;
  trainer: string;
}

export default function AdminBatches() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDateId, setEditingDateId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(50);
  const [editDateValue, setEditDateValue] = useState<string>('');

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/batches');
      const data = await response.json();
      setBatches(data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBatchField = async (id: string, field: string, value: any) => {
    try {
      const response = await fetch(`http://localhost:5000/api/batches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      if (response.ok) {
        setBatches(batches.map(b => b._id === id ? { ...b, [field]: value } : b));
        setEditingId(null);
        setEditingDateId(null);
        // Refresh batches to see auto-updated status
        fetchBatches();
      }
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
    }
  };

  const deleteBatch = async (id: string) => {
    if (!confirm('Are you sure you want to delete this batch?')) return;
    try {
      await fetch(`http://localhost:5000/api/batches/${id}`, { method: 'DELETE' });
      setBatches(batches.filter(b => b._id !== id));
    } catch (error) {
      console.error('Error deleting batch:', error);
    }
  };

  return (
    <div className="space-y-8 p-8 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Batch <span className="text-emerald-500">Command Center</span></h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage institutional scaling, student capacity, and curriculum progression.</p>
        </div>
        <Link
          href="/admin/batches/new"
          className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Create New Batch
        </Link>
      </div>

      {/* Batches Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-2xl shadow-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-6">Batch Details</th>
                <th className="px-4 py-6">ID Reference</th>
                <th className="px-4 py-6">Linked Course</th>
                <th className="px-4 py-6">Seat Capacity</th>
                <th className="px-4 py-6">Completion</th>
                <th className="px-4 py-6">Live Status</th>
                <th className="px-4 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center">
                    <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Infrastructure...</p>
                  </td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-20 text-center text-slate-400 font-medium italic">No active batches found in the system.</td>
                </tr>
              ) : batches.map((batch) => (
                <tr key={batch._id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                  <td className="px-6 py-6">
                    <div className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors leading-tight">{batch.batchName}</div>

                    {editingDateId === batch._id ? (
                      <div className="flex items-center gap-2 mt-2 animate-in fade-in slide-in-from-left-2">
                        <input
                          type="date"
                          value={editDateValue}
                          onChange={(e) => setEditDateValue(e.target.value)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border-none rounded-lg text-[10px] font-black text-emerald-500 outline-none focus:ring-2 focus:ring-emerald-500/20"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && updateBatchField(batch._id, 'startDate', editDateValue)}
                        />
                        <button onClick={() => updateBatchField(batch._id, 'startDate', editDateValue)} className="p-1.5 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all">
                          <Check className="w-3 h-3" />
                        </button>
                        <button onClick={() => setEditingDateId(null)} className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-500 rounded-lg hover:bg-slate-300 transition-all">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingDateId(batch._id); setEditDateValue(new Date(batch.startDate).toISOString().split('T')[0]); }}
                        className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 mt-1 hover:text-emerald-500 transition-colors group/date"
                      >
                        <Calendar className="w-3 h-3 group-hover/date:animate-bounce" />
                        Starts: {new Date(batch.startDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                        <Edit2 className="w-2.5 h-2.5 opacity-40 group-hover/date:opacity-100 ml-1" />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-6">
                    <button onClick={() => copyId(batch._id)} className="flex items-center gap-2 group/bid">
                      <code className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-slate-500 group-hover/bid:text-emerald-600 transition-all border border-transparent group-hover/bid:border-emerald-500/20 shadow-sm">
                        {batch._id.slice(-6).toUpperCase()}
                      </code>
                      {copiedId === batch._id
                        ? <Check className="w-3 h-3 text-emerald-500" />
                        : <Copy className="w-3 h-3 text-slate-400 opacity-40 group-hover/bid:opacity-100 transition-all" />}
                    </button>
                  </td>
                  <td className="px-4 py-6">
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300 line-clamp-1">{batch.courseId?.title || 'Unknown Course'}</div>
                    <div className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-1 opacity-70 flex items-center gap-1.5">
                      <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                      {batch.trainer}
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    {editingId === batch._id ? (
                      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(parseInt(e.target.value))}
                          className="w-16 px-3 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm font-black text-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && updateBatchField(batch._id, 'maxStudents', editValue)}
                        />
                        <button onClick={() => updateBatchField(batch._id, 'maxStudents', editValue)} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-all">
                          <Check className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingId(batch._id); setEditValue(batch.maxStudents || 50); }}
                        className="flex flex-col items-start gap-1 group/cap text-left"
                      >
                        <div className="flex items-center gap-2">
                          <UsersIcon className="w-4 h-4 text-slate-400 group-hover/cap:text-emerald-500 transition-colors" />
                          <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                            {batch.studentCount} / <span className="text-emerald-500">{batch.maxStudents || 50}</span>
                          </span>
                        </div>
                        <div className="text-[8px] font-black uppercase text-slate-400 tracking-[0.1em]">Enrolled / Limit</div>
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-6">
                    <div className="w-28">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black text-emerald-500">{batch.progressPercentage}%</span>
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-[1px]">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-sm"
                          style={{ width: `${batch.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-6">
                    <div className="flex flex-col gap-1.5">
                      <span className={cn(
                        "px-3 py-1 text-[9px] font-black rounded-full uppercase tracking-widest shadow-sm w-fit inline-block",
                        batch.status === 'Ongoing' ? "bg-emerald-500 text-white shadow-emerald-500/20" :
                          batch.status === 'Upcoming' ? "bg-blue-500 text-white shadow-blue-500/20" :
                            batch.status === 'Completed' ? "bg-slate-500 text-white" : "bg-red-500 text-white shadow-red-500/20"
                      )}>
                        {batch.status}
                      </span>
                      {new Date(batch.startDate) <= new Date() && batch.status === 'Upcoming' && (
                        <div className="text-[8px] font-black text-amber-500 uppercase flex items-center gap-1 animate-pulse">
                          <Clock className="w-2 h-2" /> Needs Start
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <Link
                        href={`/admin/batches/${batch._id}`}
                        className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-emerald-500 rounded-xl transition-all shadow-sm border border-black/5 dark:border-white/5"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => deleteBatch(batch._id)}
                        className="p-3 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-xl transition-all shadow-sm border border-black/5 dark:border-white/5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
