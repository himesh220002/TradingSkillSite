"use client"

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api-config';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  TrendingUp,
  Users,
  Calendar,
  ExternalLink,
  Search,
  Copy,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Edit2,
  AlertCircle,
  Clock,
  Coffee,
  Plus,
  Trash2,
  Zap,
  Repeat,
  Save
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

interface ScheduleItem {
  date: string;
  startTime?: string;
  endTime?: string;
  type: 'Class' | 'Off' | 'Event';
  note?: string;
  isOverride?: boolean;
}

interface GeneralSlot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  type: 'Class' | 'Off';
}

interface Batch {
  _id: string;
  courseId: { _id: string; title: string };
  batchName: string;
  studentCount: number;
  maxStudents: number;
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
  schedule: ScheduleItem[];
  generalSchedule: GeneralSlot[];
  combinedSchedule: ScheduleItem[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function BatchDetails() {
  const { id } = useParams();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [editDateValue, setEditDateValue] = useState('');
  const [isEditingStats, setIsEditingStats] = useState(false);
  const [statsValue, setStatsValue] = useState({ practicals: 0, tests: 0 });
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  // Squeezed Schedule State
  const [activeTab, setActiveTab] = useState<'merged' | 'general' | 'particular'>('merged');
  const [newOverride, setNewOverride] = useState<ScheduleItem>({
    date: new Date().toISOString().split('T')[0],
    startTime: '06:00 PM',
    endTime: '08:00 PM',
    type: 'Class'
  });
  const [newGeneral, setNewGeneral] = useState<GeneralSlot>({
    dayOfWeek: 'Monday',
    startTime: '06:00 PM',
    endTime: '08:00 PM',
    type: 'Class'
  });

  useEffect(() => { fetchBatch(); }, [id]);

  const fetchBatch = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/batches/${id}`);
      const data = await res.json();
      setBatch(data);
      if (data.startDate) setEditDateValue(new Date(data.startDate).toISOString().split('T')[0]);
      setStatsValue({ practicals: data.practicalCount || 0, tests: data.testsConducted || 0 });
    } catch (err) { } finally { setLoading(false); }
  };

  const updateBatchField = async (field: string, value: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/batches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (res.ok) {
        setBatch(data);
        setIsEditingDate(false);
        setIsEditingStats(false);
      }
    } catch (err) { }
  };

  const saveStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/batches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practicalCount: statsValue.practicals,
          testsConducted: statsValue.tests
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setBatch(data);
        setIsEditingStats(false);
      }
    } catch (err) { }
  };

  const addOverride = async () => {
    if (!batch) return;
    await updateBatchField('schedule', [...(batch.schedule || []), newOverride]);
  };

  const addGeneral = async () => {
    if (!batch) return;
    const filtered = (batch.generalSchedule || []).filter(gs => gs.dayOfWeek !== newGeneral.dayOfWeek);
    await updateBatchField('generalSchedule', [...filtered, newGeneral]);
  };

  const removeGeneral = (day: string) => updateBatchField('generalSchedule', batch!.generalSchedule.filter(gs => gs.dayOfWeek !== day));
  const removeOverride = (idx: number) => updateBatchField('schedule', batch!.schedule.filter((_, i) => i !== idx));

  const toggleTopic = async (topicId: string, currentState: boolean) => {
    const res = await fetch(`${API_BASE_URL}/api/batches/${id}/topic/${topicId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCompleted: !currentState }),
    });
    setBatch(await res.json());
  };

  const toggleSection = (section: string) => setExpandedSections(prev => prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]);

  const groupedTopics = batch?.topicProgress?.reduce((acc: Record<string, Topic[]>, topic) => {
    const section = topic.sectionName || 'General';
    if (!acc[section]) acc[section] = [];
    acc[section].push(topic);
    return acc;
  }, {}) || {};

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!batch) return <div className="text-center py-20 text-slate-500">Batch not found.</div>;

  return (
    <div className="space-y-6 pb-20 max-w-[1300px] mx-auto px-4 pt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/batches" className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-black/5 text-slate-500 hover:text-emerald-500 transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{batch.batchName}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{batch.courseId?.title}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">{batch.status}</span>
          {batch.meetingLink && <a href={batch.meetingLink} target="_blank" className="p-3 bg-white dark:bg-slate-900 border border-black/5 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"><ExternalLink className="w-4 h-4" /></a>}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* SQUEEZED SCHEDULER COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-black/5 shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl -mr-12 -mt-12" />

            <div className="space-y-1 relative z-10">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" /> Live Engine
              </h3>
              <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Baseline & Overrides</p>
            </div>

            <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl relative z-10">
              {(['merged', 'general', 'particular'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={cn("flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all", activeTab === tab ? "bg-white dark:bg-slate-900 text-emerald-500 shadow-sm" : "text-slate-400")}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-4 relative z-10 max-h-[500px] overflow-y-auto pr-1">
              {activeTab === 'merged' && (
                <div className="space-y-3">
                  {batch.combinedSchedule?.map((item, idx) => (
                    <div key={idx} className={cn("p-3 rounded-2xl border flex items-center justify-between", item.type === 'Off' ? "bg-slate-50 opacity-40 border-transparent" : "bg-white border-black/5")}>
                      <div className="flex items-center gap-2">
                        {item.isOverride ? <Zap className="w-3.5 h-3.5 text-amber-500" /> : <Repeat className="w-3.5 h-3.5 text-emerald-500" />}
                        <div>
                          <div className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit' })}</div>
                          <div className="text-[8px] font-bold text-slate-500">{item.type === 'Off' ? 'OFF' : `${item.startTime}`}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
                    <select value={newGeneral.dayOfWeek} onChange={e => setNewGeneral({ ...newGeneral, dayOfWeek: e.target.value as any })} className="w-full bg-white dark:bg-slate-900 p-2 rounded-lg text-[9px] font-black outline-none border-none">
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      <input value={newGeneral.startTime} onChange={e => setNewGeneral({ ...newGeneral, startTime: e.target.value })} className="bg-white dark:bg-slate-900 p-2 rounded-lg text-[9px] font-black" placeholder="6PM" />
                      <input value={newGeneral.endTime} onChange={e => setNewGeneral({ ...newGeneral, endTime: e.target.value })} className="bg-white dark:bg-slate-900 p-2 rounded-lg text-[9px] font-black" placeholder="8PM" />
                    </div>
                    <button onClick={addGeneral} className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg">Save Weekly</button>
                  </div>
                  {batch.generalSchedule?.map((gs, i) => (
                    <div key={i} className="p-3 rounded-xl border border-black/5 flex items-center justify-between group">
                      <div className="text-[9px] font-black uppercase tracking-widest"><span className="text-emerald-500">{gs.dayOfWeek.slice(0, 3)}</span>: {gs.startTime}</div>
                      <button onClick={() => removeGeneral(gs.dayOfWeek)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'particular' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-3">
                    <input type="date" value={newOverride.date} onChange={e => setNewOverride({ ...newOverride, date: e.target.value })} className="w-full bg-white dark:bg-slate-900 p-2 rounded-lg text-[9px] font-black" />
                    <div className="grid grid-cols-2 gap-2">
                      <input value={newOverride.startTime} onChange={e => setNewOverride({ ...newOverride, startTime: e.target.value })} className="bg-white dark:bg-slate-900 p-2 rounded-lg text-[9px] font-black" placeholder="Start" />
                      <select value={newOverride.type} onChange={e => setNewOverride({ ...newOverride, type: e.target.value as any })} className="bg-white dark:bg-slate-900 p-2 rounded-lg text-[9px] font-black">
                        <option value="Class">Class</option>
                        <option value="Off">OFF</option>
                      </select>
                    </div>
                    <button onClick={addOverride} className="w-full py-2.5 bg-amber-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg">Map Override</button>
                  </div>
                  {batch.schedule?.map((s, i) => (
                    <div key={i} className="p-3 rounded-xl border border-black/5 flex items-center justify-between group">
                      <div className="text-[9px] font-black uppercase tracking-widest"><span className="text-amber-500">{new Date(s.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</span>: {s.type}</div>
                      <button onClick={() => removeOverride(i)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Stats Squeezed with Save Option */}
          <div className="p-6 rounded-[2rem] bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 space-y-4 shadow-xl relative overflow-hidden group/card">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-[9px] uppercase tracking-widest opacity-60">Tracker</h3>
              <button onClick={() => setIsEditingStats(!isEditingStats)} className="text-[8px] bg-white/10 px-2 py-1 rounded-md hover:bg-white/20 transition-all">Edit Stats</button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-white/10 rounded-xl border border-white/5 relative">
                {isEditingStats ? (
                  <input type="number" value={statsValue.practicals} onChange={e => setStatsValue({ ...statsValue, practicals: parseInt(e.target.value) || 0 })} className="w-full bg-transparent border-none text-xl font-black outline-none" />
                ) : (
                  <div className="text-xl font-black">{batch.practicalCount}</div>
                )}
                <div className="text-[7px] uppercase font-black opacity-60">Practicals</div>
              </div>
              <div className="p-3 bg-white/10 rounded-xl border border-white/5 relative">
                {isEditingStats ? (
                  <input type="number" value={statsValue.tests} onChange={e => setStatsValue({ ...statsValue, tests: parseInt(e.target.value) || 0 })} className="w-full bg-transparent border-none text-xl font-black outline-none" />
                ) : (
                  <div className="text-xl font-black">{batch.testsConducted}</div>
                )}
                <div className="text-[7px] uppercase font-black opacity-60">Tests</div>
              </div>
            </div>

            {isEditingStats && (
              <button onClick={saveStats} className="w-full py-2 bg-white text-slate-900 dark:bg-slate-950 dark:text-white rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-1">
                <Save className="w-3 h-3" /> Save Stats
              </button>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div className="text-[8px] font-black uppercase tracking-widest flex items-center gap-1"><Calendar className="w-3 h-3 opacity-60" /> {new Date(batch.startDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</div>
              <button onClick={() => setIsEditingDate(!isEditingDate)} className="text-[8px] bg-white/10 px-2 py-1 rounded-md hover:bg-white/20">Change Date</button>
            </div>

            {isEditingDate && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                <input type="date" value={editDateValue} onChange={(e) => setEditDateValue(e.target.value)} className="w-full bg-white/10 border-none rounded-lg px-2 py-1.5 text-[10px] text-white" />
                <button onClick={() => updateBatchField('startDate', editDateValue)} className="w-full py-2 bg-emerald-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  <Save className="w-3 h-3" /> Save Date
                </button>
              </div>
            )}
          </div>
        </div>

        {/* PROGRESS & STUDENTS HUB */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-white dark:bg-slate-900 border border-black/5 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Curriculum Checklist</h3>
              <div className="bg-emerald-500 text-white px-5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">{batch.progressPercentage}% COMPLETE</div>
            </div>
            <div className="space-y-4">
              {Object.entries(groupedTopics).map(([section, topics], sIdx) => (
                <div key={section} className="rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/30 border border-black/5 overflow-hidden">
                  <button onClick={() => toggleSection(section)} className="w-full p-4 flex items-center justify-between hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-sm font-black">{sIdx + 1}</div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">{section}</h4>
                    </div>
                    <ChevronDown className={cn("w-4 h-4 text-slate-400", expandedSections.includes(section) && "rotate-180")} />
                  </button>
                  {expandedSections.includes(section) && (
                    <div className="p-4 pt-0 grid gap-2 md:ml-14">
                      {topics.map(topic => (
                        <button key={topic.topicId} onClick={() => toggleTopic(topic.topicId, topic.isCompleted)} className={cn("w-full p-3 rounded-xl border flex items-center gap-3 text-left transition-all", topic.isCompleted ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 shadow-inner" : "bg-white border-none")}>
                          {topic.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4 opacity-20" />}
                          <span className="text-xs font-bold leading-tight">{topic.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-white dark:bg-slate-900 border border-black/5 shadow-sm space-y-8">
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2"><Users className="w-6 h-6 text-emerald-500" /> Active Enrollment</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {batch.students?.map(student => (
                <div key={student._id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center justify-between group hover:bg-white transition-all border border-transparent hover:border-black/5 shadow-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xs shrink-0">{student.username[0].toUpperCase()}</div>
                    <div className="text-[11px] font-black text-slate-900 dark:text-white truncate">{student.username}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
