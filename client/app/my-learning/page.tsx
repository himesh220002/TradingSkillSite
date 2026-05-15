"use client"

import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Clock,
  BarChart3,
  Search,
  LayoutDashboard,
  Settings,
  LogOut,
  Bell,
  TrendingUp,
  Target,
  ChevronRight,
  Info,
  AlertTriangle,
  CheckCircle2,
  X,
  Calendar,
  Coffee,
  ExternalLink,
  Zap,
  Repeat
} from "lucide-react";
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api-config";

interface Course {
  _id: string;
  title: string;
  bannerImage: string;
}

interface ScheduleItem {
  date: string;
  startTime?: string;
  endTime?: string;
  type: 'Class' | 'Off' | 'Event';
  note?: string;
  isOverride?: boolean;
}

interface Batch {
  _id: string;
  courseId: Course;
  batchName: string;
  status: string;
  startDate: string;
  progressPercentage: number;
  meetingLink?: string;
  combinedSchedule?: ScheduleItem[];
}

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

export default function MyLearningPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!data.id) {
      window.location.href = '/portal';
      return;
    }
    setUserData(data);
    fetchEnrolledCourses(data.id);
    fetchNotifications();
  }, []);

  const fetchEnrolledCourses = async (userId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile/${userId}`);
      const data = await response.json();
      setBatches(data.enrolledBatches || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    const token = localStorage.getItem('userToken');
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (Array.isArray(data)) setNotifications(data);
    } catch (error) { }
  };

  const markAsRead = async (id: string) => {
    const token = localStorage.getItem('userToken');
    try {
      await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) { }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-500 font-sans">
      {/* Sidebar */}
      {/* <aside className="hidden fixed left-0 top-0 h-full w-16 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border-r border-black/5 flex flex-col items-center py-8 gap-8 z-40 pt-24">
        <nav className="flex flex-col gap-6 w-full px-2">
          <NavItem href="/portal/dashboard" icon={LayoutDashboard} label="Home" />
          <NavItem href="/my-learning" icon={BookOpen} label="Learning" active />
          <NavItem href="/profile" icon={Target} label="Profile" />
        </nav>
        <button className="mt-auto p-4 text-slate-400 hover:text-red-500 transition-all rounded-xl hover:bg-red-500/5">
          <LogOut className="w-5 h-5" />
        </button>
      </aside> */}

      {/* Main Content - Compact Sizings */}
      <main className=" pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-5xl mx-auto space-y-8">

          <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-black/5 dark:border-white/5 pb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-500 mb-0.5">
                <Target className="w-3.5 h-3.5" />
                <span className="text-[9px] font-black uppercase tracking-widest">Institutional Hub</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                My <span className="text-emerald-500">Learning</span>
              </h1>
              <p className="text-slate-500 text-[11px] font-medium tracking-tight">Welcome, {userData?.username}. Tracking {batches.length} cohorts.</p>
            </div>

            <div className="flex items-center gap-3 relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                  "p-3 rounded-xl bg-white dark:bg-slate-900 border transition-all relative group shadow-sm",
                  showNotifications ? "border-emerald-500/50 text-emerald-500" : "border-black/5 text-slate-500"
                )}
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-4 w-72 md:w-80 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-black/5 shadow-2xl z-50 overflow-hidden">
                  <div className="p-4 border-b border-black/5 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900">Alerts</h3>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400"><X className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length > 0 ? notifications.map((n) => (
                      <div key={n._id} className={cn("p-4 border-b border-black/5 last:border-none hover:bg-slate-50 transition-colors relative group", !n.isRead && "bg-emerald-500/5")} onClick={() => markAsRead(n._id)}>
                        <div className="flex gap-3">
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", n.type === 'warning' ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500")}>
                            {n.type === 'warning' ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                          </div>
                          <div className="space-y-0.5">
                            <h4 className="text-[10px] font-black text-slate-900 dark:text-white leading-tight">{n.title}</h4>
                            <p className="text-[9px] text-slate-500 leading-relaxed">{n.message}</p>
                          </div>
                        </div>
                      </div>
                    )) : <div className="py-8 text-center opacity-30 text-[9px] font-black uppercase tracking-widest">Inbox Empty</div>}
                  </div>
                </div>
              )}
            </div>
          </header>

          {/* Batches Grid - Full Width for better zoom compatibility */}
          <section className="space-y-6">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <div className="w-1.5 h-5 bg-emerald-500 rounded-full" />
              Active Enrollment Roster
            </h2>
            <div className="grid gap-6">
              {loading ? (
                <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : batches.length > 0 ? batches.map((batch) => (
                <CourseCard key={batch._id} batch={batch} />
              )) : (
                <div className="py-20 rounded-[2rem] bg-white dark:bg-slate-900/50 border border-black/5 text-center space-y-4 shadow-sm">
                  <BookOpen className="w-10 h-10 text-emerald-500 mx-auto opacity-20" />
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Enrollment Required</h3>
                  <Link href="/course" className="inline-flex items-center gap-3 bg-emerald-600 text-white px-8 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest">Explore Courses</Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon: Icon, label, active = false }: any) {
  return (
    <Link href={href} className={cn("relative p-3 rounded-xl flex items-center justify-center transition-all group", active ? "text-emerald-500 bg-emerald-500/10" : "text-slate-400 hover:text-emerald-500")}>
      <Icon className="w-5 h-5" />
      <span className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[8px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all scale-95 group-hover:scale-100 shadow-xl z-50">{label}</span>
    </Link>
  );
}

function CourseCard({ batch }: { batch: Batch }) {
  // Extract next 3 slots for this specific batch
  const batchSchedule = batch.combinedSchedule?.slice(0, 3) || [];

  return (
    <div className="group bg-white dark:bg-slate-900/40 p-6 rounded-[2rem] border border-black/5 shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col md:flex-row gap-8 relative overflow-hidden">
      {/* Thumbnail Area */}
      <div className="relative w-full md:w-56 h-48 rounded-[1.5rem] overflow-hidden shrink-0 shadow-sm border border-black/5">
        <img src={batch.courseId?.bannerImage || '/course-masterclass.png'} alt={batch.courseId?.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute inset-0 bg-slate-900/20" />
        <div className="absolute top-3 left-3">
          <span className={cn(
            "px-3 py-1 rounded-lg text-[7px] font-black uppercase tracking-widest shadow-lg",
            batch.status === 'Ongoing' ? "bg-emerald-500 text-white" : "bg-blue-500 text-white"
          )}>{batch.status}</span>
        </div>
      </div>

      <div className="flex flex-col flex-grow justify-between py-1">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Info Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tight group-hover:text-emerald-500 transition-colors">{batch.courseId?.title}</h3>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">ID: {batch.batchName}</div>
                <div className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded-md">
                  {new Date(batch.startDate) > new Date() ? 'Starting' : 'Started'} {new Date(batch.startDate).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-end"><span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Curriculum Tracking</span><span className="text-sm font-black text-slate-900 dark:text-white">{batch.progressPercentage}%</span></div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: `${batch.progressPercentage}%` }} /></div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border border-white dark:border-slate-900 overflow-hidden shadow-sm bg-slate-100"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=st${i + batch._id}`} alt="Peer" /></div>)}
              </div>
              <Link href={`/course/${batch.courseId?._id}/${batch._id}`} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg group/btn">Classroom <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" /></Link>
            </div>
          </div>

          {/* INBUILT SCHEDULE SECTION - Fixed Confusion */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-black/5 shadow-inner space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Batch Timeline
              </h4>
              {batch.meetingLink && (
                <a href={batch.meetingLink} target="_blank" className="text-[8px] font-black text-emerald-500 hover:underline flex items-center gap-1">Live Meeting <ExternalLink className="w-3 h-3" /></a>
              )}
            </div>
            <div className="space-y-2">
              {batchSchedule.length > 0 ? batchSchedule.map((item, idx) => (
                <div key={idx} className={cn("p-3 rounded-xl border flex items-center justify-between bg-white dark:bg-slate-900 shadow-sm", item.type === 'Off' ? "opacity-50 grayscale" : "border-black/5")}>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", item.isOverride ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500")}>
                      {item.isOverride ? <Zap className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-[8px] font-black text-slate-900 dark:text-white uppercase tracking-widest">
                        {new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', day: '2-digit' })}
                      </div>
                      <div className="text-[8px] font-bold text-slate-500">{item.type === 'Off' ? 'OFF' : `${item.startTime} - ${item.endTime}`}</div>
                    </div>
                  </div>
                  {item.isOverride && <span className="text-[6px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-widest">Shift</span>}
                </div>
              )) : (
                <div className="text-center py-4 opacity-20 italic text-[9px]">No upcoming slots mapped.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
