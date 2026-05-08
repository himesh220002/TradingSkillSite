"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookMarked,
  TrendingUp,
  Calendar,
  Users,
  ArrowRight,
  GraduationCap,
  Clock,
  Video,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EnrolledBatch {
  _id: string;
  batchName: string;
  startDate: string;
  status: string;
  progressPercentage: number;
  studentCount: number;
  meetingLink: string;
  trainer: string;
  courseId: {
    _id: string;
    title: string;
    subtitle: string;
    duration: string;
    level: string;
    bannerImage: string;
    instructor: string;
  };
}

const STATUS_STYLE: Record<string, string> = {
  Ongoing:   'bg-emerald-500/10 text-emerald-600',
  Upcoming:  'bg-blue-500/10 text-blue-600',
  Completed: 'bg-slate-500/10 text-slate-500',
  'On Hold': 'bg-amber-500/10 text-amber-600',
};

export default function MyLearningPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<EnrolledBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem('userData');
    if (!stored) { router.push('/portal'); return; }
    const u = JSON.parse(stored);
    setUser(u);
    fetchEnrolledBatches(u.id);
  }, []);

  const fetchEnrolledBatches = async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/auth/profile/${userId}`);
      const data = await res.json();
      setBatches(data.enrolledBatches ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center pt-16">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-16">
      {/* Header */}
      <div className="bg-slate-900 text-white py-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[120px] -mr-40 -mt-20" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30">
              <BookMarked className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black">My Learning</h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Welcome back, <span className="text-emerald-400 font-bold">{user?.username}</span> — continue where you left off.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-400 mt-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-emerald-500" />
              <span><span className="text-white font-bold">{batches.length}</span> Enrolled {batches.length === 1 ? 'Course' : 'Courses'}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              <span>
                <span className="text-white font-bold">
                  {batches.length > 0
                    ? Math.round(batches.reduce((s, b) => s + (b.progressPercentage ?? 0), 0) / batches.length)
                    : 0}%
                </span> Avg Progress
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-7xl mx-auto px-4 py-14">
        {batches.length === 0 ? (
          <div className="text-center py-24 space-y-6">
            <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto">
              <Lock className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">No Courses Yet</h2>
              <p className="text-slate-500 max-w-sm mx-auto">
                You haven't been enrolled in any batch yet. Contact your admin or browse available courses.
              </p>
            </div>
            <Link href="/course" className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20">
              Browse Courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {batches.map(batch => {
              const course = batch.courseId;
              const progressColor = batch.progressPercentage >= 80 ? 'bg-emerald-500' :
                                    batch.progressPercentage >= 40 ? 'bg-blue-500' : 'bg-amber-500';
              return (
                <div key={batch._id} className="group bg-white dark:bg-slate-900 rounded-[2.5rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-500">
                  {/* Course Banner */}
                  <div className="relative h-44 bg-slate-800 overflow-hidden">
                    {course?.bannerImage ? (
                      <img src={course.bannerImage} alt={course.title} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                        <BookMarked className="w-16 h-16 text-slate-700" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={cn("px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full", STATUS_STYLE[batch.status] ?? 'bg-slate-500/10 text-slate-500')}>
                        {batch.status}
                      </span>
                    </div>
                    {/* Progress bar overlay */}
                    <div className="absolute bottom-0 left-0 right-0">
                      <div className="h-1 w-full bg-slate-700">
                        <div className={cn("h-full transition-all duration-1000", progressColor)} style={{ width: `${batch.progressPercentage}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="p-8 space-y-5">
                    {/* Course info */}
                    <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight group-hover:text-emerald-500 transition-colors">
                        {course?.title}
                      </h2>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{course?.subtitle || batch.batchName}</p>
                    </div>

                    {/* Meta row */}
                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{new Date(batch.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{course?.duration}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{batch.studentCount} Students</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-500">Progress</span>
                        <span className={cn("font-black", batch.progressPercentage >= 80 ? 'text-emerald-500' : batch.progressPercentage >= 40 ? 'text-blue-500' : 'text-amber-500')}>
                          {batch.progressPercentage}%
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all duration-1000", progressColor)} style={{ width: `${batch.progressPercentage}%` }} />
                      </div>
                    </div>

                    {/* Batch name chip */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Batch:</span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                        {batch.batchName}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-2">
                      <Link
                        href={`/course/${course?._id}/${batch._id}`}
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                      >
                        Enter Classroom <ArrowRight className="w-4 h-4" />
                      </Link>
                      {batch.meetingLink && (
                        <a
                          href={batch.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all"
                        >
                          <Video className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
