"use client"

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  TrendingUp,
  Users,
  Calendar,
  Save,
  Trash2,
  ExternalLink
} from "lucide-react";
import Link from 'next/link';
import { cn } from "@/lib/utils";

interface Topic {
  topicId: string;
  name: string;
  isCompleted: boolean;
  completionDate?: string;
}

interface Batch {
  _id: string;
  courseId: { title: string };
  batchName: string;
  studentCount: number;
  startDate: string;
  status: string;
  trainer: string;
  meetingLink: string;
  progressPercentage: number;
  topicProgress: Topic[];
  practicalCount: number;
  testsConducted: number;
  assignmentsDue: number;
}

export default function BatchDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBatch();
  }, [id]);

  const fetchBatch = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/batches`);
      const allBatches = await response.json();
      const currentBatch = allBatches.find((b: any) => b._id === id);
      setBatch(currentBatch);
    } catch (error) {
      console.error('Error fetching batch:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = async (topicId: string, currentState: boolean) => {
    try {
      const response = await fetch(`http://localhost:5000/api/batches/${id}/topic/${topicId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: !currentState }),
      });
      const updatedBatch = await response.json();
      setBatch(updatedBatch);
    } catch (error) {
      console.error('Error toggling topic:', error);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!batch) return <div className="text-center py-20 text-slate-500">Batch not found.</div>;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/batches" className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 text-slate-500 hover:text-emerald-500 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{batch.batchName}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{batch.courseId?.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={cn(
            "px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-wider",
            batch.status === 'Ongoing' ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600"
          )}>
            {batch.status}
          </span>
          {batch.meetingLink && (
            <a href={batch.meetingLink} target="_blank" className="p-3 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Progress & Info */}
        <div className="lg:col-span-1 space-y-8">
          {/* Progress Card */}
          <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Batch Progress
            </h3>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <span className="text-4xl font-black text-emerald-500">{batch.progressPercentage}%</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Complete</span>
              </div>
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  style={{ width: `${batch.progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Progress is automatically calculated based on the topics checked off in the curriculum checklist.
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-8 rounded-[2.5rem] bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 space-y-6">
            <h3 className="font-bold flex items-center gap-2">Operational Tracking</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="text-2xl font-bold">{batch.practicalCount}</div>
                <div className="text-[10px] uppercase font-bold opacity-70">Practicals</div>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                <div className="text-2xl font-bold">{batch.testsConducted}</div>
                <div className="text-[10px] uppercase font-bold opacity-70">Tests Done</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 font-medium">
                <Users className="w-4 h-4" />
                {batch.studentCount} Students
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Calendar className="w-4 h-4" />
                {new Date(batch.startDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Curriculum Checklist */}
        <div className="lg:col-span-2">
          <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 shadow-sm min-h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Master Curriculum Checklist</h3>
              <span className="text-xs font-bold text-slate-400">{batch.topicProgress.filter(t => t.isCompleted).length} / {batch.topicProgress.length} Topics</span>
            </div>

            <div className="space-y-3">
              {batch.topicProgress.map((topic, index) => (
                <button
                  key={topic.topicId}
                  onClick={() => toggleTopic(topic.topicId, topic.isCompleted)}
                  className={cn(
                    "w-full flex items-center justify-between p-5 rounded-2xl border transition-all text-left group",
                    topic.isCompleted 
                      ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400" 
                      : "bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2 rounded-xl transition-colors",
                      topic.isCompleted ? "bg-emerald-500 text-white" : "bg-white dark:bg-slate-800 text-slate-300 border border-slate-200 dark:border-slate-700"
                    )}>
                      {topic.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{topic.name}</div>
                      {topic.completionDate && (
                        <div className="text-[10px] opacity-70 mt-0.5 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> Completed on {new Date(topic.completionDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-xs font-mono font-bold opacity-30 group-hover:opacity-100 transition-opacity">
                    TOPIC_{index + 1}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
