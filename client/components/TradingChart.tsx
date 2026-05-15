"use client"

import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface TradingChartProps {
  type: string;
  caption?: string;
}

export default function TradingChart({ type, caption }: TradingChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    let data: any = { labels: [], datasets: [] };
    const options: any = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { size: 10, weight: 'bold' },
          bodyFont: { size: 10 },
          padding: 10,
          displayColors: false,
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748b', font: { size: 10 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#64748b', font: { size: 10 } }
        }
      }
    };

    if (type === 'PAYOFF') {
      // Long Call Payoff Example
      const labels = [80, 90, 100, 110, 120];
      data = {
        labels,
        datasets: [{
          label: 'Profit/Loss',
          data: [-10, -10, -10, 0, 10],
          borderColor: '#10b981',
          borderWidth: 3,
          fill: false,
          tension: 0,
          pointBackgroundColor: '#10b981',
        }]
      };
      options.plugins.title = { display: true, text: 'Options Payoff (Risk/Reward)', color: '#fff', font: { size: 12, weight: '900' } };
    } else if (type === 'GAMMA') {
      // Gamma Bell Curve
      const labels = Array.from({ length: 41 }, (_, i) => 80 + i);
      const mu = 100;
      const sigma = 5;
      const curve = labels.map(x => (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2)));
      data = {
        labels,
        datasets: [{
          label: 'Gamma Sensitivity',
          data: curve,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        }]
      };
      options.plugins.title = { display: true, text: 'Gamma Profile (Convexity)', color: '#fff', font: { size: 12, weight: '900' } };
    } else if (type === 'THETA') {
      // Theta Decay
      const labels = Array.from({ length: 30 }, (_, i) => 30 - i);
      const curve = labels.map(t => -100 * Math.exp(-0.05 * (30 - t)));
      data = {
        labels: labels.map(t => `${t}d`),
        datasets: [{
          label: 'Time Erosion',
          data: curve,
          borderColor: '#f43f5e',
          backgroundColor: 'rgba(244, 63, 94, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0,
        }]
      };
      options.plugins.title = { display: true, text: 'Theta Decay (Time Erosion)', color: '#fff', font: { size: 12, weight: '900' } };
    } else if (type === 'DELTA') {
      // Delta S-Curve
      const labels = Array.from({ length: 41 }, (_, i) => 80 + i);
      const curve = labels.map(x => 1 / (1 + Math.exp(-0.3 * (x - 100))));
      data = {
        labels,
        datasets: [{
          label: 'Delta Hedge Ratio',
          data: curve,
          borderColor: '#3b82f6',
          borderWidth: 3,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
        }]
      };
      options.plugins.title = { display: true, text: 'Delta S-Curve (Hedge Ratio)', color: '#fff', font: { size: 12, weight: '900' } };
    }

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data,
      options
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type]);

  return (
    <div className="w-full h-full min-h-[300px] flex flex-col p-6 rounded-[2rem] bg-slate-900 border border-white/5 shadow-2xl group transition-all hover:border-emerald-500/20">
      <div className="flex-1 relative">
        <canvas ref={chartRef} />
      </div>
      {caption && (
        <div className="mt-4 pt-4 border-t border-white/5 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{caption}</p>
        </div>
      )}
    </div>
  );
}
