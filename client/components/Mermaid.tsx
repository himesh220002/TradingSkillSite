"use client"

import React, { useEffect, useRef, useState } from 'react';

interface MermaidProps {
  chart: string;
}

export const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeAndRender = async () => {
      try {
        // Double check window and document are defined (client-side only)
        if (typeof window === 'undefined') return;

        // Dynamic script injection for mermaid
        if (!(window as any).mermaid) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js';
          script.async = true;
          script.onload = () => {
            if (isMounted) {
              try {
                const m = (window as any).mermaid;
                m.initialize({
                  startOnLoad: false,
                  theme: 'dark',
                  securityLevel: 'loose',
                  themeVariables: {
                    background: '#0f172a',
                    primaryColor: '#10b981',
                    primaryTextColor: '#f8fafc',
                    lineColor: '#64748b'
                  }
                });
                renderChart(m);
              } catch (err: any) {
                console.error('Mermaid initialization error:', err);
                setError(err.message || 'Error initializing diagrams');
              }
            }
          };
          script.onerror = () => {
            if (isMounted) setError('Failed to load diagram engine script.');
          };
          document.body.appendChild(script);
        } else {
          const m = (window as any).mermaid;
          renderChart(m);
        }
      } catch (err: any) {
        console.error('Mermaid runtime error:', err);
        if (isMounted) setError(err.message || 'Error loading diagram engine.');
      }
    };

    const renderChart = async (m: any) => {
      try {
        const id = `mermaid-${Math.floor(Math.random() * 1000000)}`;
        const { svg: renderedSvg } = await m.render(id, chart);
        if (isMounted) {
          setSvg(renderedSvg);
          setError(null);
        }
      } catch (err: any) {
        console.error('Mermaid compilation error:', err);
        // Clear any bad syntax styles that mermaid appends to document body
        const badStyle = document.getElementById('d' + chart.slice(0, 10));
        if (badStyle) badStyle.remove();
        if (isMounted) {
          setError('Failed to compile diagram. Check syntax.');
        }
      }
    };

    initializeAndRender();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (error) {
    return (
      <div className="w-full bg-red-950/20 border border-red-500/20 p-6 rounded-3xl text-center text-xs font-bold text-red-400">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="mermaid-chart flex justify-center items-center w-full bg-slate-900 p-4 rounded-[2rem] border border-white/5 overflow-auto shadow-inner"
      dangerouslySetInnerHTML={{ __html: svg || '<div class="text-slate-400 text-xs font-black uppercase tracking-[0.2em] animate-pulse">Synchronizing Diagram...</div>' }}
    />
  );
};
