"use client"

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  ChevronLeft,
  AlertCircle
} from "lucide-react";

export default function PaymentGatewayPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const amount = searchParams.get('amount') || '0';
  
  const [method, setMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [failed, setFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form States
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];
    for (let i = 0, len = v.length; i < len; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    if (parts.length > 0) {
      return parts.join(' ').substring(0, 19);
    } else {
      return v;
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length > 2) {
      return `${v.substring(0, 2)} / ${v.substring(2, 4)}`;
    }
    return v;
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setExpiry(formatted);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/[^0-9]/gi, '').substring(0, 4);
    setCvv(v);
  };

  const handlePayment = async () => {
    setProcessing(true);
    setFailed(false);
    
    // Mimic network delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    
    try {
      const response = await fetch('http://localhost:5000/api/batches/auto-enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          courseId: id,
          paymentMethod: 'online',
          amount: parseFloat(amount),
          transactionId: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        router.push(`/course/${id}/success?enrollmentId=${data.enrollment._id}`);
      } else {
        setFailed(true);
        setErrorMessage(data.message || 'Payment was declined by the issuer.');
      }
    } catch (error) {
      setFailed(true);
      setErrorMessage('Communication with bank failed. Please check your connection.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4 font-sans transition-colors duration-500">
      {/* Visual Header */}
      <div className="w-full max-w-[420px] mb-8 flex justify-between items-center px-2">
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Secured by CloudArmor</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <Lock className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-widest">256-bit AES</span>
        </div>
      </div>

      <div className="w-full max-w-[420px] bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-black/5 dark:border-white/5 relative">
        {/* Processing Overlay */}
        {processing && (
          <div className="absolute inset-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center space-y-6 animate-in fade-in">
            {(!success && !failed) && (
              <>
                <div className="relative">
                  <Loader2 className="w-16 h-16 text-emerald-500 animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-emerald-500/50" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Authorizing Payment...</h3>
                  <p className="text-sm text-slate-500 mt-2">Connecting to secure servers. Please do not refresh.</p>
                </div>
              </>
            )}

            {success && (
              <>
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white animate-bounce shadow-xl shadow-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Verification Successful</h3>
                  <p className="text-sm text-slate-500 mt-2">Your seat has been reserved. Redirecting to classroom...</p>
                </div>
              </>
            )}

            {failed && (
              <>
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-red-500/20">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Transaction Declined</h3>
                  <p className="text-sm text-red-500/70 mt-2 font-medium">{errorMessage}</p>
                </div>
                <button 
                  onClick={() => { setProcessing(false); setFailed(false); }}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-all"
                >
                  Try Another Method
                </button>
              </>
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="p-8 space-y-8">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Paying To</div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Trading Mastery Pro</h2>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">${amount}</div>
            </div>
          </div>

          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
            <button 
              onClick={() => setMethod('card')}
              className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${method === 'card' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-500' : 'text-slate-400'}`}
            >
              <CreditCard className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold uppercase">Card</span>
            </button>
            <button 
              onClick={() => setMethod('upi')}
              className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${method === 'upi' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-500' : 'text-slate-400'}`}
            >
              <Smartphone className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold uppercase">UPI</span>
            </button>
            <button 
              onClick={() => setMethod('netbanking')}
              className={`flex-1 flex flex-col items-center py-3 rounded-xl transition-all ${method === 'netbanking' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-500' : 'text-slate-400'}`}
            >
              <Building2 className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold uppercase">NetBank</span>
            </button>
          </div>

          {method === 'card' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Card Number</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="XXXX XXXX XXXX XXXX" 
                    className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-mono tracking-widest" 
                    autoComplete="off"
                  />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" className="absolute right-4 top-1/2 -translate-y-1/2 h-3 opacity-50" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expiry</label>
                  <input 
                    type="text" 
                    value={expiry}
                    onChange={handleExpiryChange}
                    placeholder="MM / YY" 
                    className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-mono" 
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CVV</label>
                  <input 
                    type="password" 
                    value={cvv}
                    onChange={handleCvvChange}
                    placeholder="***" 
                    className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm font-mono" 
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          )}

          {method === 'upi' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex flex-col items-center gap-4 border border-black/5">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=trading@pro&am=${amount}`} className="w-32 h-32 opacity-80 dark:invert" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scan QR with any UPI App</p>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Smartphone className="w-4 h-4 text-slate-400" />
                </div>
                <input type="text" placeholder="Enter UPI ID (e.g. user@okhdfc)" className="w-full bg-slate-50 dark:bg-slate-800 pl-12 pr-4 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm" />
              </div>
            </div>
          )}

          {method === 'netbanking' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
               <div className="grid grid-cols-3 gap-3">
                 {['HDFC', 'ICICI', 'SBI', 'AXIS', 'KOTAK', 'PNB'].map(bank => (
                   <div key={bank} className="p-3 border border-black/5 dark:border-white/5 rounded-xl text-center hover:border-emerald-500 transition-colors cursor-pointer group">
                      <div className="text-[10px] font-black text-slate-400 group-hover:text-emerald-500">{bank}</div>
                   </div>
                 ))}
               </div>
               <select className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl outline-none text-sm appearance-none border-none">
                 <option>Select from other banks...</option>
                 <option>Canara Bank</option>
                 <option>Union Bank</option>
               </select>
            </div>
          )}

          <div className="space-y-4 pt-4">
            <button 
              onClick={handlePayment}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-[2rem] font-black text-lg transition-all shadow-xl shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-3"
            >
              Pay ${amount} <ArrowRight className="w-5 h-5" />
            </button>
            <div className="text-center">
              <button 
                onClick={() => router.back()}
                className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest flex items-center justify-center gap-2 mx-auto"
              >
                <ChevronLeft className="w-3 h-3" /> Cancel & Return
              </button>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-t border-black/5 dark:border-white/5 flex justify-center items-center gap-6 opacity-40 grayscale">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" className="h-3" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/1200px-Stripe_Logo%2C_revised_2016.svg.png" className="h-3" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/RuPay.svg/1200px-RuPay.svg.png" className="h-4" />
        </div>
      </div>
    </div>
  );
}
