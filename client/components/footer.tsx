"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Mail,
  MapPin,
  Phone
} from "lucide-react";
import { FaInstagram, FaXTwitter, FaLinkedin, FaYoutube } from "react-icons/fa6";

export function Footer() {
  const pathname = usePathname();

  // Hide Footer in admin area
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-black/5 dark:border-white/5 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <BarChart3 className="w-6 h-6 text-white dark:text-slate-950" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Trading<span className="text-emerald-500">Skill</span>
              </span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-xs">
              Empowering the next generation of traders with institutional-grade knowledge, advanced tools, and a community of experts.
            </p>
            <div className="flex gap-4">
              {[FaInstagram, FaXTwitter, FaLinkedin, FaYoutube].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 text-slate-400 hover:text-emerald-500 hover:border-emerald-500/30 transition-all"
                >
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold mb-6">Learning</h4>
            <ul className="space-y-4">
              {['All Courses', 'Trading Basics', 'Options Secrets', 'Technical Analysis', 'Strategy Builder'].map((item) => (
                <li key={item}>
                  <Link href="/course" className="text-slate-500 dark:text-slate-400 hover:text-emerald-500 text-sm transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4">
              {['About Us', 'Community', 'Expert Mentors', 'Success Stories', 'Contact Support'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-slate-500 dark:text-slate-400 hover:text-emerald-500 text-sm transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold mb-6">Get in Touch</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-emerald-500" />
                </div>
                contact@tradingTrainer.com
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-emerald-500" />
                </div>
                +91 98765 XXXXX (Inquiry: Krishna)
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                </div>
                Katihar, Bihar, India - 854105
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-black/5 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-500 dark:text-slate-400 text-xs flex flex-wrap items-center gap-1">
            © 2026 Trading Skill Trainer. Built for the modern market.
            <span className="mx-1">•</span>
            Digitally Empowered by
            <Link
              href="https://myweb-nine-tawny.vercel.app/"
              target="_blank"
              className="text-emerald-500 font-bold hover:underline transition-all"
            >
              CypherTech
            </Link>
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-xs text-slate-500 hover:text-emerald-500 transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-xs text-slate-500 hover:text-emerald-500 transition-colors">Terms of Service</Link>
            <Link href="#" className="text-xs text-slate-500 hover:text-emerald-500 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
