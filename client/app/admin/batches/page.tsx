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
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Batch {
  _id: string;
  courseId: { title: string };
  batchName: string;
  studentCount: number;
  startDate: string;
  status: string;
  progressPercentage: number;
  trainer: string;
}

export default function AdminBatches() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Batch Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Track student progress, timings, and curriculum completion.</p>
        </div>
        <Link
          href="/admin/batches/new"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          Create New Batch
        </Link>
      </div>

      {/* Batches Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-8 py-5">Batch Details</th>
                <th className="px-8 py-5">Batch ID</th>
                <th className="px-8 py-5">Course</th>
                <th className="px-8 py-5">Students</th>
                <th className="px-8 py-5">Progress</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-10 text-center text-slate-400">Loading batches...</td>
                </tr>
              ) : batches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-10 text-center text-slate-400">No active batches found.</td>
                </tr>
              ) : batches.map((batch) => (
                <tr key={batch._id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{batch.batchName}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      Starts: {new Date(batch.startDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button onClick={() => copyId(batch._id)} className="flex items-center gap-1.5 group/bid">
                      <code className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-500 group-hover/bid:text-emerald-600 transition-colors">
                        {batch._id.slice(0, 8)}…
                      </code>
                      {copiedId === batch._id
                        ? <Check className="w-3 h-3 text-emerald-500" />
                        : <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover/bid:opacity-100 transition-opacity" />}
                    </button>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{batch.courseId?.title || 'Unknown Course'}</div>
                    <button onClick={() => copyId((batch.courseId as any)?._id || '')} className="flex items-center gap-1 group/cid mt-0.5">
                      <code className="text-[10px] font-mono text-slate-400 group-hover/cid:text-emerald-500 transition-colors">
                        ID: {((batch.courseId as any)?._id || '').slice(0, 8)}
                      </code>
                      {copiedId === (batch.courseId as any)?._id
                        ? <Check className="w-3 h-3 text-emerald-500" />
                        : <Copy className="w-3 h-3 text-slate-300 opacity-0 group-hover/cid:opacity-100" />}
                    </button>
                    <div className="text-[10px] text-emerald-500 font-bold mt-0.5">{batch.trainer}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <UsersIcon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{batch.studentCount}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="w-32">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-emerald-500">{batch.progressPercentage}%</span>
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                          style={{ width: `${batch.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider",
                      batch.status === 'Ongoing' ? "bg-emerald-500/10 text-emerald-600" :
                        batch.status === 'Upcoming' ? "bg-blue-500/10 text-blue-600" :
                          batch.status === 'Completed' ? "bg-slate-500/10 text-slate-600" : "bg-red-500/10 text-red-600"
                    )}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/admin/batches/${batch._id}`}
                        className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-emerald-500 rounded-xl transition-all"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => deleteBatch(batch._id)}
                        className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 rounded-xl transition-all"
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
