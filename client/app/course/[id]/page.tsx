"use client"

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  PlayCircle,
  CheckCircle2,
  Clock,
  BarChart,
  Users,
  Star,
  ChevronDown,
  ChevronUp,
  Lock,
  ArrowRight,
  ShieldCheck,
  Video,
  BookOpen,
  Calendar,
  MessageCircle,
  HelpCircle,
  TrendingUp,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from 'next/link';

interface Lesson {
  title: string;
  duration: string;
}

interface Section {
  title: string;
  lessons: Lesson[];
}

interface Course {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  bannerImage: string;
  videoPreviewUrl?: string;
  price: number;
  discountPrice?: number;
  currency: string;
  duration: string;
  level: string;
  category: string;
  features: string[];
  learningObjectives: string[];
  requirements: string[];
  curriculum: Section[];
  faqs: { question: string; answer: string }[];
  instructor: string;
  enrolledStudents: number;
}

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<number[]>([0]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolledBatchId, setEnrolledBatchId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetchCourse();
    checkEnrollmentStatus();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/courses/${id}`);
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = () => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.id) {
      setIsLoggedIn(true);
      // Fetch user profile to get enrolled batches with populated courseIds
      fetch(`http://localhost:5000/api/auth/profile/${userData.id}`)
        .then(res => res.json())
        .then(data => {
          const batch = data.enrolledBatches?.find((b: any) => b.courseId?._id === id);
          if (batch) {
            setIsEnrolled(true);
            setEnrolledBatchId(batch._id);
          }
        });
    }
  };

  const toggleSection = (index: number) => {
    setExpandedSections(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950"><div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!course) return <div className="text-center py-20 bg-slate-50 dark:bg-slate-950 min-h-screen">Course not found.</div>;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pt-16">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white py-20 relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/10 blur-[120px] -mr-40" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-blue-500/10 blur-[100px] -ml-20" />

        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold uppercase tracking-widest">
              <TrendingUp className="w-3 h-3" />
              {course.category} • Institutional Grade
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
              {course.title}
            </h1>
            <p className="text-xl text-slate-400 max-w-xl leading-relaxed">
              {course.subtitle || "Master the financial markets with professional strategies designed for consistency."}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <span className="font-bold text-sm">4.9 (2k+ Reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{course.enrolledStudents}+ Enrolled</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-medium">English / Hindi</span>
              </div>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row gap-4">
              {isEnrolled && enrolledBatchId ? (
                <Link href={`/course/${id}/${enrolledBatchId}`} className="flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-10 py-5 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20">
                  Enter Classroom <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <button
                  onClick={() => {
                    if (!isLoggedIn) {
                      router.push(`/portal?redirect=/course/${id}`);
                    } else {
                      router.push(`/course/${id}/checkout`);
                    }
                  }}
                  className="flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-10 py-5 rounded-2xl font-black transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                >
                  Enroll in Course <ArrowRight className="w-5 h-5" />
                </button>
              )}
              <button className="flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-10 py-5 rounded-2xl font-black transition-all border border-white/10">
                <PlayCircle className="w-5 h-5" />
                Watch Trailer
              </button>
            </div>
          </div>

          <div className="relative group">
            <div className="aspect-video bg-slate-800 rounded-[2.5rem] overflow-hidden border-8 border-white/5 shadow-2xl relative">
              <img
                src={course.bannerImage}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-125 transition-transform duration-500">
                  <PlayCircle className="w-10 h-10 text-white" />
                </div>
              </div>
            </div>
            {/* Floating Badges */}
            <div className="absolute -bottom-6 -left-6 p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-black/5 dark:border-white/5 space-y-1 hidden md:block">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Limited Offer</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                ${course.discountPrice || course.price}
                {course.discountPrice && <span className="text-sm font-bold text-slate-400 line-through">${course.price}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto px-4 py-20 grid lg:grid-cols-12 gap-16">
        <div className="lg:col-span-8 space-y-20">

          {/* What You'll Learn */}
          <section className="space-y-8">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              What You'll Learn
            </h2>
            <div className="grid md:grid-cols-2 gap-6 bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-black/5 dark:border-white/5 shadow-sm">
              {course.learningObjectives.length > 0 ? course.learningObjectives.map((obj, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{obj}</p>
                </div>
              )) : (
                <p className="text-slate-400 text-sm">Learning objectives will be listed here.</p>
              )}
            </div>
          </section>

          {/* Curriculum Accordion */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4">
                <BookOpen className="w-8 h-8 text-emerald-500" />
                Course Curriculum
              </h2>
              <div className="text-sm font-bold text-slate-400">
                {course.curriculum?.length || 0} Modules • 100+ Lessons
              </div>
            </div>

            <div className="space-y-4">
              {course.curriculum?.map((section, sIndex) => (
                <div key={sIndex} className="bg-white dark:bg-slate-900 rounded-[2rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-sm">
                  <button
                    onClick={() => toggleSection(sIndex)}
                    className="w-full flex items-center justify-between p-8 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-900 dark:text-white">
                        {sIndex + 1}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{section.title}</h3>
                        <p className="text-xs text-slate-500">{section.lessons.length} Lessons • 45m total</p>
                      </div>
                    </div>
                    {expandedSections.includes(sIndex) ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>

                  <div className={cn(
                    "overflow-hidden transition-all duration-300",
                    expandedSections.includes(sIndex) ? "max-h-[1000px] border-t border-black/5 dark:border-white/5" : "max-h-0"
                  )}>
                    <div className="p-4 space-y-2">
                      {section.lessons.map((lesson, lIndex) => (
                        <div key={lIndex} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                          <div className="flex items-center gap-4">
                            {!isEnrolled ? (
                              <Lock className="w-4 h-4 text-slate-300" />
                            ) : (
                              <PlayCircle className="w-4 h-4 text-emerald-500" />
                            )}
                            <span className={cn(
                              "text-sm font-medium",
                              !isEnrolled ? "text-slate-400" : "text-slate-600 dark:text-slate-400"
                            )}>{lesson.title}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            {!isEnrolled ? (
                              <span className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Locked</span>
                            ) : (
                              <span className="text-xs font-mono text-slate-400">{lesson.duration}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Instructor Section */}
          <section className="p-12 rounded-[3rem] bg-slate-900 text-white space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px]" />
            <h2 className="text-3xl font-black flex items-center gap-4 relative z-10">
              <Award className="w-8 h-8 text-emerald-500" />
              Meet Your Instructor
            </h2>
            <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
              <div className="w-40 h-40 rounded-[2rem] overflow-hidden border-4 border-white/10 shrink-0">
                <img src="/trainer.jpg" alt="Krishna Sharma" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-black">{course.instructor}</h3>
                <p className="text-slate-400 leading-relaxed italic">
                  "Professional trader with 8+ years of experience in option greeks and volatility arbitrage. My mission is to simplify complex financial structures for retail traders."
                </p>
                <div className="flex gap-4">
                  <div className="px-4 py-2 bg-white/5 rounded-xl text-xs font-bold border border-white/10 tracking-widest uppercase">Verified Expert</div>
                  <div className="px-4 py-2 bg-white/5 rounded-xl text-xs font-bold border border-white/10 tracking-widest uppercase">8+ Years Exp</div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="space-y-8">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4">
              <HelpCircle className="w-8 h-8 text-emerald-500" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {course.faqs?.map((faq, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm space-y-3">
                  <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                    {faq.question}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-5">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Sticky Card */}
        <div className="lg:col-span-4">
          <div className="sticky top-32 space-y-8">
            {/* Enrollment Card */}
            <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-black/5 dark:border-white/5 shadow-2xl space-y-8 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] -mr-16 -mt-16" />

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">${course.discountPrice || course.price}</span>
                  {course.discountPrice && <span className="text-lg font-bold text-slate-400 line-through">${course.price}</span>}
                </div>
                <div className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-3 h-3" /> 24 Hours left at this price!
                </div>
              </div>

              <div className="space-y-4">
                {isEnrolled && enrolledBatchId ? (
                  <Link
                    href={`/course/${id}/${enrolledBatchId}`}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3"
                  >
                    Enter Classroom <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <button
                    onClick={() => {
                      if (!isLoggedIn) {
                        router.push(`/portal?redirect=/course/${id}`);
                      } else {
                        router.push(`/course/${id}/checkout`);
                      }
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                  >
                    Secure Enrollment
                  </button>
                )}
                <div className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3 h-3" /> 30-Day Money Back Guarantee
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-black/5 dark:border-white/5">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">This course includes:</h5>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <Video className="w-4 h-4 text-emerald-500" /> {course.duration} High-res online video lessons
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <BookOpen className="w-4 h-4 text-emerald-500" /> Full lifetime access
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4 text-emerald-500" /> Monthly Live Q&A
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <Award className="w-4 h-4 text-emerald-500" /> Certificate of completion
                  </div>
                </div>
              </div>

              <div className="pt-8 flex flex-col items-center gap-4">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure Payments Via</div>
                <div className="flex items-center gap-6 opacity-30 grayscale">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" className="h-4" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/1200px-Stripe_Logo%2C_revised_2016.svg.png" className="h-4" />
                </div>
              </div>
            </div>

            {/* Newsletter/Promo */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-4">
              <h4 className="font-bold flex items-center gap-2"><Lock className="w-4 h-4 text-emerald-500" /> Institutional Membership</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Unlock 10+ professional trading courses and live trading room access for one flat fee.
              </p>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold border border-white/10 transition-all">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
