"use client"

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Target,
  Users,
  Trophy,
  BarChart3,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Award,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

const STATS = [
  { label: 'Successful Traders', value: '500+', icon: Users, color: 'emerald' },
  { label: 'Years of Experience', value: '12+', icon: BarChart3, color: 'blue' },
  { label: 'Student Satisfaction', value: '98%', icon: Trophy, color: 'purple' },
  { label: 'Live Sessions', value: '1,200+', icon: Zap, color: 'amber' },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500">

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/5 blur-[120px] -mr-32 -mt-32 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-5 py-2 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              <Target className="w-3.5 h-3.5" />
              <span>Our Mission</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] mb-8 tracking-tight">
              Democratizing <br />
              <span className="text-emerald-500">Institutional</span> Trading.
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10 max-w-2xl">
              We bridge the gap between retail curiosity and professional execution. Our academy is built on the belief that anyone can master the markets with the right guidance, discipline, and data-driven strategies.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat, idx) => (
              <div key={idx} className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border border-black/5 dark:border-white/5 group hover:border-emerald-500/20 transition-all">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-all group-hover:scale-110",
                  stat.color === 'emerald' && "bg-emerald-500/10 text-emerald-500",
                  stat.color === 'blue' && "bg-blue-500/10 text-blue-500",
                  stat.color === 'purple' && "bg-purple-500/10 text-purple-500",
                  stat.color === 'amber' && "bg-amber-500/10 text-amber-500",
                )}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{stat.value}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder's Story */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-emerald-500 rounded-[3rem] rotate-3 opacity-10 group-hover:rotate-6 transition-transform" />
            <div className="relative aspect-[4/5] bg-slate-100 dark:bg-slate-900 rounded-[3rem] overflow-hidden border border-black/5 dark:border-white/5 shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center text-slate-400 italic text-sm">
                [Founder Image - Krishna]
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-slate-950 to-transparent">
                <h4 className="text-2xl font-black text-white mb-1">Krishna</h4>
                <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Head Mentor & Founder</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">A Journey from <br /><span className="text-emerald-500">Confusion to Clarity.</span></h2>
            <div className="space-y-6 text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              <p>
                Trading wasn&apos;t always easy for me. Like many, I started with a laptop and a lot of misconceptions. I spent years navigating the &quot;noise&quot; of the markets, losing capital, and questioning if professional trading was even possible for retail individuals.
              </p>
              <p>
                Everything changed when I stopped looking for &quot;holy grail&quot; indicators and started focusing on Order Flow, Psychology, and Risk Mathematics.
              </p>
              <p>
                Today, my mission is to save you the years of struggle I went through. We&apos;ve distilled a decade of experience into a structured 3-month roadmap that works for the modern Indian market.
              </p>
            </div>
            <div className="pt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-5 py-3 rounded-2xl border border-black/5">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-black uppercase tracking-widest">Certified Mentor</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-5 py-3 rounded-2xl border border-black/5">
                <Award className="w-5 h-5 text-emerald-500" />
                <span className="text-xs font-black uppercase tracking-widest">7+ Years Experience</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-32 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-xs font-black text-emerald-500 uppercase tracking-[0.4em] mb-4">Our DNA</h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Built on Core Principles</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Transparency', desc: 'No fake screenshots. No unrealistic promises. We show the wins, the losses, and the lessons.', icon: Globe },
              { title: 'Community', desc: 'Trading is lonely. We provide a war-room environment where experts and students grow together.', icon: Users },
              { title: 'Math Over Luck', desc: 'We treat trading as a business of probabilities, not a casino of guesses.', icon: TrendingUp },
            ].map((v, i) => (
              <div key={i} className="p-10 rounded-[3rem] bg-white dark:bg-slate-950 border border-black/5 dark:border-white/5 hover:shadow-2xl transition-all group">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <v.icon className="w-7 h-7" />
                </div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">{v.title}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="p-12 md:p-20 rounded-[4rem] bg-emerald-600 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-600 opacity-90" />
            <div className="relative z-10 text-center space-y-10">
              <h3 className="text-4xl md:text-6xl font-black text-white tracking-tight">Join the Revolution.</h3>
              <p className="text-emerald-100 text-lg font-medium max-w-xl mx-auto">Stop gambling and start trading. Experience the difference of institutional-grade education.</p>
              <Link href="/course" className="inline-flex items-center gap-3 bg-white text-emerald-600 px-10 py-5 rounded-3xl text-lg font-black transition-all hover:scale-105 active:scale-95 shadow-2xl">
                Explore Courses <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
