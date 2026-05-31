"use client"

import React from 'react';
import Link from 'next/link';
import { 
  Network, 
  CloudSun, 
  Database, 
  Layers, 
  ArrowRight, 
  Activity, 
  Zap 
} from 'lucide-react';

const ARCHITECTURES = [
  {
    slug: 'payment-enrollment-flow',
    title: 'Razorpay & Kafka Enrollment Flow',
    subtitle: 'Event-Driven Transaction Pipeline',
    description: 'Deep-dive into the live cryptographic transaction verification, Kafka purchase events, automatic batch routing/creation, and socket-driven feedback loops.',
    icon: Layers,
    badge: 'Core Automation',
    color: 'emerald',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    border: 'group-hover:border-emerald-500/30'
  },
  {
    slug: 'contact-form-flow',
    title: 'Course Contact Form Flow',
    subtitle: 'Local Docker vs Production API Routing',
    description: 'Examine security protocols, domain names, reverse proxying, and port routing mapping between local development environment and live production host.',
    icon: Network,
    badge: 'API Gateway',
    color: 'blue',
    gradient: 'from-blue-500/20 to-indigo-500/20',
    border: 'group-hover:border-blue-500/30'
  },
  {
    slug: 'weather-api-flow',
    title: 'Weather API Request Flow',
    subtitle: 'External Integration Sequence',
    description: 'Learn authentication, REST headers, API query structures, and asynchronous data fetching techniques when talking to external weather microservices.',
    icon: CloudSun,
    badge: 'Microservices',
    color: 'amber',
    gradient: 'from-amber-500/20 to-orange-500/20',
    border: 'group-hover:border-amber-500/30'
  },
  {
    slug: 'mongodb-crud-flow',
    title: 'MongoDB CRUD Flow',
    subtitle: 'Controller to Persistence Tier Lifecycle',
    description: 'A visual mapping of API controllers, middleware execution, and mongoose driver commands routing queries directly to the persistence layer.',
    icon: Database,
    badge: 'Persistence Tier',
    color: 'purple',
    gradient: 'from-purple-500/20 to-pink-500/20',
    border: 'group-hover:border-purple-500/30'
  }
];

export default function ArchitectureDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20 px-4 transition-colors duration-500">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            System Blueprint Center
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight leading-none">
            Interactive <span className="text-emerald-500">Architecture</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[11px] max-w-xl mx-auto">
            Explore execution pipelines, sequence triggers, and network pathways powering the Trading Skill site application.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid md:grid-cols-2 gap-8 pt-6">
          {ARCHITECTURES.map((arch) => {
            const Icon = arch.icon;
            return (
              <Link 
                href={`/architecture/${arch.slug}`} 
                key={arch.slug}
                className="group relative block bg-white dark:bg-slate-900/60 backdrop-blur-md rounded-[3rem] p-8 border border-black/5 dark:border-white/5 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden"
              >
                {/* Glow Overlay */}
                <div className={`absolute top-0 right-0 w-48 h-48 bg-gradient-to-br ${arch.gradient} blur-[60px] opacity-20 group-hover:opacity-60 transition-all duration-1000 -mr-16 -mt-16`} />

                <div className="flex flex-col h-full justify-between relative z-10 space-y-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className={`w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-black/5 dark:border-white/5 transition-all duration-500 group-hover:scale-110 group-hover:bg-slate-900 dark:group-hover:bg-slate-800 group-hover:text-emerald-500`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800/80 px-4 py-1.5 rounded-full text-slate-500 dark:text-slate-400 border border-black/5 dark:border-white/5">
                        {arch.badge}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {arch.title}
                      </h2>
                      <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">
                        {arch.subtitle}
                      </p>
                      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed pt-2">
                        {arch.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-emerald-500 transition-colors flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      Launch Walkthrough
                    </span>
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-black/5 dark:border-white/5 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
