"use client"

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Play, 
  FileText, 
  Link as LinkIcon, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  ChevronDown,
  Layout,
  Video,
  Download,
  Users,
  Settings,
  ArrowLeft,
  Search,
  BookOpen,
  BarChart3,
  ExternalLink,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from 'next/link';

export default function BatchClassroom() {
  const { id: courseId, batchId } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'video' | 'notes' | 'resources' | 'discussion'>('video');
  const [selectedLesson, setSelectedLesson] = useState<any>(null);

  useEffect(() => {
    fetchClassroomData();
  }, [courseId, batchId]);

  const fetchClassroomData = async () => {
    try {
      const [courseRes, batchRes] = await Promise.all([
        fetch(`http://localhost:5000/api/courses/${courseId}`),
        fetch(`http://localhost:5000/api/batches/${batchId}`)
      ]);
      
      const courseData = await courseRes.json();
      const batchData = await batchRes.json();
      
      setCourse(courseData);
      setBatch(batchData);
      
      // Set default lesson
      if (courseData.curriculum?.[0]?.lessons?.[0]) {
        setSelectedLesson(courseData.curriculum[0].lessons[0]);
      }
    } catch (error) {
      console.error('Error fetching classroom data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!course || !batch) return <div className="p-20 text-center">Classroom not found. Access Denied.</div>;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden pt-16">
      {/* Left Sidebar: Curriculum Navigation */}
      <aside className="w-80 border-r border-black/5 dark:border-white/5 bg-white dark:bg-slate-900 flex flex-col shrink-0">
        <div className="p-6 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[10px] font-bold uppercase">{batch.status}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{batch.batchName}</span>
          </div>
          <h2 className="font-black text-slate-900 dark:text-white line-clamp-1">{course.title}</h2>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-6">
          {course.curriculum?.map((section: any, sIndex: number) => (
            <div key={sIndex} className="space-y-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">{section.title}</h3>
              <div className="space-y-1">
                {section.lessons.map((lesson: any, lIndex: number) => {
                  const isActive = selectedLesson?.title === lesson.title;
                  return (
                    <button 
                      key={lIndex}
                      onClick={() => {
                        setSelectedLesson(lesson);
                        setActiveTab('video');
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all group",
                        isActive 
                          ? "bg-emerald-500/10 text-emerald-500" 
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-all",
                        isActive ? "bg-emerald-500 border-emerald-500" : "border-slate-200 dark:border-slate-700 group-hover:border-emerald-500/50"
                      )}>
                        {isActive ? <Play className="w-3 h-3 text-white fill-current" /> : <Play className="w-2.5 h-2.5 text-slate-400" />}
                      </div>
                      <span className="text-xs font-bold leading-tight flex-grow">{lesson.title}</span>
                      <span className="text-[10px] font-mono opacity-50">{lesson.duration}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-black/5 dark:border-white/5 bg-slate-50 dark:bg-slate-800/20">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase">
              <span>Overall Progress</span>
              <span>{batch.progressPercentage}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${batch.progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Classroom Area */}
      <main className="flex-grow flex flex-col overflow-hidden relative">
        {/* Navigation Tabs */}
        <div className="h-16 border-b border-black/5 dark:border-white/5 bg-white dark:bg-slate-900 flex items-center px-8 justify-between shrink-0">
          <div className="flex items-center gap-8 h-full">
            {[
              { id: 'video', label: 'Watch Lesson', icon: Video },
              { id: 'notes', label: 'Batch Notes', icon: FileText },
              { id: 'resources', label: 'Resources', icon: Download },
              { id: 'discussion', label: 'Community', icon: MessageSquare }
            ].map((tab: any) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 h-full px-2 text-xs font-bold transition-all relative",
                  activeTab === tab.id ? "text-emerald-500" : "text-slate-400 hover:text-slate-600"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-t-full" />}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-emerald-500 transition-all"><Search className="w-5 h-5" /></button>
            <button className="p-2 text-slate-400 hover:text-emerald-500 transition-all"><Settings className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Dynamic Content area */}
        <div className="flex-grow overflow-y-auto p-8 lg:p-12">
          {activeTab === 'video' && (
            <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-black/10 flex items-center justify-center relative group">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30 group-hover:scale-110 transition-all">
                    <Play className="w-8 h-8 text-emerald-500 fill-current" />
                  </div>
                  <p className="text-slate-400 text-sm font-bold tracking-widest uppercase">Video Lesson Secured</p>
                </div>
                {/* Visual Placeholder for Video */}
                <div className="absolute bottom-6 left-8 right-8 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-white/50">00:00 / {selectedLesson?.duration || '10:00'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Layout className="w-4 h-4 text-white/50" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                    {selectedLesson?.title || 'Welcome to the classroom'}
                  </h1>
                  <button className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <CheckCircle2 className="w-4 h-4" /> Mark as Complete
                  </button>
                </div>
                <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 shadow-sm space-y-4">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Info className="w-5 h-5 text-emerald-500" /> Lesson Highlights
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                    In this session, we deep dive into the core mechanics of the strategy. Pay close attention to the risk management parameters discussed at the 15-minute mark.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Batch Specific Notes</h2>
                <button className="text-emerald-500 font-bold text-sm hover:underline flex items-center gap-2">
                  <Download className="w-4 h-4" /> Export as PDF
                </button>
              </div>
              <div className="prose prose-slate dark:prose-invert max-w-none bg-white dark:bg-slate-900 p-12 rounded-[3rem] border border-black/5 dark:border-white/5 shadow-sm">
                <div className="whitespace-pre-wrap text-slate-600 dark:text-slate-400">
                  {batch.internalNotes || "No specific notes for this batch yet. The trainer will update this section regularly with market analysis and key session takeaways."}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="max-w-5xl mx-auto space-y-12">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Shared Links */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-3"><LinkIcon className="w-6 h-6 text-emerald-500" /> Shared Knowledge</h3>
                  <div className="space-y-3">
                    {batch.sharedLinks?.map((link: any, i: number) => (
                      <a key={i} href={link.url} target="_blank" className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 hover:border-emerald-500/20 transition-all group shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                            <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-all" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{link.title}</div>
                            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{link.category || 'Useful Link'}</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-all" />
                      </a>
                    ))}
                    {(!batch.sharedLinks || batch.sharedLinks.length === 0) && <p className="text-slate-400 text-sm italic">No links shared yet.</p>}
                  </div>
                </div>

                {/* Downloadable Resources */}
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-3"><Download className="w-6 h-6 text-emerald-500" /> Handouts & Files</h3>
                  <div className="space-y-3">
                    {batch.resources?.map((res: any, i: number) => (
                      <a key={i} href={res.url} target="_blank" className="flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 hover:border-emerald-500/20 transition-all group shadow-sm">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-all" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1">{res.title}</div>
                            <div className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{res.type} document</div>
                          </div>
                        </div>
                        <Download className="w-4 h-4 text-slate-300 group-hover:scale-110 transition-all" />
                      </a>
                    ))}
                    {(!batch.resources || batch.resources.length === 0) && <p className="text-slate-400 text-sm italic">No resources added yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'discussion' && (
            <div className="max-w-4xl mx-auto space-y-10">
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-black/5 dark:border-white/5 shadow-sm space-y-6">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="w-10 h-10 text-emerald-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white">Batch Discussion Board</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">Connect with your cohort and the trainer. Ask questions, share insights.</p>
                </div>
                <button className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm shadow-xl shadow-black/10">
                  Open Discussion Panel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
