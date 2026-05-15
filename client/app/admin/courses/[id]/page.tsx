"use client"

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api-config';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  BookOpen,
  Video,
  DollarSign,
  HelpCircle,
  Layout,
  PlusCircle,
  PlayCircle,
  FileText,
  Lightbulb,
  Link as LinkIcon,
  MessageCircle,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import Link from 'next/link';
import { cn } from "@/lib/utils";

type Resource = { title: string; url: string; type: string };
type LessonFAQ = { question: string; answer: string };
type ContentBlock = {
  type: 'heading' | 'subheading' | 'paragraph' | 'image' | 'graph' | 'algorithm' | 'question' | 'note' | 'list';
  content: string;
  metadata?: {
    url?: string;
    language?: string;
    graphType?: string;
    options?: string[];
    correctAnswer?: string;
    caption?: string;
  };
};

type Lesson = {
  title: string;
  duration: string;
  notes: string;
  contentBlocks?: ContentBlock[];
  videoUrl: string;
  liveClassUrl: string;
  methods: string;
  practiceQuestions: string[];
  resources: Resource[];
  faqs: LessonFAQ[];
};
type Section = { title: string; lessons: Lesson[] };
type CourseFAQ = { question: string; answer: string };

export default function EditCourse() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [curriculum, setCurriculum] = useState<Section[]>([
    { title: '', lessons: [createEmptyLesson()] }
  ]);
  const [faqs, setFaqs] = useState<CourseFAQ[]>([{ question: '', answer: '' }]);

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
    instructor: 'Krishna Sharma',
  });

  const [contentModal, setContentModal] = useState<{ sIdx: number; lIdx: number } | null>(null);

  function createEmptyLesson(): Lesson {
    return {
      title: '',
      duration: '',
      notes: '',
      contentBlocks: [],
      videoUrl: '',
      liveClassUrl: '',
      methods: '',
      practiceQuestions: [],
      resources: [],
      faqs: []
    };
  }

  // ── Fetch & seed ────────────────────────────────────────────────────────────
  useEffect(() => { fetchCourse(); }, [id]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${id}`);
      const course = await res.json();
      if (course) {
        setFormData({
          title: course.title ?? '',
          subtitle: course.subtitle ?? '',
          description: course.description ?? '',
          bannerImage: course.bannerImage ?? '',
          videoPreviewUrl: course.videoPreviewUrl ?? '',
          price: String(course.price ?? ''),
          discountPrice: course.discountPrice != null ? String(course.discountPrice) : '',
          currency: course.currency ?? 'USD',
          duration: course.duration ?? '3 Months',
          level: course.level ?? 'Beginner',
          category: course.category ?? 'Trading',
          instructor: course.instructor ?? 'Krishna Sharma',
        });

        if (course.curriculum && course.curriculum.length > 0) {
          // Map to ensure all lesson fields exist
          const mappedCurriculum = course.curriculum.map((s: any) => ({
            ...s,
            lessons: s.lessons.map((l: any) => ({
              ...createEmptyLesson(),
              ...l
            }))
          }));
          setCurriculum(mappedCurriculum);
        }

        if (course.faqs && course.faqs.length > 0) {
          setFaqs(course.faqs);
        }
      }
    } catch (err) {
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Curriculum helpers ──────────────────────────────────────────────────────
  const addSection = () =>
    setCurriculum([...curriculum, { title: '', lessons: [createEmptyLesson()] }]);

  const removeSection = (sIdx: number) =>
    setCurriculum(curriculum.filter((_, i) => i !== sIdx));

  const updateSectionTitle = (sIdx: number, title: string) => {
    const c = [...curriculum];
    c[sIdx] = { ...c[sIdx], title };
    setCurriculum(c);
  };

  const addLesson = (sIdx: number) => {
    const c = [...curriculum];
    c[sIdx].lessons = [...c[sIdx].lessons, createEmptyLesson()];
    setCurriculum(c);
  };

  const removeLesson = (sIdx: number, lIdx: number) => {
    const c = [...curriculum];
    c[sIdx].lessons = c[sIdx].lessons.filter((_, i) => i !== lIdx);
    setCurriculum(c);
  };

  const updateLesson = (sIdx: number, lIdx: number, field: keyof Lesson, val: any) => {
    setCurriculum(prev => {
      const next = [...prev];
      const section = { ...next[sIdx] };
      const lessons = [...section.lessons];
      lessons[lIdx] = { ...lessons[lIdx], [field]: val };
      section.lessons = lessons;
      next[sIdx] = section;
      return next;
    });
  };

  const [savingLesson, setSavingLesson] = useState(false);

  const saveLessonProgress = async () => {
    if (!contentModal) return;
    setSavingLesson(true);
    try {
      const lesson = curriculum[contentModal.sIdx].lessons[contentModal.lIdx];
      const res = await fetch(`${API_BASE_URL}/api/courses/${id}/lessons/${contentModal.sIdx}/${contentModal.lIdx}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lesson),
      });
      if (res.ok) {
        // Optional: show a toast or temporary success state
      } else {
        alert('Error saving lesson progress');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingLesson(false);
    }
  };

  // ── Content Modal Helpers ───────────────────────────────────────────────────
  const openContentModal = (sIdx: number, lIdx: number) => setContentModal({ sIdx, lIdx });
  const closeContentModal = () => setContentModal(null);

  const updateSelectedLessonContent = (field: keyof Lesson, val: any) => {
    if (!contentModal) return;
    updateLesson(contentModal.sIdx, contentModal.lIdx, field, val);
  };

  const addContentBlock = (type: ContentBlock['type']) => {
    if (!contentModal) return;
    const lesson = curriculum[contentModal.sIdx].lessons[contentModal.lIdx];
    const blocks = lesson.contentBlocks || [];
    const newBlock: ContentBlock = { type, content: '', metadata: {} };
    updateSelectedLessonContent('contentBlocks', [...blocks, newBlock]);
  };

  const updateContentBlock = (bIdx: number, updates: Partial<ContentBlock>) => {
    if (!contentModal) return;
    const lesson = curriculum[contentModal.sIdx].lessons[contentModal.lIdx];
    const blocks = [...(lesson.contentBlocks || [])];
    blocks[bIdx] = { ...blocks[bIdx], ...updates };
    updateSelectedLessonContent('contentBlocks', blocks);
  };

  const removeContentBlock = (bIdx: number) => {
    if (!contentModal) return;
    const lesson = curriculum[contentModal.sIdx].lessons[contentModal.lIdx];
    const blocks = (lesson.contentBlocks || []).filter((_, i) => i !== bIdx);
    updateSelectedLessonContent('contentBlocks', blocks);
  };

  // ── FAQ helpers ─────────────────────────────────────────────────────────────
  const addFaq = () => setFaqs([...faqs, { question: '', answer: '' }]);
  const removeFaq = (i: number) => setFaqs(faqs.filter((_, idx) => idx !== i));
  const updateFaq = (i: number, field: keyof CourseFAQ, val: string) => {
    const f = [...faqs];
    f[i][field] = val;
    setFaqs(f);
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
          curriculum,
          faqs: faqs.filter(f => f.question.trim() !== ''),
          topics: curriculum.flatMap(s => s.lessons).map((l, i) => ({ name: l.title, order: i + 1 }))
        }),
      });
      if (res.ok) router.push('/admin/courses');
      else alert('Error updating course');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const sectionNum = (i: number) => String(i + 1).padStart(2, '0');

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/courses"
          className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 text-slate-500 hover:text-emerald-500 transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Edit Course</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Update curriculum structure and lesson content.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Column ─────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-8">

          {/* General Details */}
          <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 space-y-8 shadow-sm">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <Layout className="w-6 h-6 text-emerald-500" /> General Details
            </h3>
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Course Title</label>
                <input
                  type="text" required value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Advanced Options Trading Masterclass"
                  className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-lg font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Subtitle / Tagline</label>
                <input
                  type="text" value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g., Master the art of risk management and leverage."
                  className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Full Description</label>
                <textarea
                  required value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={7}
                  placeholder="Tell your students exactly what they are getting..."
                  className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Syllabus Architecture */}
          <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 space-y-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-emerald-500" /> Syllabus Architecture
              </h3>
              <button
                type="button" onClick={addSection}
                className="text-sm font-bold text-emerald-500 flex items-center gap-2 hover:bg-emerald-500/10 px-4 py-2 rounded-xl transition-all"
              >
                <PlusCircle className="w-4 h-4" /> Add Topic
              </button>
            </div>

            <div className="space-y-6">
              {curriculum.map((section, sIdx) => (
                <div key={sIdx} className="p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 space-y-5 border border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-4">
                    <span className="w-10 h-10 shrink-0 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-sm">
                      {sectionNum(sIdx)}
                    </span>
                    <input
                      type="text"
                      value={section.title}
                      onChange={e => updateSectionTitle(sIdx, e.target.value)}
                      placeholder="Topic Title (e.g., Market Fundamentals)"
                      className="bg-transparent border-none outline-none font-black text-xl flex-grow placeholder:opacity-30"
                    />
                    {curriculum.length > 1 && (
                      <button
                        type="button" onClick={() => removeSection(sIdx)}
                        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3 pl-14">
                    {section.lessons.map((lesson, lIdx) => (
                      <div key={lIdx} className="flex gap-3 items-center group">
                        <PlayCircle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                        <input
                          type="text"
                          value={lesson.title}
                          onChange={e => updateLesson(sIdx, lIdx, 'title', e.target.value)}
                          placeholder="Subtopic name"
                          className="flex-grow px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border-none outline-none text-sm focus:ring-2 focus:ring-emerald-500/10"
                        />
                        <input
                          type="text"
                          value={lesson.duration}
                          onChange={e => updateLesson(sIdx, lIdx, 'duration', e.target.value)}
                          placeholder="10:00"
                          className="w-24 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border-none outline-none text-sm font-mono focus:ring-2 focus:ring-emerald-500/10"
                        />

                        {/* Edit Content Button */}
                        <button
                          type="button"
                          onClick={() => openContentModal(sIdx, lIdx)}
                          className="px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                          Edit Content
                        </button>

                        {section.lessons.length > 1 && (
                          <button
                            type="button" onClick={() => removeLesson(sIdx, lIdx)}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button" onClick={() => addLesson(sIdx)}
                      className="text-[10px] font-black uppercase text-emerald-500 tracking-widest mt-1 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Subtopic
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student FAQs */}
          <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 space-y-8 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <HelpCircle className="w-6 h-6 text-emerald-500" /> Student FAQs
              </h3>
              <button
                type="button" onClick={addFaq}
                className="text-sm font-bold text-emerald-500 flex items-center gap-2 hover:bg-emerald-500/10 px-4 py-2 rounded-xl transition-all"
              >
                <PlusCircle className="w-4 h-4" /> Add FAQ
              </button>
            </div>

            <div className="space-y-5">
              {faqs.map((faq, i) => (
                <div key={i} className="p-6 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800/50 space-y-3 border border-black/5 dark:border-white/5">
                  <div className="flex items-start gap-3">
                    <input
                      type="text" value={faq.question}
                      onChange={e => updateFaq(i, 'question', e.target.value)}
                      placeholder="Question"
                      className="flex-grow px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border-none outline-none text-sm font-bold focus:ring-2 focus:ring-emerald-500/10"
                    />
                    {faqs.length > 1 && (
                      <button type="button" onClick={() => removeFaq(i)} className="p-2 text-slate-400 hover:text-red-500 transition-colors mt-0.5">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <textarea
                    value={faq.answer}
                    onChange={e => updateFaq(i, 'answer', e.target.value)}
                    placeholder="Answer"
                    rows={3}
                    className="w-full px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border-none outline-none text-sm resize-none focus:ring-2 focus:ring-emerald-500/10"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right Column ─────────────────────────────────────── */}
        <div className="lg:col-span-4 space-y-8">

          {/* Course Economics */}
          <div className="p-8 rounded-[3rem] bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 space-y-6 shadow-xl shadow-emerald-500/10">
            <h3 className="font-black flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Course Economics
            </h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-70">Base Price</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold">$</span>
                  <input
                    type="number" required min={0} value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0"
                    className="w-full pl-10 pr-6 py-4 rounded-2xl bg-white/10 border border-white/20 outline-none font-bold text-xl placeholder:opacity-40"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase opacity-70">Sale Price (Optional)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold">$</span>
                  <input
                    type="number" min={0} value={formData.discountPrice}
                    onChange={e => setFormData({ ...formData, discountPrice: e.target.value })}
                    placeholder="0"
                    className="w-full pl-10 pr-6 py-4 rounded-2xl bg-white/10 border border-white/20 outline-none font-bold text-xl text-emerald-300 dark:text-emerald-950 placeholder:opacity-40"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 space-y-5 shadow-sm">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Duration</label>
              <select
                value={formData.duration}
                onChange={e => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold text-sm"
              >
                <option>1 Month</option>
                <option>2 Months</option>
                <option>3 Months</option>
                <option>6 Months</option>
                <option>12 Months</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">Level</label>
              <select
                value={formData.level}
                onChange={e => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none font-bold text-sm"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>

          <button
            type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white py-6 rounded-[1.5rem] md:rounded-[2.5rem] font-black text-lg transition-all shadow-2xl shadow-emerald-500/30 active:scale-95 disabled:opacity-50"
          >
            {saving ? (
              <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Updating...</>
            ) : (
              <><Save className="w-5 h-5" /> Update Course</>
            )}
          </button>
        </div>
      </form>

      {/* ── Lesson Content Modal ─────────────────────────────────────────── */}
      {contentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl border border-black/5 dark:border-white/5 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="px-10 py-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  Topic: {curriculum[contentModal.sIdx].title}
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {curriculum[contentModal.sIdx].lessons[contentModal.lIdx].title || 'Untitled Lesson'}
                </h3>
              </div>
              <button
                onClick={closeContentModal}
                className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 text-slate-400 hover:text-red-500 transition-all shadow-sm"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              {contentModal && (
                <>
                  {/* Dynamic Content Blocks Architecture */}
                  <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-4">
                      <h4 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
                        <Layout className="w-5 h-5" /> Sequential Topic Builder
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { t: 'heading', l: '+ Heading', i: FileText },
                          { t: 'subheading', l: '+ Subheading', i: FileText },
                          { t: 'paragraph', l: '+ Text', i: FileText },
                          { t: 'list', l: '+ List', i: Layout },
                          { t: 'image', l: '+ Image', i: Video },
                          { t: 'graph', l: '+ Graph', i: TrendingUp },
                          { t: 'algorithm', l: '+ Algo', i: Lightbulb },
                          { t: 'note', l: '+ Note', i: HelpCircle }
                        ].map(btn => (
                          <button
                            key={btn.t}
                            type="button"
                            onClick={() => addContentBlock(btn.t as any)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all border border-black/5 dark:border-white/5"
                          >
                            {btn.l}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      {(curriculum[contentModal.sIdx].lessons[contentModal.lIdx].contentBlocks || []).map((block, bIdx) => (
                        <div key={bIdx} className="group relative p-6 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/30 border border-black/5 dark:border-white/5 animate-in slide-in-from-bottom-4 duration-500">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                              {block.type} Block
                            </span>
                            <button
                              type="button"
                              onClick={() => removeContentBlock(bIdx)}
                              className="p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {block.type === 'heading' && (
                            <input
                              type="text"
                              value={block.content || ''}
                              onChange={e => updateContentBlock(bIdx, { content: e.target.value })}
                              placeholder="Topic Heading..."
                              className="w-full bg-transparent border-none outline-none font-black text-2xl text-slate-900 dark:text-white"
                            />
                          )}

                          {block.type === 'subheading' && (
                            <input
                              type="text"
                              value={block.content || ''}
                              onChange={e => updateContentBlock(bIdx, { content: e.target.value })}
                              placeholder="Subheading..."
                              className="w-full bg-transparent border-none outline-none font-bold text-lg text-slate-800 dark:text-slate-200"
                            />
                          )}

                          {block.type === 'paragraph' && (
                            <textarea
                              value={block.content || ''}
                              onChange={e => updateContentBlock(bIdx, { content: e.target.value })}
                              placeholder="Detailed explanation goes here..."
                              rows={4}
                              className="w-full bg-transparent border-none outline-none text-sm text-slate-500 dark:text-slate-400 leading-relaxed resize-none"
                            />
                          )}

                          {block.type === 'image' && (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={block.metadata?.url || ''}
                                onChange={e => updateContentBlock(bIdx, { metadata: { ...block.metadata, url: e.target.value } })}
                                placeholder="Image URL (Unsplash/Imgur)..."
                                className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-xs border border-black/5 dark:border-white/5"
                              />
                              <input
                                type="text"
                                value={block.metadata?.caption || ''}
                                onChange={e => updateContentBlock(bIdx, { metadata: { ...block.metadata, caption: e.target.value } })}
                                placeholder="Image Caption..."
                                className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-[10px] opacity-60 border border-black/5 dark:border-white/5"
                              />
                            </div>
                          )}

                          {block.type === 'graph' && (
                            <div className="grid md:grid-cols-2 gap-4">
                              <select
                                value={block.metadata?.graphType || ''}
                                onChange={e => updateContentBlock(bIdx, { metadata: { ...block.metadata, graphType: e.target.value } })}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-xs border border-black/5 dark:border-white/5 outline-none font-bold"
                              >
                                <option value="">Select Graph Type</option>
                                <option value="PAYOFF">Payoff Diagram</option>
                                <option value="DELTA">Delta S-Curve</option>
                                <option value="GAMMA">Gamma Curve</option>
                                <option value="THETA">Theta Decay</option>
                                <option value="IV_SURFACE">Volatility Surface</option>
                              </select>
                              <input
                                type="text"
                                value={block.metadata?.caption || ''}
                                onChange={e => updateContentBlock(bIdx, { metadata: { ...block.metadata, caption: e.target.value } })}
                                placeholder="Graph Description..."
                                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-xs border border-black/5 dark:border-white/5"
                              />
                            </div>
                          )}

                          {block.type === 'algorithm' && (
                            <div className="space-y-3">
                              <select
                                value={block.metadata?.language || 'python'}
                                onChange={e => updateContentBlock(bIdx, { metadata: { ...block.metadata, language: e.target.value } })}
                                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 text-[10px] font-black uppercase tracking-widest border border-black/5 dark:border-white/5"
                              >
                                <option value="python">Python</option>
                                <option value="javascript">JavaScript</option>
                                <option value="pine">Pine Script</option>
                              </select>
                              <textarea
                                value={block.content || ''}
                                onChange={e => updateContentBlock(bIdx, { content: e.target.value })}
                                placeholder="Code snippet or algorithmic logic..."
                                rows={6}
                                className="w-full px-5 py-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs border border-white/5 outline-none"
                              />
                            </div>
                          )}

                          {block.type === 'note' && (
                            <div className="flex gap-4">
                              <div className="w-1.5 h-12 rounded-full bg-emerald-500 shrink-0" />
                              <textarea
                                value={block.content || ''}
                                onChange={e => updateContentBlock(bIdx, { content: e.target.value })}
                                placeholder="Professional tip or important warning..."
                                className="w-full bg-transparent border-none outline-none italic text-sm text-emerald-600 dark:text-emerald-400 font-medium leading-relaxed resize-none"
                              />
                            </div>
                          )}

                          {block.type === 'list' && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">List Items</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const options = block.metadata?.options || [];
                                    updateContentBlock(bIdx, { metadata: { ...block.metadata, options: [...options, ''] } });
                                  }}
                                  className="text-[10px] font-black uppercase text-emerald-500 hover:underline"
                                >
                                  + Add Item
                                </button>
                              </div>
                              <div className="space-y-2">
                                {(block.metadata?.options || []).map((item, iIdx) => (
                                  <div key={iIdx} className="flex gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-3 shrink-0" />
                                    <input
                                      type="text"
                                      value={item || ''}
                                      onChange={e => {
                                        const options = [...(block.metadata?.options || [])];
                                        options[iIdx] = e.target.value;
                                        updateContentBlock(bIdx, { metadata: { ...block.metadata, options } });
                                      }}
                                      placeholder={`Item ${iIdx + 1}`}
                                      className="w-full bg-transparent border-none outline-none text-sm text-slate-600 dark:text-slate-400"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const options = (block.metadata?.options || []).filter((_, i) => i !== iIdx);
                                        updateContentBlock(bIdx, { metadata: { ...block.metadata, options } });
                                      }}
                                      className="p-1 text-slate-300 hover:text-red-500"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}

                      {(curriculum[contentModal.sIdx].lessons[contentModal.lIdx].contentBlocks || []).length === 0 && (
                        <div className="py-20 rounded-[3rem] border-2 border-dashed border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-center opacity-30">
                          <Layout className="w-12 h-12 mb-4" />
                          <p className="font-bold">No sequential blocks added yet.</p>
                          <p className="text-xs">Use the buttons above to build your topic elementally.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Videos & Links */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Video className="w-4 h-4" /> Video URL (YouTube/Vimeo)
                      </label>
                      <input
                        type="url"
                        value={curriculum[contentModal.sIdx].lessons[contentModal.lIdx].videoUrl}
                        onChange={e => updateSelectedLessonContent('videoUrl', e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <PlayCircle className="w-4 h-4" /> Live Class URL
                      </label>
                      <input
                        type="url"
                        value={curriculum[contentModal.sIdx].lessons[contentModal.lIdx].liveClassUrl}
                        onChange={e => updateSelectedLessonContent('liveClassUrl', e.target.value)}
                        placeholder="Zoom / Google Meet link"
                        className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Practice Questions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Practice Questions
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const cur = curriculum[contentModal.sIdx].lessons[contentModal.lIdx].practiceQuestions || [];
                          updateSelectedLessonContent('practiceQuestions', [...cur, '']);
                        }}
                        className="text-[10px] font-black uppercase text-emerald-500 hover:underline"
                      >
                        + Add Question
                      </button>
                    </div>
                    <div className="space-y-3">
                      {(curriculum[contentModal.sIdx].lessons[contentModal.lIdx].practiceQuestions || []).map((q, qIdx) => (
                        <div key={qIdx} className="flex gap-3">
                          <input
                            type="text"
                            value={q}
                            onChange={e => {
                              const cur = [...(curriculum[contentModal.sIdx].lessons[contentModal.lIdx].practiceQuestions || [])];
                              cur[qIdx] = e.target.value;
                              updateSelectedLessonContent('practiceQuestions', cur);
                            }}
                            placeholder={`Question ${qIdx + 1}`}
                            className="flex-grow px-6 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-sm focus:ring-2 focus:ring-emerald-500/10"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const cur = curriculum[contentModal.sIdx].lessons[contentModal.lIdx].practiceQuestions.filter((_, i) => i !== qIdx);
                              updateSelectedLessonContent('practiceQuestions', cur);
                            }}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resources */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <LinkIcon className="w-4 h-4" /> Learning Resources
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const cur = curriculum[contentModal.sIdx].lessons[contentModal.lIdx].resources || [];
                          updateSelectedLessonContent('resources', [...cur, { title: '', url: '', type: 'link' }]);
                        }}
                        className="text-[10px] font-black uppercase text-emerald-500 hover:underline"
                      >
                        + Add Resource
                      </button>
                    </div>
                    <div className="space-y-3">
                      {(curriculum[contentModal.sIdx].lessons[contentModal.lIdx].resources || []).map((res, rIdx) => (
                        <div key={rIdx} className="grid grid-cols-12 gap-3">
                          <input
                            type="text"
                            value={res.title}
                            onChange={e => {
                              const cur = [...(curriculum[contentModal.sIdx].lessons[contentModal.lIdx].resources || [])];
                              cur[rIdx].title = e.target.value;
                              updateSelectedLessonContent('resources', cur);
                            }}
                            placeholder="Resource Title"
                            className="col-span-5 px-6 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-sm focus:ring-2 focus:ring-emerald-500/10"
                          />
                          <input
                            type="url"
                            value={res.url}
                            onChange={e => {
                              const cur = [...(curriculum[contentModal.sIdx].lessons[contentModal.lIdx].resources || [])];
                              cur[rIdx].url = e.target.value;
                              updateSelectedLessonContent('resources', cur);
                            }}
                            placeholder="URL"
                            className="col-span-6 px-6 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none text-sm focus:ring-2 focus:ring-emerald-500/10"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const cur = curriculum[contentModal.sIdx].lessons[contentModal.lIdx].resources.filter((_, i) => i !== rIdx);
                              updateSelectedLessonContent('resources', cur);
                            }}
                            className="col-span-1 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lesson FAQs */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" /> Lesson Specific Q&A
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const cur = curriculum[contentModal.sIdx].lessons[contentModal.lIdx].faqs || [];
                          updateSelectedLessonContent('faqs', [...cur, { question: '', answer: '' }]);
                        }}
                        className="text-[10px] font-black uppercase text-emerald-500 hover:underline"
                      >
                        + Add Q&A
                      </button>
                    </div>
                    <div className="space-y-4">
                      {(curriculum[contentModal.sIdx].lessons[contentModal.lIdx].faqs || []).map((faq, fIdx) => (
                        <div key={fIdx} className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-3 relative">
                          <button
                            type="button"
                            onClick={() => {
                              const cur = curriculum[contentModal.sIdx].lessons[contentModal.lIdx].faqs.filter((_, i) => i !== fIdx);
                              updateSelectedLessonContent('faqs', cur);
                            }}
                            className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={e => {
                              const cur = [...(curriculum[contentModal.sIdx].lessons[contentModal.lIdx].faqs || [])];
                              cur[fIdx].question = e.target.value;
                              updateSelectedLessonContent('faqs', cur);
                            }}
                            placeholder="Question"
                            className="w-full px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border-none outline-none text-sm font-bold focus:ring-2 focus:ring-emerald-500/10"
                          />
                          <textarea
                            value={faq.answer}
                            onChange={e => {
                              const cur = [...(curriculum[contentModal.sIdx].lessons[contentModal.lIdx].faqs || [])];
                              cur[fIdx].answer = e.target.value;
                              updateSelectedLessonContent('faqs', cur);
                            }}
                            placeholder="Answer"
                            rows={2}
                            className="w-full px-5 py-3 rounded-xl bg-white dark:bg-slate-900 border-none outline-none text-sm resize-none focus:ring-2 focus:ring-emerald-500/10"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-10 py-6 border-t border-black/5 dark:border-white/5 flex items-center justify-end bg-slate-50/50 dark:bg-slate-800/50 shrink-0">
              <button
                type="button"
                onClick={saveLessonProgress}
                disabled={savingLesson}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all flex items-center gap-2"
              >
                {savingLesson ? (
                  <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4" /> Save Lesson Progress</>
                )}
              </button>
              <button
                type="button"
                onClick={closeContentModal}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl active:scale-95 transition-all"
              >
                Done Editing Content
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
