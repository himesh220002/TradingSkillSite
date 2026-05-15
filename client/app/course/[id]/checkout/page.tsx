"use client"

import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api-config';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  CreditCard, 
  UserCheck, 
  Zap, 
  ArrowLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  Smartphone
} from "lucide-react";
import Link from 'next/link';

interface Course {
  _id: string;
  title: string;
  price: number;
  discountPrice?: number;
  bannerImage: string;
}

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'manual'>('online');

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${id}`);
      const data = await response.json();
      setCourse(data);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!userData.id) {
      router.push('/portal');
      return;
    }

    if (paymentMethod === 'online') {
      // Redirect to mimic payment gateway
      router.push(`/course/${id}/payment?amount=${course?.discountPrice || course?.price || 0}`);
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/batches/auto-enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          courseId: id,
          paymentMethod: 'manual',
          amount: course?.discountPrice || course?.price || 0,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        router.push(`/course/${id}/success?enrollmentId=${data.enrollment._id}&manual=true`);
      } else {
        alert(data.message || 'Enrollment failed');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Connection error. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
    </div>
  );

  if (!course) return <div className="text-center py-20">Course not found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-20 px-4 transition-colors duration-500">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors mb-8 font-bold text-sm uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Details
        </button>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Left Column: Course Summary & Payment Method */}
          <div className="lg:col-span-7 space-y-10">
            <section className="space-y-6">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                Finalize Your <span className="text-emerald-500">Enrollment</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                You are one step away from institutional-grade trading knowledge.
              </p>
            </section>

            {/* Payment Methods */}
            <section className="space-y-6">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-widest">
                <CreditCard className="w-5 h-5 text-emerald-500" /> Select Payment Method
              </h2>
              
              <div className="grid gap-4">
                {/* Online Payment */}
                <button 
                  onClick={() => setPaymentMethod('online')}
                  className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all text-left ${
                    paymentMethod === 'online' 
                    ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10' 
                    : 'border-black/5 dark:border-white/5 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'online' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <Zap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">Instant Activation</h3>
                      <p className="text-xs text-slate-500">Credit/Debit Card, UPI, NetBanking</p>
                    </div>
                  </div>
                  {paymentMethod === 'online' && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                </button>

                {/* Manual Payment */}
                <button 
                  onClick={() => setPaymentMethod('manual')}
                  className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all text-left ${
                    paymentMethod === 'manual' 
                    ? 'border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10' 
                    : 'border-black/5 dark:border-white/5 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${paymentMethod === 'manual' ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white">Manual Verification</h3>
                      <p className="text-xs text-slate-500">Bank Transfer / Cash (Admin Approval)</p>
                    </div>
                  </div>
                  {paymentMethod === 'manual' && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                </button>
              </div>
            </section>

            {/* Manual Instructions */}
            {paymentMethod === 'manual' && (
              <div className="p-8 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 space-y-4 animate-in fade-in slide-in-from-top-4">
                <h4 className="font-bold flex items-center gap-2">
                  <Smartphone className="w-5 h-5" /> Next Steps for Manual Payment
                </h4>
                <p className="text-sm leading-relaxed">
                  After clicking the button below, your enrollment request will be sent to our team. 
                  Please WhatsApp the transaction screenshot to <span className="font-black">+91 9876543210</span> along with your Registered Username.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 space-y-8">
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] border border-black/5 dark:border-white/5 shadow-2xl space-y-8 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[40px] -mr-16 -mt-16" />
                
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-black/5 dark:border-white/5 pb-4">Order Summary</h2>
                
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-black/5">
                    <img src={course.bannerImage} className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 dark:text-white leading-tight">{course.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Lifetime Access Included</p>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-500">Course Price</span>
                    <span className="text-slate-900 dark:text-white">${course.price}</span>
                  </div>
                  {course.discountPrice && (
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-slate-500">Discount Applied</span>
                      <span className="text-emerald-500">-${course.price - course.discountPrice}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t border-black/5 dark:border-white/5">
                    <span className="font-black text-slate-900 dark:text-white uppercase tracking-widest">Total Payable</span>
                    <span className="text-3xl font-black text-emerald-500">${course.discountPrice || course.price}</span>
                  </div>
                </div>

                <button 
                  onClick={handleEnroll}
                  disabled={processing}
                  className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-6 rounded-[2rem] font-black text-lg transition-all shadow-xl shadow-black/20 dark:shadow-white/5 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {processing ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <>
                      {paymentMethod === 'online' ? 'Pay & Enroll Now' : 'Request Manual Enrollment'}
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                  <ShieldCheck className="w-3 h-3 text-emerald-500" /> SECURE SSL ENCRYPTION
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
