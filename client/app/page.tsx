import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, GraduationCap, Users, ShieldCheck, Globe, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen transition-colors duration-300 selection:bg-emerald-500/30">

      {/* Hero Section */}
      <section className="relative min-h-screen pt-[3rem] flex flex-col justify-center bg-white dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.png"
            alt="Trading Dashboard Dark"
            fill
            className="object-cover opacity-100 hidden dark:block"
            priority
          />
          <Image
            src="/hero-bg.png"
            alt="Trading Dashboard Light"
            fill
            className="object-cover opacity-90 block dark:hidden"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/90 to-slate-950 transition-colors duration-300" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center pt-0">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-8">
            <Zap className="w-3 h-3" />
            <span>Master the Markets in 3 Months</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6 text-white py-2">
            Unlock Your <span className="text-emerald-500">Trading Potential</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-slate-400 mb-10 leading-relaxed">
            From basic concepts to advanced strategies, our structured 3-month course
            provides the tools, analytics, and community you need to succeed in the markets.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/course" className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-full text-lg font-bold transition-all hover:scale-105">
              Explore Courses
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/portal" className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-8 py-4 rounded-full text-lg font-bold transition-all border border-slate-200 dark:border-white/10">
              Student Portal
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 border-t border-black/5 dark:border-white/5 pt-12">
            <div>
              <div className="text-3xl font-bold text-white">50+</div>
              <div className="text-sm text-slate-500">Enrolled Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-500">95%</div>
              <div className="text-sm text-slate-500">Success Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">24/7</div>
              <div className="text-sm text-slate-500">Community Support</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">5+</div>
              <div className="text-sm text-slate-500">Upcoming Batches</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">Comprehensive Training Platform</h2>
            <p className="text-slate-600 dark:text-slate-400">Everything you need to go from a beginner to a pro trader.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-800/50 border border-black/5 dark:border-white/5 hover:border-emerald-500/20 shadow-sm dark:shadow-none transition-all group">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform mx-auto">
                <GraduationCap className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Structured Learning</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                A carefully designed 3-month curriculum covering market psychology,
                technical analysis, and risk management.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-slate-800/50 border border-black/5 dark:border-white/5 hover:border-blue-500/20 shadow-sm dark:shadow-none transition-all group">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform mx-auto">
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Interactive Analytics</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Visualize trading concepts with animated charts and real-time data
                simulations using Plotly and Chart.js.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-slate-800/50 border border-black/5 dark:border-white/5 hover:border-purple-500/20 shadow-sm dark:shadow-none transition-all group">
              <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform mx-auto">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white">Vibrant Community</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Connect with fellow students, clear doubts in batch-specific forums,
                and participate in live Q&A sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
