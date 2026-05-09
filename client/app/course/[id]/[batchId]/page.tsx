"use client"

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, CheckCircle2, Circle, PlayCircle, BookOpen, FileText,
  Lightbulb, HelpCircle, Link as LinkIcon, Video, ExternalLink,
  TrendingUp, Users, Calendar, ChevronRight, ChevronDown, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import TradingChart from '@/components/TradingChart';

type Resource = { title: string; url: string; type: string };
type FAQ = { question: string; answer: string };
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
  title: string; duration: string; notes: string; contentBlocks?: ContentBlock[]; videoUrl: string;
  liveClassUrl: string; methods: string; practiceQuestions: string[];
  resources: Resource[]; faqs: FAQ[];
};
type Section = { title: string; lessons: Lesson[] };
type TopicProgress = { topicId: string; name: string; sectionName?: string; isCompleted: boolean; completionDate?: string };
type Course = { _id: string; title: string; subtitle: string; curriculum: Section[]; instructor: string };
type Batch = {
  _id: string; batchName: string; status: string; startDate: string;
  meetingLink: string; progressPercentage: number; studentCount: number;
  topicProgress: TopicProgress[];
  courseId: { _id: string; title: string };
};

const TABS = [
  { id: 'notes',    label: 'Notes',     icon: FileText },
  { id: 'video',    label: 'Video',     icon: Video },
  { id: 'methods',  label: 'Methods',   icon: Lightbulb },
  { id: 'practice', label: 'Practice',  icon: TrendingUp },
  { id: 'qna',      label: 'Q&A / FAQ', icon: HelpCircle },
  { id: 'resources',label: 'Resources', icon: LinkIcon },
];

