"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, BookMarked } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Courses', href: '/course' },
  { name: 'Community', href: '/community' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
  { name: 'Admin', href: '/admin' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [hasEnrolledBatches, setHasEnrolledBatches] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);

    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      // Fetch profile to check enrolled batches
      if (parsed.id) {
        fetch(`http://localhost:5000/api/auth/profile/${parsed.id}`)
          .then(r => r.json())
          .then(data => {
            setHasEnrolledBatches((data.enrolledBatches?.length ?? 0) > 0);
          })
          .catch(() => {});
      }
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUser(null);
    setHasEnrolledBatches(false);
    window.location.reload();
  };

  if (pathname?.startsWith('/admin')) return null;
  // Hide on full-screen classroom: /course/[courseId]/[batchId]
  const pathParts = pathname?.split('/').filter(Boolean) ?? [];
  if (pathParts[0] === 'course' && pathParts.length === 3) return null;


  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-500",
      isScrolled
        ? "border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md h-14"
        : "bg-white dark:bg-slate-950 h-16"
    )}>
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
            <BarChart3 className="w-5 h-5 text-white dark:text-slate-950" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Trading<span className="text-emerald-500">Skill</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1 text-sm font-medium">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 transition-colors hover:text-emerald-500",
                  isActive ? "text-emerald-500" : "text-slate-500 dark:text-slate-400"
                )}
              >
                {link.name}
                <div className={cn(
                  "absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 transform origin-left",
                  isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                )} />
              </Link>
            );
          })}

          {/* My Learning — only shown when user is logged in and has batches */}
          {user && hasEnrolledBatches && (
            <Link
              href="/my-learning"
              className={cn(
                "relative px-4 py-2 transition-colors hover:text-emerald-500 flex items-center gap-1.5",
                pathname === '/my-learning' || pathname?.startsWith('/my-learning')
                  ? "text-emerald-500"
                  : "text-slate-500 dark:text-slate-400"
              )}
            >
              <BookMarked className="w-3.5 h-3.5" />
              My Learning
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <div className={cn(
                "absolute bottom-0 left-4 right-4 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 transform origin-left",
                pathname?.startsWith('/my-learning') ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
              )} />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-6">
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-black/5 dark:border-white/5">
              <Link href="/profile" className="flex flex-col items-end group">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-none group-hover:text-emerald-500 transition-colors">{user.username}</span>
                <span className="text-[10px] text-emerald-500 font-medium opacity-80">Student Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 bg-red-500/10 text-red-600 rounded-lg text-[10px] font-bold hover:bg-red-500 hover:text-white transition-all active:scale-95"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/portal" className="hidden sm:block text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors">
                Log in
              </Link>
              <Link href="/portal" className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
