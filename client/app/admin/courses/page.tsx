"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api-config';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Filter,
  Copy,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

// Define the interface for the Course (should eventually be shared)
interface Course {
  _id: string;
  title: string;
  price: number;
  level: string;
  duration: string;
  enrolledStudents: number;
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses`);
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/courses/${id}`, { method: 'DELETE' });
      setCourses(courses.filter(c => c._id !== id));
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Courses Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage, edit, and track all your educational content.</p>
        </div>
        <Link 
          href="/admin/courses/new" 
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          Add New Course
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl border border-black/5 dark:border-white/5">
        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl w-full md:w-80 border border-black/5 dark:border-white/5">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search courses..." 
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 text-sm font-medium rounded-2xl border border-black/5 dark:border-white/5 hover:bg-slate-100 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Course List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-black/5 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="px-8 py-5">Course Name</th>
                <th className="px-8 py-5">Course ID</th>
                <th className="px-8 py-5">Level</th>
                <th className="px-8 py-5">Duration</th>
                <th className="px-8 py-5">Students</th>
                <th className="px-8 py-5">Price</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-8 py-10 text-center text-slate-400">Loading courses...</td>
                </tr>
              ) : courses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-10 text-center text-slate-400">No courses found. Add your first course!</td>
                </tr>
              ) : courses.map((course) => (
                <tr key={course._id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-8 py-5">
                    <div className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">{course.title}</div>
                  </td>
                  <td className="px-8 py-5">
                    <button onClick={() => copyId(course._id)} className="flex items-center gap-1.5 group/id">
                      <code className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-slate-500 group-hover/id:text-emerald-600 transition-colors">
                        {course._id.slice(0, 8)}…
                      </code>
                      {copiedId === course._id
                        ? <Check className="w-3 h-3 text-emerald-500" />
                        : <Copy className="w-3 h-3 text-slate-400 opacity-0 group-hover/id:opacity-100 transition-opacity" />}
                    </button>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full">{course.level}</span>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-500 dark:text-slate-400">{course.duration}</td>
                  <td className="px-8 py-5 text-sm text-slate-500 dark:text-slate-400">{course.enrolledStudents || 0}</td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-900 dark:text-white">${course.price}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/courses/${course._id}`} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => deleteCourse(course._id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
