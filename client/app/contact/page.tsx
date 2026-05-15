"use client"

import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  ExternalLink,
  Zap
} from "lucide-react";
import { FaWhatsapp } from 'react-icons/fa';
import { cn } from "@/lib/utils";

const CONTACT_METHODS = [
  {
    title: 'WhatsApp Us',
    value: '+91 98765 43210',
    desc: 'Instant support for queries.',
    icon: FaWhatsapp,
    color: 'emerald',
    link: 'https://wa.me/919876543210'
  },
  {
    title: 'Call Support',
    value: '+91 98765 43210',
    desc: 'Mon - Sat (10 AM - 7 PM)',
    icon: Phone,
    color: 'blue',
    link: 'tel:+919876543210'
  },
  {
    title: 'Email Support',
    value: 'contact@tradingTrainer.com',
    desc: 'Response within 24 hours.',
    icon: Mail,
    color: 'purple',
    link: 'mailto:contact@tradingTrainer.com'
  },
  {
    title: 'Our Academy',
    value: 'Katihar, Bihar, India',
    desc: 'Opposite Railway Station.',
    icon: MapPin,
    color: 'slate',
    link: '#'
  }
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send message.');
      }
    } catch (error: any) {
      console.error('Contact error:', error);
      setStatus('error');
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500">

      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -ml-32 -mt-32" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-5 py-2 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Connect With Us</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-tight mb-6">
            Get in <span className="text-emerald-500">Touch.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-500 dark:text-slate-400 font-medium">
            Have questions about our batches or need technical support? Our team of experts is ready to help you navigate your trading journey.
          </p>
        </div>
      </section>

      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-12">

          {/* Contact Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-4">
              {CONTACT_METHODS.map((method, idx) => (
                <a
                  key={idx}
                  href={method.link}
                  target={method.link.startsWith('http') ? '_blank' : undefined}
                  className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-black/5 dark:border-white/5 hover:border-emerald-500/20 hover:bg-white dark:hover:bg-slate-900 transition-all group flex items-start gap-6"
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                    method.color === 'emerald' && "bg-emerald-500/10 text-emerald-500",
                    method.color === 'blue' && "bg-blue-500/10 text-blue-500",
                    method.color === 'purple' && "bg-purple-500/10 text-purple-500",
                    method.color === 'slate' && "bg-slate-500/10 text-slate-500",
                  )}>
                    <method.icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{method.title}</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{method.value}</div>
                    <div className="text-xs text-slate-500 font-medium">{method.desc}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-emerald-600 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                <Clock className="w-32 h-32" />
              </div>
              <div className="relative z-10 space-y-4">
                <h4 className="text-xl font-black uppercase tracking-tight">Active Hours</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold text-emerald-100">
                    <span>Monday - Saturday</span>
                    <span>10:00 - 19:00</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-emerald-200/50">
                    <span>Sunday</span>
                    <span className="uppercase tracking-widest text-[10px] bg-white/10 px-2 py-1 rounded-md">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="p-10 md:p-12 rounded-[3rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -mr-32 -mt-32" />

              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-8 tracking-tight flex items-center gap-3">
                <Send className="w-8 h-8 text-emerald-500" /> Send a Message
              </h3>

              {status === 'success' ? (
                <div className="py-20 text-center space-y-6 animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Message Sent!</h4>
                    <p className="text-slate-500 font-medium">Thank you for reaching out. We&apos;ll get back to you shortly.</p>
                  </div>
                  <button
                    onClick={() => setStatus('idle')}
                    className="text-emerald-500 font-black text-xs uppercase tracking-widest hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Full Name</label>
                      <input
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your Name"
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/50 outline-none transition-all font-bold text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Email Address</label>
                      <input
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/50 outline-none transition-all font-bold text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Subject</label>
                    <input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="What is this regarding?"
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/50 outline-none transition-all font-bold text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-4">Message</label>
                    <textarea
                      required
                      rows={6}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Write your message here..."
                      className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/50 outline-none transition-all font-bold text-sm resize-none"
                    />
                  </div>

                  {status === 'error' && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-xs font-bold animate-in slide-in-from-top-2">
                      <XCircle className="w-5 h-5" />
                      {errorMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-6 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3"
                  >
                    {status === 'loading' ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>Send Message <Send className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
