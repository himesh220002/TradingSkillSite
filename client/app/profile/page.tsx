"use client"

import React, { useEffect, useState } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  Edit3,
  BookOpen,
  CheckCircle2,
  Clock,
  Calendar,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Save,
  X,
  Coffee,
  Zap,
  Repeat
} from "lucide-react";
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api-config";
import Link from 'next/link';

interface ScheduleItem {
  date: string;
  startTime?: string;
  endTime?: string;
  type: 'Class' | 'Off' | 'Event';
  isOverride?: boolean;
}

interface Batch {
  _id: string;
  batchName: string;
  courseId: { _id: string; title: string; description: string };
  progressPercentage: number;
  startDate: string;
  status: string;
  meetingLink: string;
  combinedSchedule?: ScheduleItem[];
}

interface UserProfile {
  _id: string;
  username: string;
  name?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  enrolledBatches: Batch[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    linkedin: '',
    github: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!userData.id) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile/${userData.id}`);
      const data = await response.json();
      setProfile(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        linkedin: data.linkedin || '',
        github: data.github || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile/${userData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        const updated = await response.json();
        setProfile({ ...profile!, ...updated });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const weeklySchedule = profile?.enrolledBatches
    ?.flatMap(b => (b.combinedSchedule || []).map(s => ({ ...s, batchName: b.batchName })))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 8) || [];

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!profile) return <div className="text-center py-20 text-slate-500">Please login to view profile.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 pt-24 pb-16 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-black/5 shadow-sm relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -mr-32 -mt-32" />
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center border-2 border-emerald-500/20">
            <UserIcon className="w-10 h-10 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">{profile.name || profile.username}</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-500 font-black text-[9px] tracking-[0.15em] uppercase">TradingX Pro Student</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button onClick={() => setIsEditing(!isEditing)} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-[1.5rem] text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl active:scale-95 transition-all">
            {isEditing ? <X className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="space-y-6">

          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-black/5 shadow-sm space-y-6">
            <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase text-xs tracking-widest">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Contact Details
            </h3>
            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-3">
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full Name" className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-xs font-bold" />
                <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone" className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-xs font-bold" />
                <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-[1.5rem] font-black text-[9px] uppercase tracking-widest shadow-lg mt-2">Save Record</button>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 flex items-center gap-4">
                  <Mail className="w-4.5 h-4.5 text-slate-400" />
                  <div><div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Login ID</div><div className="text-xs font-black text-slate-900 dark:text-white truncate">{profile.username}</div></div>
                </div>
                <div className="p-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 flex items-center gap-4">
                  <Phone className="w-4.5 h-4.5 text-slate-400" />
                  <div><div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phone Number</div><div className="text-xs font-black text-slate-900 dark:text-white">{profile.phone || 'N/A'}</div></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-black/5 shadow-sm space-y-8 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -ml-32 -mb-32" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 tracking-tight">
               <BookOpen className="w-7 h-7 text-emerald-500" /> Academic Progress
            </h3>

            <div className="space-y-6 relative z-10">
              {profile.enrolledBatches.map((batch) => (
                <div key={batch._id} className="group p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/30 border border-transparent hover:border-emerald-500/20 transition-all shadow-sm space-y-6">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "px-3 py-1.5 rounded-lg text-[7px] font-black uppercase tracking-[0.15em] shadow-md",
                            batch.status === 'Ongoing' ? "bg-emerald-500 text-white" : "bg-blue-500 text-white"
                          )}>{batch.status}</span>
                          <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{batch.courseId?.title}</h4>
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{batch.batchName} • {new Date(batch.startDate) > new Date() ? 'Starting' : 'Started'} {new Date(batch.startDate).toLocaleDateString()}</p>
                      </div>
                      {batch.meetingLink && (
                        <a href={batch.meetingLink} target="_blank" className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-[1.2rem] text-[9px] font-black uppercase tracking-widest transition-all shadow-lg hover:bg-emerald-500">Join Live <ExternalLink className="w-3.5 h-3.5" /></a>
                      )}
                   </div>

                   <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em]">Curriculum Mastery</span>
                        <span className="text-xl font-black text-slate-900 dark:text-white">{batch.progressPercentage}%</span>
                      </div>
                      <div className="h-3 w-full bg-white dark:bg-slate-900 rounded-full overflow-hidden p-1 shadow-inner">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${batch.progressPercentage}%` }} />
                      </div>
                   </div>

                   <div className="pt-6 border-t border-black/5 flex items-center justify-between">
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Active Track</div>
                      <Link href={`/course/${(batch.courseId as any)?._id}/${batch._id}`} className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 hover:gap-3 transition-all">Go to Classroom <ChevronRight className="w-3.5 h-3.5" /></Link>
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
