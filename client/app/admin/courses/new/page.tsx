"use client"

import React, { useState } from 'react';
import { API_BASE_URL } from '@/lib/api-config';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Video,
  FileText,
  Clock,
  Layout,
  Layers,
  GraduationCap
} from "lucide-react";

export default function NewCourse() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    price: '',
    discountPrice: '',
    level: 'Beginner',
    duration: '',
    image: '',
    curriculum: [
      {
        sectionTitle: 'Introduction',
        lessons: [{ title: 'Welcome to the Course', type: 'VIDEO', duration: '10 mins' }]
      }
    ]
  });

  const addSection = () => {
    setCourseData({
      ...courseData,
      curriculum: [...courseData.curriculum, { sectionTitle: '', lessons: [] }]
    });
  };

  const addLesson = (sectionIndex: number) => {
    const newCurriculum = [...courseData.curriculum];
    newCurriculum[sectionIndex].lessons.push({ title: '', type: 'VIDEO', duration: '' });
    setCourseData({ ...courseData, curriculum: newCurriculum });
  };

  const updateSection = (index: number, title: string) => {
    const newCurriculum = [...courseData.curriculum];
    newCurriculum[index].sectionTitle = title;
    setCourseData({ ...courseData, curriculum: newCurriculum });
  };

  const updateLesson = (sIdx: number, lIdx: number, field: string, value: string) => {
    const newCurriculum = [...courseData.curriculum];
    (newCurriculum[sIdx].lessons[lIdx] as any)[field] = value;
    setCourseData({ ...courseData, curriculum: newCurriculum });
  };

  const removeSection = (sIdx: number) => {
    const newCurriculum = courseData.curriculum.filter((_, i) => i !== sIdx);
    setCourseData({ ...courseData, curriculum: newCurriculum });
  };

  const removeLesson = (sIdx: number, lIdx: number) => {
    const newCurriculum = [...courseData.curriculum];
    newCurriculum[sIdx].lessons = newCurriculum[sIdx].lessons.filter((_, i) => i !== lIdx);
    setCourseData({ ...courseData, curriculum: newCurriculum });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...courseData,
          price: Number(courseData.price),
          discountPrice: courseData.discountPrice ? Number(courseData.discountPrice) : undefined
        }),
      });

      if (!res.ok) throw new Error('Failed to create course');

      setSuccess(true);
      setTimeout(() => router.push('/admin/courses'), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pt-32 pb-20 px-4 transition-colors">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mb-8 group transition-all">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest">Back to Courses</span>
        </button>

        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Create <span className="text-emerald-500 text-6xl block mt-1">New Course</span></h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em] mt-4">Drafting a new educational track</p>
          </div>
          <GraduationCap className="w-16 h-16 text-emerald-500/20" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Core Info */}
          <section className="bg-slate-50 dark:bg-slate-900/50 border border-black/5 dark:border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-16 -mt-16" />
             <h2 className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
               <Layout className="w-4 h-4" /> Core Framework
             </h2>

             <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Course Title</label>
                      <input 
                        type="text" 
                        required
                        value={courseData.title}
                        onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl py-4 px-6 text-slate-900 dark:text-white outline-none transition-all font-bold shadow-sm"
                        placeholder="e.g. Price Action Mastery"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Banner Image URL</label>
                      <input 
                        type="text" 
                        value={courseData.image}
                        onChange={(e) => setCourseData({...courseData, image: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl py-4 px-6 text-slate-900 dark:text-white outline-none transition-all font-bold shadow-sm"
                        placeholder="https://..."
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Course Narrative (Description)</label>
                   <textarea 
                     required
                     value={courseData.description}
                     onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                     className="w-full bg-white dark:bg-slate-900 border-2 border-transparent focus:border-emerald-500/30 rounded-[2rem] py-4 px-6 text-slate-900 dark:text-white outline-none transition-all font-bold shadow-sm min-h-[120px]"
                     placeholder="Describe the learning journey..."
                   />
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Price ($)</label>
                      <input 
                        type="number" 
                        required
                        value={courseData.price}
                        onChange={(e) => setCourseData({...courseData, price: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl py-4 px-6 text-slate-900 dark:text-white outline-none transition-all font-bold shadow-sm"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Discount ($)</label>
                      <input 
                        type="number" 
                        value={courseData.discountPrice}
                        onChange={(e) => setCourseData({...courseData, discountPrice: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl py-4 px-6 text-slate-900 dark:text-white outline-none transition-all font-bold shadow-sm"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Expertise Level</label>
                      <select 
                        value={courseData.level}
                        onChange={(e) => setCourseData({...courseData, level: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl py-4 px-6 text-slate-900 dark:text-white outline-none transition-all font-bold shadow-sm appearance-none cursor-pointer"
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                        <option>Pro</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Duration</label>
                      <input 
                        type="text" 
                        value={courseData.duration}
                        onChange={(e) => setCourseData({...courseData, duration: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl py-4 px-6 text-slate-900 dark:text-white outline-none transition-all font-bold shadow-sm"
                        placeholder="e.g. 3 Months"
                      />
                   </div>
                </div>
             </div>
          </section>

          {/* Curriculum */}
          <section className="bg-slate-50 dark:bg-slate-900/50 border border-black/5 dark:border-white/5 rounded-[3rem] p-10">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-3">
                  <Layers className="w-4 h-4" /> Curriculum Architecture
                </h2>
                <button type="button" onClick={addSection} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                  <Plus className="w-3.5 h-3.5" /> Add Section
                </button>
             </div>

             <div className="space-y-8">
                {courseData.curriculum.map((section, sIdx) => (
                  <div key={sIdx} className="bg-white dark:bg-slate-950/50 rounded-[2rem] p-8 border border-black/5 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                      <input 
                        type="text" 
                        value={section.sectionTitle}
                        onChange={(e) => updateSection(sIdx, e.target.value)}
                        className="flex-grow bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-emerald-500/30 rounded-xl py-3 px-6 text-sm font-black uppercase tracking-widest outline-none transition-all"
                        placeholder="Section Title"
                      />
                      <button type="button" onClick={() => removeSection(sIdx)} className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-4 ml-6 pl-6 border-l-2 border-emerald-500/20">
                       {section.lessons.map((lesson, lIdx) => (
                         <div key={lIdx} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            <div className="md:col-span-2 relative">
                               <input 
                                 type="text" 
                                 value={lesson.title}
                                 onChange={(e) => updateLesson(sIdx, lIdx, 'title', e.target.value)}
                                 className="w-full bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-emerald-500/20 rounded-xl py-2.5 px-4 text-xs font-bold outline-none"
                                 placeholder="Lesson Title"
                               />
                            </div>
                            <select 
                               value={lesson.type}
                               onChange={(e) => updateLesson(sIdx, lIdx, 'type', e.target.value)}
                               className="bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-emerald-500/20 rounded-xl py-2.5 px-4 text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer"
                            >
                               <option value="VIDEO">Video</option>
                               <option value="PDF">Document</option>
                               <option value="QUIZ">Quiz</option>
                            </select>
                            <div className="flex items-center gap-2">
                               <input 
                                 type="text" 
                                 value={lesson.duration}
                                 onChange={(e) => updateLesson(sIdx, lIdx, 'duration', e.target.value)}
                                 className="flex-grow bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-emerald-500/20 rounded-xl py-2.5 px-4 text-xs font-bold outline-none"
                                 placeholder="10 mins"
                               />
                               <button type="button" onClick={() => removeLesson(sIdx, lIdx)} className="p-2 text-slate-400 hover:text-rose-500 transition-all">
                                 <Trash2 className="w-3.5 h-3.5" />
                               </button>
                            </div>
                         </div>
                       ))}
                       <button type="button" onClick={() => addLesson(sIdx)} className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:gap-3 transition-all mt-4">
                         <Plus className="w-3.5 h-3.5" /> Add Lesson
                       </button>
                    </div>
                  </div>
                ))}
             </div>
          </section>

          {/* Controls */}
          <div className="flex flex-col gap-6">
             {error && (
               <div className="flex items-center gap-3 p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-500 text-sm font-bold animate-shake">
                 <AlertCircle className="w-5 h-5" /> {error}
               </div>
             )}

             {success && (
               <div className="flex items-center gap-3 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-emerald-500 text-sm font-bold">
                 <CheckCircle2 className="w-5 h-5" /> Course created! Redirecting to terminal...
               </div>
             )}

             <button 
               type="submit" 
               disabled={loading || success}
               className="w-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
             >
               {loading ? (
                 <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
               ) : (
                 <>
                   <Save className="w-6 h-6" /> Deploy Course Architecture
                 </>
               )}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
}
