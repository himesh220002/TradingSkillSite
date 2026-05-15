"use client"

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { API_BASE_URL } from '@/lib/api-config';
import {
  Users,
  Search,
  UserPlus,
  X,
  Copy,
  Check,
  BookOpen,
  ShieldAlert,
  GraduationCap,
  ChevronDown,
  Phone,
  Calendar,
  ExternalLink,
  CreditCard,
  TrendingUp,
  User as UserIcon,
} from "lucide-react";
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useDebounce } from "@/hooks/use-debounce";

interface EnrolledBatch {
  _id: string;
  batchName: string;
  courseId: { 
    _id: string; 
    title: string; 
    price: number;
    bannerImage: string;
  };
  progressPercentage: number;
  status: string;
}

interface Student {
  _id: string;
  username: string;
  name?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  role: 'student' | 'admin';
  enrolledBatches: any[]; 
  createdAt: string;
}

interface Batch {
  _id: string;
  batchName: string;
  courseId: { title: string };
}

// Simple Cache Store
const cache: { students: Student[] | null, batches: Batch[] | null } = {
  students: null,
  batches: null
};

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>(cache.students || []);
  const [batches, setBatches] = useState<Batch[]>(cache.batches || []);
  const [loading, setLoading] = useState(!cache.students);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Profile modal state
  const [profileModal, setProfileModal] = useState<{ open: boolean; student: Student | null }>({ open: false, student: null });
  const [profileLoading, setProfileLoading] = useState(false);

  // Enroll modal state
  const [enrollModal, setEnrollModal] = useState<{ open: boolean; student: Student | null }>({ open: false, student: null });
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [enrollMsg, setEnrollMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAll = useCallback(async (force = false) => {
    if (!force && cache.students && cache.batches) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [usersRes, batchesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/auth/users`),
        fetch(`${API_BASE_URL}/api/batches`),
      ]);

      if (!usersRes.ok || !batchesRes.ok) throw new Error("Failed to fetch data");

      const users = await usersRes.json();
      const batchData = await batchesRes.json();
      
      setStudents(users);
      setBatches(batchData);
      
      // Update Cache
      cache.students = users;
      cache.batches = batchData;
    } catch (err) {
      setError("Network error: Could not reach the server. Please ensure the backend is running.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const fetchProfile = async (userId: string) => {
    setProfileLoading(true);
    setProfileModal({ open: true, student: null });
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/profile/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      setProfileModal({ open: true, student: data });
    } catch (err) {
      console.error(err);
    } finally {
      setProfileLoading(false);
    }
  };

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const openEnroll = (student: Student) => {
    setEnrollModal({ open: true, student });
    setSelectedBatchId(batches[0]?._id || '');
    setEnrollMsg(null);
  };

  const handleEnroll = async () => {
    if (!enrollModal.student || !selectedBatchId) return;
    setEnrolling(true);
    setEnrollMsg(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/batches/${selectedBatchId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: enrollModal.student._id }),
      });
      const data = await res.json();
      if (res.ok) {
        setEnrollMsg({ type: 'success', text: 'Student enrolled successfully!' });
        fetchAll(true); // Force refresh
        if (profileModal.student?._id === enrollModal.student._id) {
          fetchProfile(enrollModal.student._id);
        }
      } else {
        setEnrollMsg({ type: 'error', text: data.message || 'Enrollment failed.' });
      }
    } catch (err) {
      setEnrollMsg({ type: 'error', text: 'Network error.' });
    } finally {
      setEnrolling(false);
    }
  };

  const filtered = useMemo(() => {
    return students.filter(s =>
      s.username.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (s.name && s.name.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
      s._id.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [students, debouncedSearch]);

  if (error) return <ErrorState onRetry={() => fetchAll(true)} message={error} />;

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Student Records</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Search, manage enrollments, and view detailed student profiles.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-5 py-2.5 bg-emerald-500/10 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-sm">
            {loading ? <Skeleton className="h-4 w-20" /> : `${students.filter(s => s.role === 'student').length} Active Students`}
          </div>
        </div>
      </div>

      {/* Search Bar (Debounced) */}
      <div className="relative group max-w-2xl">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
        </div>
        <input
          type="text"
          placeholder="Search by name, username or User ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-16 pr-8 py-5 rounded-[2rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 shadow-sm outline-none ring-4 ring-transparent focus:ring-emerald-500/10 transition-all font-bold text-slate-700 dark:text-white"
        />
        {search !== debouncedSearch && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-xl shadow-emerald-500/5 relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="px-10 py-6">Student Information</th>
                <th className="px-10 py-6">Unique ID</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6">Enrolled Batches</th>
                <th className="px-10 py-6 text-right">Records</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td className="px-10 py-6"><div className="flex items-center gap-4"><Skeleton className="w-12 h-12 rounded-2xl" /><div className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></div></div></td>
                    <td className="px-10 py-6"><Skeleton className="h-8 w-32 rounded-xl" /></td>
                    <td className="px-10 py-6"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="px-10 py-6"><div className="flex gap-2"><Skeleton className="h-6 w-16" /><Skeleton className="h-6 w-16" /></div></td>
                    <td className="px-10 py-6 text-right"><Skeleton className="h-10 w-10 rounded-xl ml-auto" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-10 py-20 text-center text-slate-400 font-bold">No students matched your search criteria.</td></tr>
              ) : filtered.map(student => (
                <tr key={student._id} className="group hover:bg-slate-50 dark:hover:bg-emerald-500/[0.02] transition-all cursor-pointer" onClick={() => fetchProfile(student._id)}>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-black text-sm group-hover:scale-110 transition-transform duration-500">
                        {student.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">{student.name || student.username}</div>
                        <div className="text-xs text-slate-500 font-medium italic">@{student.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex items-center gap-2 group/copy" onClick={e => e.stopPropagation()}>
                      <code className="text-[11px] font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-slate-500 group-hover/copy:text-emerald-600 transition-colors">
                        {student._id.slice(0, 12)}…
                      </code>
                      <button onClick={() => copyId(student._id)}>
                        {copiedId === student._id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-300 opacity-0 group-hover/copy:opacity-100 transition-opacity" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-10 py-6">
                    <span className={cn(
                      "px-4 py-1.5 text-[10px] font-black rounded-full uppercase tracking-widest border",
                      student.role === 'admin' ? "bg-purple-500/5 text-purple-600 border-purple-500/20" : "bg-emerald-500/5 text-emerald-600 border-emerald-500/20"
                    )}>
                      {student.role}
                    </span>
                  </td>
                  <td className="px-10 py-6">
                    <div className="flex flex-wrap gap-2">
                      {student.enrolledBatches && student.enrolledBatches.length > 0 ? (
                        student.enrolledBatches.slice(0, 2).map(b => (
                          <span key={b._id} className="text-[10px] font-black bg-blue-500/10 text-blue-600 px-3 py-1 rounded-lg border border-blue-500/10 uppercase tracking-widest">
                            {b.batchName || "BATCH"}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">No Enrollments</span>
                      )}
                      {student.enrolledBatches && student.enrolledBatches.length > 2 && (
                        <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-lg">+{student.enrolledBatches.length - 2} More</span>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-6 text-right">
                    <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => openEnroll(student)}
                        className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                        title="Enroll in Batch"
                      >
                        <UserPlus className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Modal */}
      {profileModal.open && (
        <div className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] w-full max-w-5xl h-full max-h-[90vh] overflow-hidden flex flex-col relative shadow-2xl border border-black/10 dark:border-white/5">
            {/* Modal Header */}
            <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <UserIcon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Complete Student Profile</h2>
              </div>
              <button
                onClick={() => setProfileModal({ open: false, student: null })}
                className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-500 transition-all active:scale-95"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12">
              {profileLoading ? (
                <div className="space-y-12">
                  <div className="grid lg:grid-cols-3 gap-12">
                    <Skeleton className="h-64 rounded-[2.5rem]" />
                    <div className="lg:col-span-2 space-y-6">
                      <Skeleton className="h-40 rounded-[2.5rem]" />
                      <Skeleton className="h-40 rounded-[2.5rem]" />
                    </div>
                  </div>
                </div>
              ) : profileModal.student ? (
                <div className="grid lg:grid-cols-3 gap-12">
                  {/* Personal Info */}
                  <div className="space-y-10">
                    <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white dark:bg-slate-950 border border-white/5 text-center relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShieldAlert className="w-24 h-24" />
                      </div>
                      <div className="w-24 h-24 rounded-[2rem] bg-emerald-500 border-4 border-white/10 mx-auto flex items-center justify-center text-3xl font-black mb-6 shadow-xl shadow-emerald-500/20">
                        {profileModal.student.username[0].toUpperCase()}
                      </div>
                      <h3 className="text-2xl font-black leading-tight">{profileModal.student.name || profileModal.student.username}</h3>
                      <p className="text-emerald-400 text-xs font-black uppercase tracking-widest mt-1 italic">@{profileModal.student.username}</p>
                      
                      <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                        <code className="text-[10px] font-mono bg-white/5 px-4 py-2 rounded-xl text-slate-400">
                          ID: {profileModal.student._id}
                        </code>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <Calendar className="w-3.5 h-3.5" /> Registered {new Date(profileModal.student.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-800/50 border border-black/5 dark:border-white/5 space-y-6">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 border-b border-black/5 pb-4">Communication</h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 group/item">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover/item:bg-emerald-500/10 group-hover/item:text-emerald-500 transition-all">
                            <Phone className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">Phone</div>
                            <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{profileModal.student.phone || 'Not Provided'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 group/item">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover/item:bg-blue-500/10 group-hover/item:text-blue-500 transition-all">
                            <FaLinkedin className="w-4 h-4" />
                          </div>
                          <div className="flex-grow">
                            <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">LinkedIn</div>
                            <div className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[150px]">
                              {profileModal.student.linkedin ? <a href={profileModal.student.linkedin} target="_blank" className="hover:underline">{profileModal.student.linkedin.split('/').pop()}</a> : 'No Link'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 group/item">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover/item:bg-slate-900 group-hover/item:text-white transition-all">
                            <FaGithub className="w-4 h-4" />
                          </div>
                          <div className="flex-grow">
                            <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">GitHub</div>
                            <div className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[150px]">
                              {profileModal.student.github ? <a href={profileModal.student.github} target="_blank" className="hover:underline">{profileModal.student.github.split('/').pop()}</a> : 'No Link'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Academic & Financials */}
                  <div className="lg:col-span-2 space-y-10">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                          <GraduationCap className="w-6 h-6 text-emerald-500" /> Academic Journey
                        </h3>
                        <button 
                          onClick={() => { setProfileModal({ open: false, student: null }); openEnroll(profileModal.student!); }}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-emerald-500/20"
                        >
                          New Enrollment
                        </button>
                      </div>

                      {profileModal.student.enrolledBatches && profileModal.student.enrolledBatches.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-6">
                          {profileModal.student.enrolledBatches.map((batch: any) => (
                            <div key={batch._id} className="p-6 rounded-[2.5rem] bg-white dark:bg-slate-800/50 border border-black/5 dark:border-white/5 group hover:shadow-xl transition-all">
                              <div className="flex items-center justify-between mb-6">
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                  batch.status === 'Ongoing' ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600"
                                )}>
                                  {batch.status}
                                </span>
                                <TrendingUp className="w-5 h-5 text-emerald-500 opacity-20" />
                              </div>
                              <h5 className="font-black text-slate-900 dark:text-white text-lg leading-tight group-hover:text-emerald-500 transition-colors">
                                {batch.courseId?.title || 'Unknown Course'}
                              </h5>
                              <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">{batch.batchName}</p>
                              
                              <div className="mt-8 space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                  <span>Batch Progress</span>
                                  <span className="text-emerald-500">{batch.progressPercentage}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${batch.progressPercentage}%` }} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] text-center">
                          <BookOpen className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No active course records found.</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <CreditCard className="w-6 h-6 text-purple-500" /> Payment Records
                      </h3>
                      <div className="overflow-hidden rounded-[2.5rem] border border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/20">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-black/5 dark:border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-100/50 dark:bg-slate-800/50">
                              <th className="px-6 py-4">Transaction ID</th>
                              <th className="px-6 py-4">Course</th>
                              <th className="px-6 py-4">Amount</th>
                              <th className="px-6 py-4">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-black/5 dark:divide-white/5">
                            {profileModal.student.enrolledBatches?.map((batch: any) => (
                              <tr key={batch._id} className="text-xs">
                                <td className="px-6 py-4 font-mono text-[10px] text-slate-500 uppercase tracking-tighter">TRX_{batch._id.slice(0, 8)}</td>
                                <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">{batch.courseId?.title?.slice(0, 20)}...</td>
                                <td className="px-6 py-4 font-black text-slate-900 dark:text-white">${batch.courseId?.price || '0'}</td>
                                <td className="px-6 py-4">
                                  <span className="flex items-center gap-1.5 text-emerald-500 font-bold">
                                    <Check className="w-3.5 h-3.5" /> PAID
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className="p-8 border-t border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-end gap-4 shrink-0">
               <button 
                onClick={() => setProfileModal({ open: false, student: null })}
                className="px-10 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black uppercase tracking-widest hover:bg-emerald-500 dark:hover:bg-emerald-500 hover:text-white transition-all shadow-xl active:scale-95"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enroll Modal */}
      {enrollModal.open && enrollModal.student && (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 w-full max-w-lg shadow-2xl space-y-8 border border-black/5 dark:border-white/5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Enroll in Batch</h2>
                <p className="text-sm text-slate-500 mt-2 font-medium">
                  Adding <span className="font-bold text-emerald-500">@{enrollModal.student.username}</span> to a structured learning path.
                </p>
              </div>
              <button
                onClick={() => setEnrollModal({ open: false, student: null })}
                className="p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Student Record ID</label>
              <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-black/5 dark:border-white/5">
                <code className="text-xs font-mono text-slate-600 dark:text-slate-300 break-all">{enrollModal.student._id}</code>
                <button onClick={() => copyId(enrollModal.student!._id)} className="ml-auto p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all">
                  {copiedId === enrollModal.student._id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Select Batch Roadmap</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                  <BookOpen className="w-full h-full" />
                </div>
                <select
                  value={selectedBatchId}
                  onChange={e => setSelectedBatchId(e.target.value)}
                  className="w-full pl-16 pr-12 py-5 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold text-sm appearance-none ring-4 ring-transparent focus:ring-emerald-500/10 transition-all"
                >
                  {batches.map(b => (
                    <option key={b._id} value={b._id}>
                      {b.batchName} — {b.courseId?.title || 'Unmapped Course'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {enrollMsg && (
              <div className={cn(
                "px-6 py-4 rounded-2xl text-xs font-bold animate-in slide-in-from-bottom-2 duration-300",
                enrollMsg.type === 'success' ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
              )}>
                {enrollMsg.text}
              </div>
            )}

            <button
              onClick={handleEnroll}
              disabled={enrolling || !selectedBatchId}
              className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
            >
              {enrolling
                ? <><span className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin" /> Enrolling...</>
                : <><UserPlus className="w-5 h-5" /> Confirm Enrollment</>
              }
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
