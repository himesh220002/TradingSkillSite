"use client"

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api-config';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  CreditCard,
  Building2,
  Wallet,
  Smartphone,
  ChevronRight,
  Shield,
  Zap
} from "lucide-react";

export default function PaymentPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [inrPrice, setInrPrice] = useState<string | null>(null);

  const price = searchParams.get('amount') || '0';
  const courseTitle = searchParams.get('course') || 'Course';

  useEffect(() => {
    // Dynamically load Razorpay Checkout Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    // Fetch live USD to INR conversion
    const fetchInrPrice = async () => {
      try {
        const res = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await res.json();
        if (data?.result === 'success' && data?.rates?.INR) {
          const converted = Math.round(Number(price) * data.rates.INR);
          setInrPrice(converted.toLocaleString('en-IN'));
        }
      } catch {
        // Fallback rate
        const converted = Math.round(Number(price) * 85);
        setInrPrice(converted.toLocaleString('en-IN'));
      }
    };
    fetchInrPrice();

  }, [price]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!userData.id || completed) return;

    // Poll every 3 seconds to check if payment succeeded (via Webhook)
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/payments/check-enrollment?userId=${userData.id}&courseId=${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.enrolled) {
            setCompleted(true);
            clearInterval(interval);
            setTimeout(() => {
              router.push('/my-learning');
            }, 3000);
          }
        }
      } catch (error) {
        console.error('Error polling enrollment status:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [id, completed, router]);

  const handlePayment = async () => {
    setProcessing(true);
    
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (!userData.id) {
      alert('User session not found. Please log in.');
      setProcessing(false);
      return;
    }
    
    try {
      // 1. Fetch Razorpay key ID configuration from backend
      const configRes = await fetch(`${API_BASE_URL}/api/payments/config`);
      const { keyId } = await configRes.json();

      if (!keyId) {
        throw new Error('Razorpay public key ID is not configured on the server.');
      }

      // 2. Request backend to create a Razorpay Order
      const orderRes = await fetch(`${API_BASE_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: id,
          amount: Number(price)
        }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.message || 'Failed to initialize order on server');
      }

      const orderData = await orderRes.json(); // contains orderId, amount, currency

      // 3. Open the Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'TradingSkill',
        description: courseTitle,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            setProcessing(true);
            
            // 4. Verify transaction signature and trigger enrollment
            const verifyRes = await fetch(`${API_BASE_URL}/api/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                userId: userData.id,
                courseId: id,
                amount: Number(price)
              }),
            });

            if (verifyRes.ok) {
              setCompleted(true);
              setTimeout(() => {
                router.push('/my-learning');
              }, 3000);
            } else {
              const errData = await verifyRes.json();
              alert(errData.message || 'Payment signature verification failed.');
            }
          } catch (err: any) {
            console.error('Verification error:', err);
            alert('Error during verification: ' + err.message);
          } finally {
            setProcessing(false);
          }
        },
        prefill: {
          name: userData.username || '',
        },
        theme: {
          color: '#10b981', // Emerald theme color
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Payment initialization error:', error);
      alert('Failed to initialize payment gateway: ' + error.message);
      setProcessing(false);
    }
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto border-4 border-emerald-500/20">
              <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-950">
              <Zap className="w-4 h-4 text-white fill-current" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Payment <span className="text-emerald-500">Verified</span></h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Your institutional access has been provisioned</p>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] border border-black/5 dark:border-white/5">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Redirecting to Terminal</div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 animate-[progress_3s_ease-in-out]" style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-32 pb-20 px-4">
      <div className="max-w-5xl mx-auto grid md:grid-cols-12 gap-12 items-start">
        {/* Left Column: Payment Methods */}
        <div className="md:col-span-7 space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Secure <span className="text-emerald-500">Checkout</span></h1>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">Encrypted Institutional Gateway</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'upi', label: 'UPI / QR', icon: Smartphone },
              { id: 'card', label: 'Card', icon: CreditCard },
              { id: 'netbanking', label: 'Net Banking', icon: Building2 },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setMethod(item.id as any)}
                className={cn(
                  "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 group",
                  method === item.id 
                    ? "bg-white dark:bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/10" 
                    : "bg-slate-100 dark:bg-slate-900/50 border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                  method === item.id ? "bg-emerald-500 text-white" : "bg-white dark:bg-slate-800 text-slate-400 group-hover:text-slate-600"
                )}>
                  <item.icon className="w-6 h-6" />
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-widest",
                  method === item.id ? "text-slate-900 dark:text-white" : "text-slate-400"
                )}>{item.label}</span>
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-black/5 dark:border-white/5 shadow-sm space-y-8">
            {method === 'upi' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">UPI ID / VPA</label>
                  <div className="relative">
                    <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      type="text" 
                      placeholder="username@okaxis"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl py-4 pl-14 pr-6 text-slate-900 dark:text-white outline-none transition-all font-bold"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 py-4">
                  <div className="h-[1px] flex-grow bg-slate-100 dark:bg-slate-800" />
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">or scan qr code</span>
                  <div className="h-[1px] flex-grow bg-slate-100 dark:bg-slate-800" />
                </div>
                <div className="flex justify-center">
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border-2 border-slate-100 dark:border-slate-700 shadow-inner">
                    <img 
                      src="/Payment system/PaymentQRHimesh.png" 
                      alt="Razorpay UPI QR Code"
                      className="w-48 h-48 rounded-2xl object-contain mx-auto"
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'card' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Card Holder Name</label>
                  <input 
                    type="text" 
                    placeholder="INSTITUTIONAL HOLDER"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl py-4 px-6 text-slate-900 dark:text-white outline-none transition-all font-bold uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Card Number</label>
                  <div className="relative">
                    <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input 
                      type="text" 
                      placeholder="0000 0000 0000 0000"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl py-4 pl-14 pr-6 text-slate-900 dark:text-white outline-none transition-all font-bold font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Expiry Date</label>
                    <input 
                      type="text" 
                      placeholder="MM / YY"
                      className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl py-4 px-6 text-slate-900 dark:text-white outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">CVV / CVC</label>
                    <div className="relative">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                      <input 
                        type="password" 
                        placeholder="•••"
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl py-4 pl-14 pr-6 text-slate-900 dark:text-white outline-none transition-all font-bold font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {method === 'netbanking' && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4">
                <div className="grid grid-cols-2 gap-3">
                  {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'KOTAK', 'Yes Bank'].map(bank => (
                    <button key={bank} className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-xs font-bold text-slate-600 dark:text-slate-400 text-left flex items-center justify-between group">
                      {bank}
                      <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -mr-32 -mt-32 group-hover:bg-emerald-500/20 transition-all duration-1000" />
            
            <h3 className="text-xl font-black uppercase italic tracking-tight mb-8">Order <span className="text-emerald-500">Manifest</span></h3>
            
            <div className="space-y-6 relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Active Course</div>
                  <div className="text-lg font-black leading-tight max-w-[200px]">{courseTitle}</div>
                </div>
                <div className="text-2xl font-black text-emerald-500 tracking-tighter">₹{inrPrice || price}</div>
              </div>

              <div className="h-[1px] bg-white/10" />

              <div className="space-y-4">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500 uppercase tracking-widest">Platform Fee</span>
                  <span className="text-slate-300">₹0.00</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-500 uppercase tracking-widest">Processing</span>
                  <span className="text-emerald-500 uppercase tracking-widest">Included</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Total Payable</span>
                  <div className="text-4xl font-black tracking-tighter">₹{inrPrice || price}</div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 transition-all active:scale-95 mt-4"
              >
                {processing ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Encrypting...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-6 h-6" />
                    <span>Finalize Connection</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-6 pt-4 grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700">
                <Shield className="w-8 h-8" />
                <Lock className="w-6 h-6" />
                <CreditCard className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
              </div>
              <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-widest">
                All transactions are protected by military-grade 256-bit SSL encryption. Your data is never stored on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
