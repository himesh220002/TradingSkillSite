import React from 'react';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";

const STATS = [
  { name: 'Total Students', value: '1,284', change: '+12%', trending: 'up', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { name: 'Active Courses', value: '12', change: '+2', trending: 'up', icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { name: 'Total Revenue', value: '$42,500', change: '+18%', trending: 'up', icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  { name: 'Completion Rate', value: '85%', change: '-2%', trending: 'down', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-500/10' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
        <p className="text-slate-500 dark:text-slate-400">Welcome back, Admin. Here is what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat) => (
          <div key={stat.name} className="p-6 rounded-[2rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 transition-all hover:shadow-xl hover:shadow-emerald-500/5">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-3 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                stat.trending === 'up' ? "text-emerald-600 bg-emerald-500/10" : "text-red-600 bg-red-500/10"
              )}>
                {stat.trending === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.name}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity / Chart Placeholder */}
        <div className="lg:col-span-2 p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Growth</h2>
            <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1 text-xs font-medium outline-none">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-slate-400 text-sm">
            Interactive Chart Component Will Go Here
          </div>
        </div>

        {/* Top Courses */}
        <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Top Courses</h2>
          <div className="space-y-6">
            {[
              { name: 'Trading Masterclass', students: 450, growth: '+15%' },
              { name: 'Options Secrets', students: 320, growth: '+10%' },
              { name: 'Forex Basics', students: 180, growth: '+5%' },
            ].map((course) => (
              <div key={course.name} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{course.name}</div>
                  <div className="text-xs text-slate-500">{course.students} Students</div>
                </div>
                <div className="text-xs font-bold text-emerald-500">{course.growth}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Re-using cn utility helper locally if needed, but better to import it
import { cn } from "@/lib/utils";
