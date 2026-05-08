"use client"

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/stats/overview');
        const data = await res.json();
        setStats(data.stats);
        setTopCourses(data.topCourses);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

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

      {/* Stats Grid */}
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
              
              {/* Subtle accent line */}
              <div className={cn("absolute bottom-0 left-8 right-8 h-1 rounded-t-full transition-all duration-500 opacity-0 group-hover:opacity-100", config.bg.replace('/10', '/30'))} />
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Revenue Growth / Chart Placeholder */}
        <div className="lg:col-span-2 p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Revenue Intelligence</h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">Growth analysis over the selected period.</p>
            </div>
            <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-widest outline-none ring-4 ring-transparent focus:ring-emerald-500/10 transition-all">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-72 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] text-slate-400 transition-all group-hover:border-emerald-500/20 group-hover:bg-emerald-500/[0.02]">
            <Activity className="w-12 h-12 mb-4 opacity-20 text-emerald-500" />
            <span className="text-xs font-black uppercase tracking-widest opacity-40">Live Chart Integration Pending</span>
          </div>
        </div>

        {/* Top Performing Courses */}
        <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-10">Top Performing</h2>
          <div className="space-y-8">
            {topCourses.map((course, idx) => (
              <div key={course.name} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-black text-xs group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                    0{idx + 1}
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-800 dark:text-slate-200 group-hover:text-emerald-500 transition-colors">{course.name}</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{course.students} Active Students</div>
                  </div>
                </div>
                <div className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full group-hover:scale-110 transition-transform">{course.growth}</div>
              </div>
            ))}
            
            {topCourses.length === 0 && (
              <div className="text-center py-10 opacity-40">
                <p className="text-xs font-black uppercase tracking-widest">No data available yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