export default function ClassroomPage() {
  const { id: courseId, batchId } = useParams() as { id: string; batchId: string };
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [batch, setBatch]   = useState<Batch | null>(null);
  const [studentProgress, setStudentProgress] = useState<{ completedTopics: string[]; progressPercentage: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes');
  const [selectedLesson, setSelectedLesson] = useState<{ sIdx: number; lIdx: number } | null>(null);
  const [expandedSections, setExpandedSections] = useState<number[]>([0]);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (!userData) { router.push('/portal'); return; }
    fetchData();
  }, [courseId, batchId]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('userToken');

      const [courseRes, batchRes, progressRes] = await Promise.all([
        fetch(`http://localhost:5000/api/courses/${courseId}`),
        fetch(`http://localhost:5000/api/batches/${batchId}`),
        fetch(`http://localhost:5000/api/student-progress/${batchId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      const courseData = await courseRes.json();
      const batchData  = await batchRes.json();
      const progressData = await progressRes.json();

      setCourse(courseData);
      setBatch(batchData);
      setStudentProgress(progressData);
      
      // Auto-select first lesson
      if (courseData.curriculum?.[0]?.lessons?.[0]) {
        setSelectedLesson({ sIdx: 0, lIdx: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getTopicProgress = (sectionTitle: string, lessonTitle: string) => {
    if (!batch || !studentProgress) return null;
    // Try matching by sectionName + name (New Format)
    let found = batch.topicProgress.find(t => t.sectionName === sectionTitle && t.name === lessonTitle);
    // Fallback to legacy full string match (Old Format: "Section: Lesson")
    if (!found) {
      found = batch.topicProgress.find(t => t.name === `${sectionTitle}: ${lessonTitle}`);
    }
    
    if (found) {
      // Use student-specific completion status
      return {
        ...found,
        isCompleted: studentProgress.completedTopics.includes(found.topicId)
      };
    }
    return null;
  };

  const toggleTopic = async (topicId: string, current: boolean) => {
    try {
      const token = localStorage.getItem('userToken');

      const res = await fetch(`http://localhost:5000/api/student-progress/${batchId}/topic/${topicId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isCompleted: !current }),
      });
      const updated = await res.json();
      setStudentProgress(updated);
    } catch (err) { console.error(err); }
  };

  const toggleSection = (i: number) =>
    setExpandedSections(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!course || !batch) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      Classroom not found.
    </div>
  );

  const activeCourse = course;
  const lesson = selectedLesson != null ? activeCourse.curriculum[selectedLesson.sIdx]?.lessons[selectedLesson.lIdx] : null;
  const section = selectedLesson != null ? activeCourse.curriculum[selectedLesson.sIdx] : null;
  const tp = lesson && section ? getTopicProgress(section.title, lesson.title) : null;

  const completedCount = studentProgress?.completedTopics?.length || 0;
  const totalCount     = batch.topicProgress.length;
  const displayProgress = studentProgress?.progressPercentage || 0;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">

      {/* ── Top Bar ──────────────────────────────────────────────── */}
      <header className="h-14 bg-slate-900 border-b border-white/5 flex items-center px-4 gap-4 shrink-0 z-20">
        <Link href="/my-learning" className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-grow min-w-0">
          <div className="text-sm font-black truncate">{activeCourse.title}</div>
          <div className="text-[10px] text-slate-500 font-medium">{batch.batchName}</div>
        </div>

        {/* Progress */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-black text-emerald-400">{displayProgress}%</div>
            <div className="text-[10px] text-slate-500">{completedCount}/{totalCount} topics</div>
          </div>
          <div className="w-28 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-700"
              style={{ width: `${displayProgress}%` }} />
          </div>
        </div>

        {/* Live class */}
        {batch.meetingLink && (
          <a href={batch.meetingLink} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 shrink-0">
            <Video className="w-3.5 h-3.5" /> Join Live
          </a>
        )}
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Sidebar: Curriculum Tree ──────────────────────── */}
        <aside className="w-72 bg-slate-900 border-r border-white/5 flex flex-col overflow-hidden shrink-0">
          <div className="px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-2 text-sm font-bold">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              Course Content
            </div>
          </div>
          <div className="overflow-y-auto flex-1 py-3">
            {activeCourse.curriculum.map((sec, sIdx) => {
              const isExpanded = expandedSections.includes(sIdx);
              const secCompleted = sec.lessons.filter(l => getTopicProgress(sec.title, l.title)?.isCompleted).length;
              return (
                <div key={sIdx}>
                  {/* Section header */}
                  <button
                    onClick={() => toggleSection(sIdx)}
                    className="w-full flex items-center gap-2 px-5 py-3 hover:bg-white/5 transition-colors text-left"
                  >
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black text-slate-300 truncate">{sec.title}</div>
                      <div className="text-[10px] text-slate-500">{secCompleted}/{sec.lessons.length} done</div>
                    </div>
                  </button>
                  {/* Lessons */}
                  {isExpanded && (
                    <div className="pl-4 pr-2 space-y-0.5 mb-2">
                      {sec.lessons.map((les, lIdx) => {
                        const tpItem = getTopicProgress(sec.title, les.title);
                        const isActive = selectedLesson?.sIdx === sIdx && selectedLesson?.lIdx === lIdx;
                        const isDone   = tpItem?.isCompleted ?? false;
                        return (
                          <button
                            key={lIdx}
                            onClick={() => { setSelectedLesson({ sIdx, lIdx }); setActiveTab('notes'); }}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group",
                              isActive
                                ? "bg-emerald-500/10 border border-emerald-500/20"
                                : "hover:bg-white/5"
                            )}
                          >
                            <div onClick={e => { e.stopPropagation(); if (tpItem) toggleTopic(tpItem.topicId, isDone); }}
                              className={cn("shrink-0 transition-colors",
                                isDone ? "text-emerald-500" : "text-slate-600 group-hover:text-slate-400"
                              )}>
                              {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                            </div>
                            <span className={cn("text-xs font-medium truncate leading-snug",
                              isActive ? "text-emerald-400" : isDone ? "text-slate-400" : "text-slate-300"
                            )}>
                              {les.title}
                            </span>
                            {les.duration && (
                              <span className="text-[10px] text-slate-600 ml-auto shrink-0">{les.duration}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── Main Content Area ───────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {!lesson ? (
            <div className="flex-1 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <PlayCircle className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Select a topic from the sidebar to begin.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Lesson header */}
              <div className="px-8 py-5 border-b border-white/5 bg-slate-900/50 backdrop-blur shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{section?.title}</div>
                    <h2 className="text-xl font-black text-white">{lesson.title}</h2>
                    {lesson.duration && <div className="text-xs text-slate-500 mt-1">{lesson.duration}</div>}
                  </div>
                  {/* Mark complete toggle */}
                  {tp && (
                    <button
                      onClick={() => toggleTopic(tp.topicId, tp.isCompleted)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0",
                        tp.isCompleted
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-white/5 text-slate-400 border border-white/10 hover:border-emerald-500/30 hover:text-emerald-400"
                      )}
                    >
                      {tp.isCompleted ? <><CheckCircle2 className="w-3.5 h-3.5" /> Completed</> : <><Circle className="w-3.5 h-3.5" /> Mark Complete</>}
                    </button>
                  )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mt-5 overflow-x-auto">
                  {TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                        activeTab === tab.id
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                      )}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-8">

                {activeTab === 'notes' && (
                  <div className="max-w-4xl space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-black text-white flex items-center gap-3">
                        <FileText className="w-6 h-6 text-emerald-500" />
                        Comprehensive Study Guide
                      </h3>
                    </div>
                    
                    {lesson.contentBlocks && lesson.contentBlocks.length > 0 ? (
                      <div className="space-y-10 pb-20">
                        {lesson.contentBlocks.map((block, idx) => (
                          <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                            {block.type === 'heading' && (
                              <h2 className="text-3xl font-black text-white border-b border-white/5 pb-4 mb-6">{block.content}</h2>
                            )}

                            {block.type === 'subheading' && (
                              <h3 className="text-xl font-bold text-emerald-400 mt-8 mb-4">{block.content}</h3>
                            )}

                            {block.type === 'paragraph' && (
                              <p className="text-base text-slate-300 leading-relaxed font-medium">{block.content}</p>
                            )}

                            {block.type === 'image' && (
                              <div className="space-y-3 group">
                                <div className="rounded-[2rem] overflow-hidden border border-white/5 bg-slate-900 shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]">
                                  <img src={block.metadata?.url} alt={block.metadata?.caption || 'Lesson visual'} className="w-full h-auto object-cover" />
                                </div>
                                {block.metadata?.caption && (
                                  <p className="text-[10px] text-center font-black uppercase tracking-widest text-slate-500">{block.metadata.caption}</p>
                                )}
                              </div>
                            )}

                            {block.type === 'list' && (
                              <ul className="space-y-3">
                                {(block.metadata?.options || []).map((item, i) => (
                                  <li key={i} className="flex gap-4 group">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 shrink-0 group-hover:scale-150 transition-transform" />
                                    <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            )}

                            {block.type === 'algorithm' && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between px-6 py-3 bg-slate-800 rounded-t-2xl border-x border-t border-white/5">
                                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{block.metadata?.language || 'logic'}</span>
                                  <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                                  </div>
                                </div>
                                <div className="bg-slate-900 p-8 rounded-b-2xl border border-white/5 font-mono text-sm text-emerald-400 leading-relaxed shadow-inner overflow-x-auto whitespace-pre">
                                  {block.content}
                                </div>
                              </div>
                            )}

                            {block.type === 'graph' && (
                              <div className="animate-in zoom-in-95 duration-700">
                                <TradingChart 
                                  type={block.metadata?.graphType || 'PAYOFF'} 
                                  caption={block.metadata?.caption} 
                                />
                              </div>
                            )}

                            {block.type === 'note' && (
                              <div className="relative p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                                <div className="flex gap-4">
                                  <Lightbulb className="w-6 h-6 text-emerald-500 shrink-0 mt-1" />
                                  <p className="text-sm italic text-emerald-100/80 leading-relaxed">{block.content}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {lesson.notes ? (
                          <div className="prose prose-invert max-w-none">
                            <div className="bg-slate-900 rounded-[1.5rem] p-8 border border-white/5 text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                              {lesson.notes}
                            </div>
                          </div>
                        ) : (
                          <EmptyState icon={FileText} label="No study guide content available." />
                        )}
                      </>
                    )}
                  </div>
                )}

                {activeTab === 'video' && (
                  <div className="max-w-3xl space-y-6">
                    <h3 className="text-lg font-black text-white">Video Lesson</h3>
                    {lesson.videoUrl ? (
                      <div className="aspect-video rounded-[1.5rem] overflow-hidden bg-slate-900 border border-white/5">
                        <iframe
                          src={lesson.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                          className="w-full h-full"
                          allowFullScreen
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        />
                      </div>
                    ) : (
                      <EmptyState icon={Video} label="No video added for this lesson yet." />
                    )}
                    {lesson.liveClassUrl && (
                      <a href={lesson.liveClassUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500/20 transition-colors">
                        <Video className="w-5 h-5 text-emerald-400" />
                        <div>
                          <div className="font-bold text-emerald-400 text-sm">Live Class Link</div>
                          <div className="text-xs text-slate-400">{lesson.liveClassUrl}</div>
                        </div>
                        <ExternalLink className="w-4 h-4 text-emerald-400 ml-auto" />
                      </a>
                    )}
                  </div>
                )}

                {activeTab === 'methods' && (
                  <div className="max-w-3xl space-y-4">
                    <h3 className="text-lg font-black text-white">Methods & Strategies</h3>
                    {lesson.methods ? (
                      <div className="bg-slate-900 rounded-[1.5rem] p-8 border border-white/5 text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">
                        {lesson.methods}
                      </div>
                    ) : (
                      <EmptyState icon={Lightbulb} label="No methods documented for this lesson yet." />
                    )}
                  </div>
                )}

                {activeTab === 'practice' && (
                  <div className="max-w-3xl space-y-4">
                    <h3 className="text-lg font-black text-white">Practice Questions</h3>
                    {lesson.practiceQuestions?.length > 0 ? (
                      <div className="space-y-3">
                        {lesson.practiceQuestions.map((q, i) => (
                          <div key={i} className="flex gap-4 p-5 bg-slate-900 rounded-2xl border border-white/5">
                            <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-xs font-black shrink-0">
                              {i + 1}
                            </div>
                            <p className="text-sm text-slate-300 leading-relaxed">{q}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState icon={TrendingUp} label="No practice questions yet." />
                    )}
                  </div>
                )}

                {activeTab === 'qna' && (
                  <div className="max-w-3xl space-y-4">
                    <h3 className="text-lg font-black text-white">Q&A / FAQ</h3>
                    {lesson.faqs?.length > 0 ? (
                      <div className="space-y-4">
                        {lesson.faqs.map((faq, i) => (
                          <div key={i} className="p-6 bg-slate-900 rounded-2xl border border-white/5 space-y-2">
                            <div className="flex items-start gap-3">
                              <span className="text-emerald-400 font-black text-sm mt-0.5">Q</span>
                              <p className="text-sm font-bold text-white">{faq.question}</p>
                            </div>
                            <div className="flex items-start gap-3 pl-5">
                              <span className="text-slate-500 font-black text-sm mt-0.5">A</span>
                              <p className="text-sm text-slate-400 leading-relaxed">{faq.answer}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState icon={HelpCircle} label="No Q&A added for this lesson yet." />
                    )}
                  </div>
                )}

                {activeTab === 'resources' && (
                  <div className="max-w-3xl space-y-4">
                    <h3 className="text-lg font-black text-white">Resources & Links</h3>
                    {lesson.resources?.length > 0 ? (
                      <div className="space-y-3">
                        {lesson.resources.map((r, i) => (
                          <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-4 p-5 bg-slate-900 rounded-2xl border border-white/5 hover:border-emerald-500/20 hover:bg-emerald-500/5 transition-all group">
                            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                              <LinkIcon className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-white truncate">{r.title}</div>
                              <div className="text-xs text-slate-500 truncate">{r.url}</div>
                            </div>
                            <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
                          </a>
                        ))}
                      </div>
                    ) : (
                      <EmptyState icon={LinkIcon} label="No resources linked for this lesson yet." />
                    )}
                  </div>
                )}

              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 border border-white/5 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-slate-700" />
      </div>
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}
