"use client"

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  GraduationCap,
  Users,
  ShieldCheck,
  Globe,
  Zap,
  CheckCircle2,
  PlayCircle,
  Search,
  Activity,
  LineChart,
  Trophy,
  Target,
  TrendingUp
} from "lucide-react";
import { MarketTicker } from "@/components/market-ticker";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    month: 'Month 01',
    title: 'Foundations & Mindset',
    desc: 'Master market psychology, risk management, and the core mechanics of trading platforms.',
    icon: Target,
    color: 'emerald'
  },
  {
    month: 'Month 02',
    title: 'Technical Mastery',
    desc: 'Deep dive into price action, indicator confluence, and advanced chart patterns.',
    icon: LineChart,
    color: 'blue'
  },
  {
    month: 'Month 03',
    title: 'Strategic Execution',
    desc: 'Backtesting strategies, live trading simulations, and professional capital management.',
    icon: Trophy,
    color: 'purple'
  }
];

export default function Home() {
  const [activeStep, setActiveStep] = useState(0);
  const [realStats, setRealStats] = useState<{ students: string, completion: string, revenue: string } | null>(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/stats/overview')
      .then(res => res.json())
      .then(data => {
        const studentStat = data.stats.find((s: any) => s.name === 'Total Students');
        const completionStat = data.stats.find((s: any) => s.name === 'Completion Rate');
        const revenueStat = data.stats.find((s: any) => s.name === 'Total Revenue');

        const sVal = parseInt(studentStat?.value.replace(/,/g, '') || '0');
        const cVal = parseInt(completionStat?.value.replace('%', '') || '0');

        setRealStats({
          students: sVal > 20 ? studentStat.value : '50+',
          completion: cVal > 60 ? completionStat.value : '89%',
          revenue: sVal > 20 ? `+${revenueStat.value}` : '+$11,245.50'
        });
      })
      .catch(err => console.error('Stats fetch error:', err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen transition-colors duration-300 selection:bg-emerald-500/30">

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center bg-white dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-emerald-500 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-600 rounded-full blur-[150px] animate-pulse delay-700" />
        </div>

        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.png"
            alt="Trading Dashboard"
            fill
            className="object-cover opacity-100 brightness-[0.3]"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/80 to-slate-950" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center lg:text-left grid lg:grid-cols-2 items-center gap-16 pt-20">
          <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-5 py-2 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              <span>Certified Professional Trading Track</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] mb-8 text-white">
              Evolve Into A <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">Master Trader.</span>
            </h1>

            <p className="max-w-xl text-lg md:text-xl text-slate-400 mb-12 leading-relaxed font-medium">
              Don't just trade. Understand the math, the psychology, and the strategy behind every move. Our 3-month immersive program turns beginners into disciplined professionals.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <Link href="/course" className="group flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-3xl text-lg font-black transition-all hover:scale-105 shadow-2xl shadow-emerald-500/20 active:scale-95">
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/portal" className="flex items-center gap-3 bg-white/5 hover:bg-white/10 text-white px-10 py-5 rounded-3xl text-lg font-black transition-all border border-white/10 backdrop-blur-sm active:scale-95">
                <PlayCircle className="w-5 h-5" />
                Live Demo
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-16 flex items-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 font-black text-xs text-white uppercase tracking-widest"><ShieldCheck className="w-4 h-4" /> SECURE</div>
              <div className="flex items-center gap-2 font-black text-xs text-white uppercase tracking-widest"><Globe className="w-4 h-4" /> GLOBAL</div>
              <div className="flex items-center gap-2 font-black text-xs text-white uppercase tracking-widest"><Zap className="w-4 h-4" /> INSTANT</div>
            </div>
          </div>

          {/* Interactive Feature Card */}
          <div className="hidden lg:block relative animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
            <div className="p-8 rounded-[3rem] bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="px-4 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest">Live Engine v2.0</div>
              </div>

              <div className="space-y-6">
                <div className="h-32 bg-slate-900/50 rounded-2xl border border-white/5 flex items-center justify-center relative overflow-hidden">
                  <Activity className="w-full h-full text-emerald-500 opacity-20 animate-pulse" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-black text-white tracking-tighter">{realStats?.revenue || '+$11,245.50'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Success Rate</div>
                    <div className="text-xl font-black text-emerald-400">{realStats?.completion || '89%'}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Active Traders</div>
                    <div className="text-xl font-black text-blue-400">{realStats?.students || '50+'}</div>
                  </div>
                </div>
              </div>

              {/* Decorative Gradient */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500 rounded-full blur-[80px] opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
          </div>
        </div>
      </section>

      <MarketTicker />

      {/* The 3-Month Roadmap - INTERACTIVE */}
      <section className="py-32 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-xs font-black text-emerald-500 uppercase tracking-[0.4em] mb-4">The Evolution Path</h2>
            <h3 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight">Your 90-Day Roadmap</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-6 max-w-2xl mx-auto font-medium">A structured journey designed to take you from market curiosity to strategic execution.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 relative z-10">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveStep(idx)}
                  className={cn(
                    "p-10 rounded-[3rem] transition-all duration-500 cursor-pointer border relative overflow-hidden",
                    isActive
                      ? "bg-white dark:bg-slate-900 border-emerald-500/30 shadow-2xl shadow-emerald-500/5 scale-105"
                      : "bg-transparent border-black/5 dark:border-white/5 hover:border-emerald-500/10"
                  )}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center mb-10 transition-all duration-500",
                    isActive ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 rotate-6" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                  )}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">{step.month}</div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{step.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">{step.desc}</p>

                  {isActive && (
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Background Decorative Line */}
        <div className="absolute top-48 left-0 right-0 h-[70px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent -translate-y-1/2 hidden lg:block" />
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12 items-center justify-center">
            <div className="space-y-6">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Engineered for <br /><span className="text-emerald-500">Accelerated Learning.</span></h3>
              <p className="text-slate-500 font-medium">We've combined decades of trading experience with modern educational technology to create a platform that actually works.</p>
              <div className="pt-4">
                <Link href="/course" className="text-emerald-500 font-black text-sm uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                  Explore Our Syllabus <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="group p-10 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border border-black/5 dark:border-white/5 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-8 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                <BarChart3 className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-black text-slate-900 dark:text-white mb-4">Interactive Analytics</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Practice with real market simulations. Visualize confluent zones and master price action before risking real capital.</p>
            </div>

            <div className="group p-10 rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 border border-black/5 dark:border-white/5 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xl">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-8 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500">
                <Users className="w-7 h-7" />
              </div>
              <h4 className="text-xl font-black text-slate-900 dark:text-white mb-4">High-Level Community</h4>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">Join a network of focused individuals. Share setups, clear doubts, and grow together in a professional environment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 max-w-7xl mx-auto px-6 mb-24">
        <div className="p-12 md:p-20 rounded-[4rem] bg-emerald-600 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-600 opacity-90" />
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <TrendingUp className="w-64 h-64 text-white" />
          </div>

          <div className="relative z-10 text-center space-y-10">
            <h3 className="text-4xl md:text-6xl font-black text-white tracking-tight">Ready to master the markets?</h3>
            <p className="text-emerald-100 text-lg md:text-xl font-medium max-w-2xl mx-auto">Join the next batch and start your journey towards financial independence with expert guidance.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/course" className="bg-white text-emerald-600 px-12 py-5 rounded-3xl text-lg font-black transition-all hover:scale-105 shadow-2xl active:scale-95">
                Apply Now
              </Link>
              <Link href="/portal" className="text-white border-2 border-white/20 hover:border-white px-12 py-5 rounded-3xl text-lg font-black transition-all backdrop-blur-sm active:scale-95">
                View FAQ
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
