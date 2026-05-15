"use client"

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BarChart3, GraduationCap, Users, Clock, Star, ArrowRight, CheckCircle2 } from "lucide-react";

// Mock data for fallback
const MOCK_COURSES = [
  {
    id: '1',
    title: 'Professional Trading Masterclass',
    description: 'A comprehensive 3-month journey from market basics to advanced technical analysis and institutional strategies.',
    price: '$499',
    duration: '3 Months',
    level: 'Beginner to Pro',
    enrolled: 500,
    rating: 4.9,
    image: '/course-masterclass.png',
    features: ['Live Session Access', 'LMS Dashboard', 'Community Doubt Solving', 'Trading Journal Tools']
  },
  {
    id: '2',
    title: 'Options Trading Secrets',
    description: 'Master the Greeks, hedging strategies, and multi-leg option plays to generate consistent income in any market.',
    price: '$349',
    duration: '2 Months',
    level: 'Intermediate',
    enrolled: 320,
    rating: 4.8,
    image: '/course-options.png',
    features: ['Live Trading Room', 'Option Greek Calculator', 'Strategy Backtester', 'Risk Management Sheets']
  }
];

export default function CoursePage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/courses');
        const data = await response.json();
        
        if (data && data.length > 0) {
          // Map DB structure to UI structure if needed
          const dbCourses = data.map((c: any) => ({
            id: c._id,
            title: c.title,
            description: c.description,
            price: `$${c.price}`,
            discountPrice: c.discountPrice ? `$${c.discountPrice}` : null,
            duration: c.duration || '3 Months',
            level: c.level || 'Beginner',
            enrolled: c.enrolledStudents || 0,
            rating: 4.9, // Default for now
            image: c.image || '/course-masterclass.png', // Default image
          }));
          setCourses(dbCourses);
        } else {
          setCourses(MOCK_COURSES);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setCourses(MOCK_COURSES);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1 text-emerald-600 dark:text-emerald-400 text-xs font-medium mb-6">
              <GraduationCap className="w-3 h-3" />
              <span>Structured Curriculum</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Explore Our <span className="text-emerald-500">Trading Courses</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-lg">
              Whether you are just starting or looking to refine your strategies,
              our courses are designed to provide institutional-grade knowledge.
            </p>
          </div>

          {/* Courses Grid */}
          <div className="grid lg:grid-cols-2 gap-10">
            {loading ? (
              <div className="col-span-2 flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : courses.map((course) => (
              <div key={course.id} className="group relative flex flex-col md:flex-row gap-8 p-6 rounded-[2rem] bg-slate-50 dark:bg-slate-900/50 border border-black/5 dark:border-white/5 hover:border-emerald-500/30 transition-all overflow-hidden">
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[60px] -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-all" />

                {/* Course Image */}
                <div className="relative w-full md:w-64 h-48 rounded-2xl bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    className="object-fit group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                </div>

                <div className="flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">{course.level}</span>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{course.rating}</span>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-emerald-500 transition-colors">
                    {course.title}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-2">
                    {course.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-8 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-500" />
                      {course.duration}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-500" />
                      {course.enrolled < 10 ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full animate-pulse">
                          Enrolling Now
                        </span>
                      ) : (
                        <span className="text-slate-700 dark:text-slate-300 font-bold">{course.enrolled}+ Students</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {course.discountPrice || course.price}
                      </div>
                      {course.discountPrice && (
                        <div className="text-[10px] font-bold text-slate-400 line-through">
                          {course.price}
                        </div>
                      )}
                    </div>
                    <Link href={`/course/${course.id}`} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full text-sm font-bold transition-all hover:scale-105">
                      Enrol Now
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Features Comparison */}
          <div className="mt-24 p-10 rounded-[3rem] bg-gradient-to-br from-emerald-500 to-purple-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] -mr-32 -mt-32" />
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 leading-tight">Everything you need to <br />become a master trader</h2>
                <p className="text-emerald-100 mb-8 max-w-md">Our course isn't just about watching videos. It is about a complete ecosystem designed for success.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['Live Batches', 'Video Notes', 'Issue Tracking', 'Portfolio Review', 'Doubt Support', 'Alumni Network'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <div className="text-3xl font-bold mb-1">95%</div>
                  <div className="text-xs text-emerald-100">Student Satisfaction</div>
                </div>
                <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <div className="text-3xl font-bold mb-1">24/7</div>
                  <div className="text-xs text-emerald-100">Direct Support</div>
                </div>
                <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <div className="text-3xl font-bold mb-1">12+</div>
                  <div className="text-xs text-emerald-100">Weekly Hours</div>
                </div>
                <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <div className="text-3xl font-bold mb-1">LMS</div>
                  <div className="text-xs text-emerald-100">Lifetime Access</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
