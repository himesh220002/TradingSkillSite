"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api-config';
import {
  ArrowLeft,
  Save,
  X,
  Users,
  Calendar,
  Link as LinkIcon,
  User,
  BookOpen
} from "lucide-react";
import Link from 'next/link';

export default function NewBatch() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    courseId: '',
    batchName: '',
    studentCount: 0,
    startDate: '',
    status: 'Upcoming',
    trainer: 'Krishna Sharma',
    meetingLink: '',
    maxStudents: 50,
    practicalCount: 0,
    testsConducted: 0,
    assignmentsDue: 0
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses`);
      const data = await response.json();
      setCourses(data);
      if (data.length > 0) setFormData(prev => ({ ...prev, courseId: data[0]._id }));
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/batches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/admin/batches');
      } else {
        alert('Error creating batch. Ensure the selected course has topics.');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/batches"
          className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 text-slate-500 hover:text-emerald-500 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Setup New Batch</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Schedule and link a new cohort to a master course.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Select Course</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    required
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  >
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>{course.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Batch Name</label>
                <input
                  type="text"
                  required
                  value={formData.batchName}
                  onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
                  placeholder="e.g., Summer 2026 Batch A"
                  className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Meeting / Zoom Link</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                    placeholder="https://zoom.us/j/..."
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 text-xs">Practical Count</label>
                <input type="number" value={formData.practicalCount} onChange={(e) => setFormData({ ...formData, practicalCount: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 text-xs">Tests Conducted</label>
                <input type="number" value={formData.testsConducted} onChange={(e) => setFormData({ ...formData, testsConducted: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 text-xs">Assignments Due</label>
                <input type="number" value={formData.assignmentsDue} onChange={(e) => setFormData({ ...formData, assignmentsDue: Number(e.target.value) })} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-2"><Users className="w-3 h-3" /> Seat Capacity (Max Students)</label>
              <input
                type="number"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: Number(e.target.value) })}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 text-xs flex items-center gap-2"><User className="w-3 h-3" /> Assigned Trainer</label>
              <input
                type="text"
                value={formData.trainer}
                onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-[2rem] font-bold transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (
              <>
                <Save className="w-5 h-5" />
                Initialize Batch
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
