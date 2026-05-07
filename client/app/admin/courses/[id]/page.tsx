"use client"

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  X,
  Plus,
  Trash2,
  ListChecks
} from "lucide-react";
import Link from 'next/link';

export default function EditCourse() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [topics, setTopics] = useState<string[]>(['']);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    duration: '3 Months',
    level: 'Beginner',
    instructor: 'krishna Sharma',
    features: '',
  });

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/courses`);
      const allCourses = await response.json();
      const course = allCourses.find((c: any) => c._id === id);

      if (course) {
        setFormData({
          title: course.title,
          description: course.description,
          price: course.price.toString(),
          duration: course.duration,
          level: course.level,
          instructor: course.instructor || 'Krishna Sharma',
          features: course.features?.join(', ') || '',
        });
        if (course.topics && course.topics.length > 0) {
          setTopics(course.topics.map((t: any) => t.name));
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTopic = () => setTopics([...topics, '']);
  const removeTopic = (index: number) => {
    const newTopics = [...topics];
    newTopics.splice(index, 1);
    setTopics(newTopics);
  };
  const updateTopic = (index: number, val: string) => {
    const newTopics = [...topics];
    newTopics[index] = val;
    setTopics(newTopics);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`http://localhost:5000/api/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          features: formData.features.split(',').map(f => f.trim()).filter(f => f !== ''),
          topics: topics.filter(t => t.trim() !== '').map((t, i) => ({ name: t, order: i + 1 }))
        }),
      });

      if (response.ok) {
        router.push('/admin/courses');
      } else {
        alert('Error updating course');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/courses"
          className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 text-slate-500 hover:text-emerald-500 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Course</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Update curriculum and course details.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 space-y-6 shadow-sm">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Course Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Full Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
              />
            </div>
          </div>

          <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-emerald-500" />
                Master Curriculum Topics
              </h3>
              <button
                type="button"
                onClick={addTopic}
                className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Topic
              </button>
            </div>

            <div className="space-y-3">
              {topics.map((topic, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-grow relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">#{index + 1}</span>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => updateTopic(index, e.target.value)}
                      className="w-full pl-10 pr-6 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                  {topics.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTopic(index)}
                      className="p-3 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 space-y-6 shadow-sm">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Price ($)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Duration</label>
              <select
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              >
                <option>1 Month</option>
                <option>2 Months</option>
                <option>3 Months</option>
                <option>6 Months</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-[2rem] font-bold transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
          >
            {saving ? 'Updating...' : (
              <>
                <Save className="w-5 h-5" />
                Update Course
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
