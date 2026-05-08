"use client"

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  TrendingUp,
  Users,
  Calendar,
  ExternalLink,
  UserPlus,
  UserMinus,
  Search,
  Copy,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import Link from 'next/link';
import { cn } from "@/lib/utils";

interface Topic {
  topicId: string;
  name: string;
  sectionName?: string;
  isCompleted: boolean;
  completionDate?: string;
}

interface EnrolledStudent {
  _id: string;
  username: string;
  role: string;
}

interface Batch {
  _id: string;
  courseId: { _id: string; title: string };
  batchName: string;
  studentCount: number;
  students: EnrolledStudent[];
  startDate: string;
  status: string;
  trainer: string;
  meetingLink: string;
  progressPercentage: number;
  topicProgress: Topic[];
  practicalCount: number;
  testsConducted: number;
  assignmentsDue: number;
}

interface AllUser {
  _id: string;
  username: string;
  role: string;
}

export default function BatchDetails() {
  const { id } = useParams();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<AllUser[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [addingUserId, setAddingUserId] = useState('');
  const [addMsg, setAddMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  useEffect(() => { fetchBatch(); fetchUsers(); }, [id]);

  const fetchBatch = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/batches/${id}`);
      const data = await res.json();
      setBatch(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/users');
      const data = await res.json();
      setAllUsers(data.filter((u: AllUser) => u.role === 'student'));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTopic = async (topicId: string, currentState: boolean) => {
    try {
      const res = await fetch(`http://localhost:5000/api/batches/${id}/topic/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !currentState }),
      });
      const updated = await res.json();
      setBatch(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const addStudent = async (userId: string) => {
    setAddMsg(null);
    try {
      const res = await fetch(`http://localhost:5000/api/batches/${id}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        setBatch(data);
        setUserSearch('');
        setAddMsg({ type: 'success', text: 'Student added to batch.' });
      } else {
        setAddMsg({ type: 'error', text: data.message || 'Failed to add student.' });
      }
    } catch (err) {
      setAddMsg({ type: 'error', text: 'Network error.' });
    }
    setTimeout(() => setAddMsg(null), 3000);
  };

  const removeStudent = async (userId: string) => {
    if (!confirm('Remove this student from the batch?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/batches/${id}/students/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) setBatch(data);
    } catch (err) {
      console.error(err);
    }
  };

  const copyId = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(val);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  // Group topics by section
  const groupedTopics = batch?.topicProgress?.reduce((acc: Record<string, Topic[]>, topic) => {
    const section = topic.sectionName || 'General';
    if (!acc[section]) acc[section] = [];
    acc[section].push(topic);
    return acc;
  }, {}) || {};

  // Users not already enrolled
  const enrolledIds = new Set(batch?.students?.map(s => s._id) ?? []);
  const availableUsers = allUsers.filter(u =>
    !enrolledIds.has(u._id) &&
    (u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u._id.toLowerCase().includes(userSearch.toLowerCase()))
  );

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!batch) return <div className="text-center py-20 text-slate-500">Batch not found.</div>;

  return (
    <div className="space-y-8 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/batches" className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 text-slate-500 hover:text-emerald-500 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-none">{batch.batchName}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{batch.courseId?.title}</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <button onClick={() => copyId(batch._id)} className="flex items-center gap-1 group/b">
                <code className="text-[10px] font-mono text-slate-400 group-hover/b:text-emerald-500 transition-colors">
                  ID: {batch._id.slice(0, 8)}…
                </code>
                {copiedId === batch._id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-300 group-hover/b:text-emerald-500" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={cn(
            "px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]",
            batch.status === 'Ongoing' ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
          )}>{batch.status}</span>
          {batch.meetingLink && (
            <a href={batch.meetingLink} target="_blank" className="p-3 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column: Progress + Stats */}
        <div className="lg:col-span-1 space-y-8">
          {/* Progress Card */}
          <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> Batch Progress
            </h3>
            <div className="space-y-6">
              <div className="flex items-end justify-between">
                <span className="text-5xl font-black text-emerald-500 leading-none">{batch.progressPercentage}%</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Complete</span>
              </div>
              <div className="h-5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  style={{ width: `${batch.progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                The checklist automatically updates this progress bar based on marked subtopics.
              </p>
            </div>
          </div>

          {/* Operational Tracking */}
          <div className="p-10 rounded-[3rem] bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 space-y-8 shadow-xl shadow-emerald-500/10">
            <h3 className="font-black text-sm uppercase tracking-widest opacity-70">Operational Tracking</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white/10 dark:bg-slate-950/20 rounded-3xl backdrop-blur-md border border-white/10">
                <div className="text-3xl font-black">{batch.practicalCount}</div>
                <div className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-70">Practicals</div>
              </div>
              <div className="p-6 bg-white/10 dark:bg-slate-950/20 rounded-3xl backdrop-blur-md border border-white/10">
                <div className="text-3xl font-black">{batch.testsConducted}</div>
                <div className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-70">Tests Done</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <div className="flex items-center gap-2 text-sm font-bold">
                <Users className="w-4 h-4" /> {batch.studentCount} Students
              </div>
              <div className="flex items-center gap-2 text-sm font-bold">
                <Calendar className="w-4 h-4" /> {new Date(batch.startDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Checklist + Student Management */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hierarchical Curriculum Checklist */}
          <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Master Curriculum Checklist</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">Mark topics as they are completed in the live sessions.</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl text-xs font-black text-emerald-500">
                {batch.topicProgress.filter(t => t.isCompleted).length} / {batch.topicProgress.length} DONE
              </div>
            </div>

            <div className="space-y-6">
              {groupedTopics && Object.entries(groupedTopics).map(([section, topics], sIdx) => (
                <div key={section} className="rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/30 border border-black/5 dark:border-white/5 overflow-hidden">
                  {/* Topic Header Card (Collapsible Toggle) */}
                  <button
                    onClick={() => toggleSection(section)}
                    className="w-full p-4 flex items-center gap-6 text-left hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xl shadow-xl shadow-black/10">
                      {String(sIdx + 1).padStart(2, '0')}
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-xl font-black text-slate-900 dark:text-white">
                        {section}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full",
                          topics.every(t => t.isCompleted)
                            ? "bg-emerald-500 text-white"
                            : "bg-emerald-500/10 text-emerald-500"
                        )}>
                          {topics.filter(t => t.isCompleted).length} / {topics.length} DONE
                        </span>
                      </div>
                    </div>
                    {expandedSections.includes(section) ? (
                      <ChevronDown className="w-6 h-6 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-emerald-500" />
                    )}
                  </button>

                  {/* Subtopics List (Conditional) */}
                  {expandedSections.includes(section) && (
                    <div className="px-8 pb-10 grid gap-4 animate-in slide-in-from-top-4 duration-300">
                      <div className="h-px bg-slate-100 dark:bg-slate-800 mb-2 md:ml-20" />
                      <div className="grid gap-4 md:ml-20">
                        {topics.map((topic) => (
                          <button
                            key={topic.topicId}
                            onClick={() => toggleTopic(topic.topicId, topic.isCompleted)}
                            className={cn(
                              "w-full flex items-center justify-between p-6 rounded-[2.5rem] border transition-all text-left",
                              topic.isCompleted
                                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                                : "bg-white dark:bg-slate-900 border-none text-slate-600 dark:text-slate-400 hover:ring-2 hover:ring-emerald-500/20 shadow-sm"
                            )}
                          >
                            <div className="flex items-center gap-5">
                              <div className={cn(
                                "p-2.5 rounded-2xl transition-all",
                                topic.isCompleted
                                  ? "bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/20"
                                  : "bg-slate-100 dark:bg-slate-800 text-slate-300 border border-black/5 dark:border-white/5"
                              )}>
                                {topic.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                              </div>
                              <div>
                                <div className="text-base font-bold">{topic.name}</div>
                                {topic.completionDate && (
                                  <div className="text-[10px] opacity-70 mt-1 font-medium flex items-center gap-1 uppercase tracking-widest">
                                    <Calendar className="w-3.5 h-3.5" /> Marked {new Date(topic.completionDate).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Enrolled Students Management */}
          <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3">
                <Users className="w-6 h-6 text-emerald-500" /> Enrollment Hub
              </h3>
              <div className="text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl tracking-widest">
                {batch.students?.length ?? 0} STUDENTS ACTIVE
              </div>
            </div>

            {/* Add Student Control */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Quick search by username or ID..."
                  className="w-full pl-16 pr-8 py-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>

              {userSearch && availableUsers.length > 0 && (
                <div className="border border-black/5 dark:border-white/5 rounded-[2rem] overflow-hidden divide-y divide-black/5 dark:divide-white/5 bg-slate-50/50 dark:bg-slate-800/20">
                  {availableUsers.slice(0, 6).map(user => (
                    <div key={user._id} className="flex items-center justify-between px-6 py-4 hover:bg-emerald-500/5 transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-xs text-slate-500">
                          {user.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{user.username || 'Unknown User'}</div>
                          <code className="text-[10px] font-mono text-slate-400">{user._id}</code>
                        </div>
                      </div>
                      <button
                        onClick={() => addStudent(user._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black rounded-xl hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-95"
                      >
                        <UserPlus className="w-3.5 h-3.5" /> Enrol
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {addMsg && (
                <div className={cn(
                  "px-6 py-3 rounded-2xl text-xs font-bold animate-in fade-in slide-in-from-bottom-2",
                  addMsg.type === 'success' ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
                )}>
                  {addMsg.text}
                </div>
              )}
            </div>

            {/* Active Students Grid */}
            {batch.students && batch.students.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {batch.students.map(student => (
                  <div key={student._id} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-3xl group border border-transparent hover:border-black/5 dark:hover:border-white/5 transition-all">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-black text-sm shrink-0">
                        {student.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{student.username || 'Unknown Student'}</div>
                        <button onClick={() => copyId(student._id)} className="flex items-center gap-1 group/s">
                          <code className="text-[10px] font-mono text-slate-400 group-hover/s:text-emerald-500 transition-colors">
                            {student._id.slice(0, 12)}…
                          </code>
                          {copiedId === student._id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-slate-300 opacity-0 group-hover/s:opacity-100" />}
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeStudent(student._id)}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <UserMinus className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-[2rem] bg-slate-50 dark:bg-slate-800/30 border-2 border-dashed border-black/5 dark:border-white/5">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p className="text-sm font-bold text-slate-400">No students enrolled yet.</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-300 mt-1">Use the search above to add students</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
