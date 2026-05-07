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
  X
} from "lucide-react";
import { FaLinkedin, FaGithub } from 'react-icons/fa';
import { cn } from "@/lib/utils";
import Link from 'next/link';

interface Batch {
  _id: string;
  batchName: string;
  courseId: { title: string; description: string };
  progressPercentage: number;
  startDate: string;
  status: string;
  meetingLink: string;
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
      const response = await fetch(`http://localhost:5000/api/auth/profile/${userData.id}`);
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
      const response = await fetch(`http://localhost:5000/api/auth/profile/${userData.id}`, {
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

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!profile) return <div className="text-center py-20 text-slate-500">Please login to view your profile.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 pt-32 pb-20 space-y-12">
      {/* Header / Profile Info */}
      <div className="flex flex-col md:flex-row gap-8 items-start justify-between bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-2xl flex items-center justify-center border-2 border-emerald-500/20 shadow-inner">
            <UserIcon className="w-10 h-10 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              {profile.name || profile.username}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-500 font-bold text-[10px] tracking-widest uppercase">Institutional Student</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 mt-3">
            {profile.linkedin && (
              <a href={profile.linkedin} target="_blank" className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-blue-500 rounded-xl transition-all">
                <FaLinkedin className="w-4 h-4" />
              </a>
            )}
            {profile.github && (
              <a href={profile.github} target="_blank" className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all">
                <FaGithub className="w-4 h-4" />
              </a>
            )}
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex-grow md:flex-none flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl text-sm font-bold transition-all shadow-xl shadow-black/10 active:scale-95"
          >
            {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Left Column: Basic Details */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Basic Information
            </h3>

            {isEditing ? (
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LinkedIn URL</label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GitHub URL</label>
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/20 mt-4"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Username</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{profile.username}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Phone</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">{profile.phone || 'Not provided'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Enrolled Courses & Progress */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-emerald-500" />
                My Learning Journey
              </h3>
              <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold uppercase tracking-wider">
                {profile.enrolledBatches.length} Enrolled
              </span>
            </div>

            {profile.enrolledBatches.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="text-slate-400 text-sm">You haven't opted for any courses yet.</div>
                <Link href="/course" className="mt-4 text-emerald-500 font-bold text-sm hover:underline">Browse Courses</Link>
              </div>
            ) : (
              <div className="space-y-6">
                {profile.enrolledBatches.map((batch) => (
                  <div key={batch._id} className="group p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/30 border border-transparent hover:border-emerald-500/20 transition-all space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-emerald-500 text-white rounded-md text-[10px] font-bold uppercase tracking-widest">{batch.status}</span>
                          <h4 className="text-lg font-bold text-slate-900 dark:text-white">{batch.courseId?.title}</h4>
                        </div>
                        <p className="text-xs text-slate-500">{batch.batchName} • Started {new Date(batch.startDate).toLocaleDateString()}</p>
                      </div>
                      {batch.meetingLink && (
                        <a
                          href={batch.meetingLink}
                          target="_blank"
                          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
                        >
                          Join Live Class
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Curriculum Completion</span>
                        <span className="text-sm font-black text-emerald-500">{batch.progressPercentage}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          style={{ width: `${batch.progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <Clock className="w-3.5 h-3.5" />
                          6:00 PM - 8:00 PM
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                          On Track
                        </div>
                      </div>
                      <button className="text-xs font-bold text-emerald-500 flex items-center gap-1 hover:gap-2 transition-all">
                        Course Notes <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
