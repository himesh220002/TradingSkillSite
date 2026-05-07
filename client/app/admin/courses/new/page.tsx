"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  ListChecks,
  Upload,
  BookOpen,
  Video,
  DollarSign,
  HelpCircle,
  Layout,
  PlusCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import Link from 'next/link';

export default function NewCourse() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // States for complex arrays
  const [learningObjectives, setLearningObjectives] = useState<string[]>(['']);
  const [requirements, setRequirements] = useState<string[]>(['']);
  const [faqs, setFaqs] = useState<{ question: string, answer: string }[]>([{ question: '', answer: '' }]);
  const [curriculum, setCurriculum] = useState<{ title: string, lessons: { title: string, duration: string }[] }[]>([
    { title: 'Introduction', lessons: [{ title: 'Welcome to the course', duration: '5:00' }] }
  ]);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    bannerImage: '',
    videoPreviewUrl: '',
    price: '',
    discountPrice: '',
    currency: 'USD',
    duration: '3 Months',
    level: 'Beginner',
    category: 'Trading',
    features: '',
    instructor: 'Krishna Sharma'
  });

  // Handlers for Curriculum
  const addSection = () => setCurriculum([...curriculum, { title: '', lessons: [{ title: '', duration: '' }] }]);
  const addLesson = (sectionIndex: number) => {
    const newCurriculum = [...curriculum];
    newCurriculum[sectionIndex].lessons.push({ title: '', duration: '' });
    setCurriculum(newCurriculum);
  };
  const updateSectionTitle = (index: number, title: string) => {
    const newCurriculum = [...curriculum];
    newCurriculum[index].title = title;
    setCurriculum(newCurriculum);
  };
  const updateLesson = (sIndex: number, lIndex: number, field: 'title' | 'duration', val: string) => {
    const newCurriculum = [...curriculum];
    newCurriculum[sIndex].lessons[lIndex][field] = val;
    setCurriculum(newCurriculum);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
          features: formData.features.split(',').map(f => f.trim()).filter(f => f !== ''),
          learningObjectives: learningObjectives.filter(o => o.trim() !== ''),
          requirements: requirements.filter(r => r.trim() !== ''),
          faqs: faqs.filter(f => f.question.trim() !== ''),
          curriculum: curriculum,
          // Sync with old topics field for backward compatibility
          topics: curriculum.flatMap(s => s.lessons).map((l, i) => ({ name: l.title, order: i + 1 }))
        }),
      });

      if (response.ok) {
        router.push('/admin/courses');
      } else {
        alert('Error creating course');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/courses"
          className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 text-slate-500 hover:text-emerald-500 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Professional Course Architect</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Design high-converting curriculum and detailed educational programs.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column - Detailed Info */}
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: Basic Info */}
          <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 space-y-8 shadow-sm">
            <h3 className="text-xl font-bold flex items-center gap-3"><Layout className="w-6 h-6 text-emerald-500" /> General Details</h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Course Main Title</label>
                <input
                  type="text" required value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Advanced Options Trading Masterclass"
                  className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-lg font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Subtitle / Tagline</label>
                <input
                  type="text" value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g., Master the art of risk management and leverage."
                  className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Long Description</label>
                <textarea
                  required value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  placeholder="Tell your students exactly what they are getting..."
                  className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Curriculum Builder */}
          <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 space-y-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-3"><BookOpen className="w-6 h-6 text-emerald-500" /> Syllabus Architecture</h3>
              <button type="button" onClick={addSection} className="text-sm font-bold text-emerald-500 flex items-center gap-2 hover:bg-emerald-500/10 px-4 py-2 rounded-xl transition-all">
                <PlusCircle className="w-4 h-4" /> Add Section
              </button>
            </div>

            <div className="space-y-6">
              {curriculum.map((section, sIndex) => (
                <div key={sIndex} className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 space-y-6 border border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-sm">0{sIndex + 1}</span>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => updateSectionTitle(sIndex, e.target.value)}
                      placeholder="Section Title (e.g., Market Fundamentals)"
                      className="bg-transparent border-none outline-none font-black text-xl flex-grow placeholder:opacity-30"
                    />
                  </div>

                  <div className="space-y-3 pl-14">
                    {section.lessons.map((lesson, lIndex) => (
                      <div key={lIndex} className="flex gap-4 items-center">
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => updateLesson(sIndex, lIndex, 'title', e.target.value)}
                          placeholder="Lesson name"
                          className="flex-grow px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border-none outline-none text-sm"
                        />
                        <input
                          type="text"
                          value={lesson.duration}
                          onChange={(e) => updateLesson(sIndex, lIndex, 'duration', e.target.value)}
                          placeholder="Duration (e.g. 10:00)"
                          className="w-32 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border-none outline-none text-sm font-mono"
                        />
                      </div>
                    ))}
                    <button type="button" onClick={() => addLesson(sIndex)} className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mt-2 hover:underline">+ Add Lesson</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: FAQs */}
          <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 space-y-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-3"><HelpCircle className="w-6 h-6 text-emerald-500" /> Student FAQs</h3>
              <button type="button" onClick={() => setFaqs([...faqs, { question: '', answer: '' }])} className="text-sm font-bold text-emerald-500">+ Add FAQ</button>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="space-y-2">
                  <input
                    type="text" value={faq.question}
                    onChange={(e) => {
                      const newFaqs = [...faqs];
                      newFaqs[i].question = e.target.value;
                      setFaqs(newFaqs);
                    }}
                    placeholder="Question"
                    className="w-full px-6 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-sm font-bold"
                  />
                  <textarea
                    value={faq.answer}
                    onChange={(e) => {
                      const newFaqs = [...faqs];
                      newFaqs[i].answer = e.target.value;
                      setFaqs(newFaqs);
                    }}
                    placeholder="Answer"
                    className="w-full px-6 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-sm resize-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Controls & Media */}
        <div className="lg:col-span-4 space-y-8">
          {/* Pricing Card */}
          <div className="p-8 rounded-[3rem] bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 space-y-6 shadow-xl shadow-emerald-500/10">
            <h3 className="font-black flex items-center gap-2"><DollarSign className="w-5 h-5" /> Course Economics</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-70">Base Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold">$</span>
                  <input
                    type="number" required value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full pl-10 pr-6 py-4 rounded-2xl bg-white/10 border border-white/20 outline-none font-bold text-xl"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-70">Sale Price (Optional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold">$</span>
                  <input
                    type="number" value={formData.discountPrice}
                    onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                    className="w-full pl-10 pr-6 py-4 rounded-2xl bg-white/10 border border-white/20 outline-none font-bold text-xl text-emerald-400 dark:text-emerald-950"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Media Card */}
          <div className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 space-y-6 shadow-sm">
            <h3 className="font-bold flex items-center gap-2"><Video className="w-5 h-5 text-emerald-500" /> Visual Preview</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Intro Video URL (YT/Vimeo)</label>
                <input
                  type="url" value={formData.videoPreviewUrl}
                  onChange={(e) => setFormData({ ...formData, videoPreviewUrl: e.target.value })}
                  className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Banner Image URL</label>
                <input
                  type="text" value={formData.bannerImage}
                  onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
                  className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-xs"
                />
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 space-y-6 shadow-sm">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Duration</label>
                <select value={formData.duration} onChange={(e) => setFormData({ ...formData, duration: e.target.value })} className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold text-sm">
                  <option>1 Month</option><option>2 Months</option><option>3 Months</option><option>6 Months</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400">Level</label>
                <select value={formData.level} onChange={(e) => setFormData({ ...formData, level: e.target.value })} className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold text-sm">
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white py-6 rounded-[2.5rem] font-black text-lg transition-all shadow-2xl shadow-emerald-500/30 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Live Publish Course'}
          </button>
        </div>
      </form>
    </div>
  );
}
