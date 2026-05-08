"use client"

import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from "lucide-react";

const PAIRS = [
  { name: 'BTC/USDT', price: '64,231.50', change: '+2.4%', up: true },
  { name: 'ETH/USDT', price: '3,452.12', change: '+1.8%', up: true },
  { name: 'XAU/USD', price: '2,315.40', change: '-0.2%', up: false },
  { name: 'EUR/USD', price: '1.0842', change: '+0.1%', up: true },
  { name: 'SOL/USDT', price: '145.20', change: '+5.2%', up: true },
  { name: 'GBP/USD', price: '1.2645', change: '-0.4%', up: false },
];

export const MarketTicker = () => {
  return (
    <div className="bg-slate-900/80 backdrop-blur-md border-y border-white/5 py-3 overflow-hidden select-none">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...PAIRS, ...PAIRS].map((pair, idx) => (
          <div key={idx} className="flex items-center gap-6 px-8 border-r border-white/10">
            <span className="text-[10px] font-black tracking-widest text-slate-400">{pair.name}</span>
            <span className="text-sm font-bold text-white font-mono">{pair.price}</span>
            <div className={`flex items-center gap-1 text-[10px] font-bold ${pair.up ? 'text-emerald-400' : 'text-red-400'}`}>
              {pair.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {pair.change}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
