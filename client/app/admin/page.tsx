"use client"

import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api-config';
import {
  Users,
  BookOpen,
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Stat {
  name: string;
  value: string;
  change: string;
  trending: 'up' | 'down';
}

interface TopCourse {
  name: string;
  students: number;
  growth: string;
}

const COURSE_COLORS = [
  'bg-emerald-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-amber-500',
  'bg-cyan-500',
  'bg-indigo-500',
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [revenueData, setRevenueData] = useState<{ 
    date: string; 
    amount: number; 
    min: number; 
    max: number; 
    courses: { name: string; amount: number; batchBreakdown?: string }[] 
  }[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [batchSummary, setBatchSummary] = useState<any[]>([]);
  const [period, setPeriod] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/stats/overview`);
        const data = await res.json();
        setStats(data.stats);
        setTopCourses(data.topCourses);
        setRevenueData(data.revenueData || []);
        setRecentActivity(data.recentActivity || []);
        setBatchSummary(data.batchSummary || []);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getVisibleData = () => {
    const today = new Date();
    return Array.from({ length: period }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (period - 1 - i));
      const dateStr = d.toISOString().split('T')[0];
      const existing = revenueData.find(rd => rd.date === dateStr);
      return existing || { date: dateStr, amount: 0, min: 0, max: 0, courses: [] };
    });
  };

  const currentVisibleData = getVisibleData();
  const periodMax = Math.max(...currentVisibleData.map(d => d.amount), 1);

  const getStatConfig = (name: string) => {
    switch (name) {
      case 'Total Students': return { icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' };
      case 'Active Courses': return { icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
      case 'Total Revenue': return { icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-500/10' };
      case 'Completion Rate': return { icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10' };
      default: return { icon: Activity, color: 'text-slate-500', bg: 'bg-slate-500/10' };
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Welcome back, Admin. Here is your real-time performance summary.</p>
        </div>
        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-black/5 dark:border-white/5">
          Updated {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const config = getStatConfig(stat.name);
          return (
            <div key={stat.name} className="group p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 transition-all hover:shadow-2xl hover:shadow-emerald-500/5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110 duration-500", config.bg)}>
                  <config.icon className={cn("w-7 h-7", config.color)} />
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full",
                  stat.trending === 'up' ? "text-emerald-600 bg-emerald-500/10" : "text-red-600 bg-red-500/10"
                )}>
                  {stat.trending === 'up' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {stat.change}
                </div>
              </div>
              <div className="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tighter">{stat.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest opacity-80">{stat.name}</div>
              <div className={cn("absolute bottom-0 left-8 right-8 h-1 rounded-t-full transition-all duration-500 opacity-0 group-hover:opacity-100", config.bg.replace('/10', '/30'))} />
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Revenue Intelligence</h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">Daily course distribution and potential.</p>
            </div>
            <select
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-widest outline-none ring-4 ring-transparent focus:ring-emerald-500/10 transition-all cursor-pointer"
            >
              <option value={7}>Last 7 Days</option>
              <option value={30}>Last 30 Days</option>
            </select>
          </div>

          <div className="h-80 relative flex gap-4">
            <div className="flex flex-col justify-between text-[8px] font-black text-slate-400 py-10 uppercase tracking-tighter w-12 border-r border-black/5 dark:border-white/5 pr-2">
              {[...Array(5)].map((_, i) => (
                <span key={i}>${Math.round((periodMax * (4 - i)) / 4).toLocaleString()}</span>
              ))}
            </div>

            <div className="flex-1 flex flex-col h-full overflow-x-auto scrollbar-hide">
              <div className="flex-1 flex items-end gap-3 justify-between min-w-[600px] p-6 pt-10">
                {currentVisibleData.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar h-full justify-end relative">
                    <div className="w-full h-full relative flex flex-col justify-end items-center">
                      <div 
                        className="w-full flex flex-col-reverse rounded-t-lg overflow-hidden transition-all relative z-10 bg-slate-100 dark:bg-slate-800/30" 
                        style={{ 
                          height: day.amount > 0 ? `${(day.amount / periodMax) * 100}%` : '4px',
                          minHeight: '4px'
                        }}
                      >
                        {day.courses.map((course: any, cIdx: number) => {
                          const segmentHeight = (course.amount / day.amount) * 100;
                          const colorClass = COURSE_COLORS[cIdx % COURSE_COLORS.length];
                          return (
                            <div 
                              key={cIdx}
                              className={cn("w-full transition-all group-hover/bar:brightness-110 flex items-center justify-center overflow-hidden", colorClass)}
                              style={{ height: `${segmentHeight}%` }}
                            >
                              {segmentHeight > 15 && (
                                <span className="text-[6px] font-black text-white/40 uppercase rotate-90 whitespace-nowrap">
                                  {course.name.split(' ')[0]}
                                </span>
                              )}
                            </div>
                          );
                        })}

                        <div className="absolute -top-28 left-1/2 -translate-x-1/2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black px-4 py-3 rounded-2xl opacity-0 group-hover/bar:opacity-100 transition-all shadow-2xl whitespace-nowrap z-30 border border-black/10">
                          <div className="text-[8px] opacity-60 uppercase mb-2">Daily Enrollment Details</div>
                          <div className="space-y-2">
                            {day.courses.map((c: any, idx: number) => (
                              <div key={idx} className="flex flex-col gap-0.5">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-2">
                                    <div className={cn("w-2 h-2 rounded-full", COURSE_COLORS[idx % COURSE_COLORS.length])} />
                                    <span>{c.name}</span>
                                  </div>
                                  <span className="opacity-60">${c.amount.toLocaleString()}</span>
                                </div>
                                <div className="text-[8px] opacity-40 ml-4 font-medium italic">
                                  ({c.batchBreakdown || 'No batches'})
                                </div>
                              </div>
                            ))}
                            <div className="pt-2 mt-2 border-t border-white/10 dark:border-black/10 flex items-center justify-between font-black text-emerald-500">
                              <span>Total</span>
                              <span>${day.amount.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[7px] font-black uppercase tracking-widest text-slate-400 group-hover/bar:text-emerald-500 transition-colors">
                        {new Date(day.date).getDate()}
                      </span>
                      {(() => {
                        const currentMonth = new Date(day.date).toLocaleString('default', { month: 'short' });
                        const prevDate = new Date(day.date);
                        prevDate.setDate(prevDate.getDate() - 1);
                        const prevMonth = prevDate.toLocaleString('default', { month: 'short' });
                        
                        if (i === 0 || currentMonth !== prevMonth) {
                          return (
                            <div className={cn(
                              "absolute -bottom-6 px-2 py-0.5 rounded-md text-[6px] font-black uppercase tracking-[0.2em] whitespace-nowrap border-b-2",
                              currentMonth === 'Apr' ? "text-blue-500 border-blue-500 bg-blue-500/5" : "text-emerald-500 border-emerald-500 bg-emerald-500/5"
                            )}>
                              {currentMonth}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {Array.from(new Set(revenueData.flatMap((d: any) => d.courses.map((c: any) => c.name)))).map((courseName: any, idx: number) => (
                <div key={courseName} className="flex items-center gap-2">
                  <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", COURSE_COLORS[idx % COURSE_COLORS.length])} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{courseName}</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              {batchSummary.map((b: any, idx: number) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 px-4 py-1.5 rounded-xl border border-black/5 dark:border-white/5 flex items-center gap-2">
                  <span className="text-[8px] font-black uppercase text-slate-400 tracking-tighter">Total in {b.name}:</span>
                  <span className="text-[10px] font-black text-emerald-500">{b.students} Students</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 h-1/2">
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6">Top Performing</h2>
            <div className="space-y-4">
              {topCourses.map((course, idx) => (
                <div key={course.name} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-black text-[10px] group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      0{idx + 1}
                    </div>
                    <div className="text-xs font-black text-slate-800 dark:text-slate-200 truncate max-w-[120px]">{course.name}</div>
                  </div>
                  <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">{course.growth}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 h-1/2 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Live Enrollment</h2>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-4 overflow-y-auto max-h-[120px] pr-2 scrollbar-hide">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2 group cursor-default">
                  <div className="flex flex-col">
                    <div className="text-[10px] font-black text-slate-800 dark:text-slate-200 truncate">{activity.studentName}</div>
                    <div className="text-[7px] font-black text-slate-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                      {activity.batchName}
                    </div>
                  </div>
                  <div className="text-[8px] font-black text-emerald-500 uppercase shrink-0">{activity.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Growth Insights Card */}
      <div className="mt-8 p-12 rounded-[3.5rem] bg-emerald-600 text-white relative overflow-hidden group flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <TrendingUp className="w-64 h-64" />
        </div>
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10">
            <ArrowUpRight className="w-4 h-4 text-white" />
            <span className="text-[10px] font-black uppercase tracking-widest">Growth Analytics</span>
          </div>
          <h3 className="text-3xl font-black tracking-tight leading-tight">Your revenue has increased by <span className="text-white underline decoration-4 decoration-emerald-400 underline-offset-8">12%</span> this week.</h3>
          <p className="text-emerald-100 text-sm font-medium leading-relaxed">
            Current performance metrics show a strong upward trend in Masterclass enrollments. Focus on high-retention topics to maintain this momentum.
          </p>
        </div>
        <div className="relative z-10 shrink-0">
          <button className="bg-white text-emerald-600 px-10 py-5 rounded-[2rem] font-black text-sm hover:scale-105 transition-all active:scale-95 shadow-2xl shadow-black/20 flex items-center gap-3">
            Generate Detailed Report <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
