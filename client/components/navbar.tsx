"use client"

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, BookMarked, Menu, X, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/api-config";

const NAV_LINKS = [
  { name: 'Home', href: '/' },
  { name: 'Courses', href: '/course' },
  { name: 'Community', href: '/community' },
  { name: 'About', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Admin', href: '/admin' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);
  const [hasEnrolledBatches, setHasEnrolledBatches] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);

    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      if (parsed.id) {
        fetch(`${API_BASE_URL}/api/auth/profile/${parsed.id}`)
          .then(r => r.json())
          .then(data => {
            setHasEnrolledBatches((data.enrolledBatches?.length ?? 0) > 0);
          })
          .catch(() => { });
      }
    }

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setUser(null);
    setHasEnrolledBatches(false);
    window.location.reload();
  };

  if (pathname?.startsWith('/admin')) return null;
  const pathParts = pathname?.split('/').filter(Boolean) ?? [];
  if (pathParts[0] === 'course' && pathParts.length === 3) return null;

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-500",
      isScrolled || isMobileMenuOpen
        ? "border-b border-black/5 dark:border-white/5 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md"
        : "bg-white dark:bg-slate-950",
      isScrolled ? "h-16" : "h-20"
    )}>
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-500/20">
            <BarChart3 className="w-6 h-6 text-white dark:text-slate-950" />
          </div>
          <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">
            TradingX<span className="text-emerald-500">Skill</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-2 text-sm font-bold">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 transition-all hover:text-emerald-500 uppercase tracking-widest text-[10px]",
                  isActive ? "text-emerald-500" : "text-slate-500 dark:text-slate-400"
                )}
              >
                {link.name}
              </Link>
            );
          })}

          {user && hasEnrolledBatches && (
            <Link
              href="/my-learning"
              className={cn(
                "relative px-4 py-2 transition-all hover:text-emerald-500 flex items-center gap-2 uppercase tracking-widest text-[10px]",
                pathname?.startsWith('/my-learning') ? "text-emerald-500" : "text-slate-500 dark:text-slate-400"
              )}
            >
              <BookMarked className="w-3.5 h-3.5" />
              My Learning
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          
          {user ? (
            <div className="hidden lg:flex items-center gap-4 pl-6 border-l border-black/5 dark:border-white/5">
              <Link href="/profile" className="flex flex-col items-end group">
                <span className="text-xs font-black text-slate-900 dark:text-white leading-none group-hover:text-emerald-500 transition-colors uppercase tracking-tight">{user.username}</span>
                <span className="text-[10px] text-emerald-500 font-bold opacity-80 uppercase tracking-widest mt-1">Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 bg-red-500/10 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-6">
              <Link href="/portal" className="text-xs font-black text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-colors uppercase tracking-widest">
                Log in
              </Link>
              <Link href="/portal" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-2xl text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-xl shadow-emerald-500/20 uppercase tracking-widest">
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-600 dark:text-white transition-all active:scale-90"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={cn(
        "lg:hidden fixed inset-x-0 top-[72px] sm:top-[80px] bg-white dark:bg-slate-950 border-b border-black/5 dark:border-white/5 transition-all duration-500 ease-in-out overflow-hidden",
        isMobileMenuOpen ? "max-h-[80vh] opacity-100 shadow-2xl" : "max-h-0 opacity-0"
      )}>
        <div className="p-6 space-y-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "block px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all",
                pathname === link.href ? "bg-emerald-500 text-white" : "bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400"
              )}
            >
              {link.name}
            </Link>
          ))}
          
          {user && hasEnrolledBatches && (
            <Link
              href="/my-learning"
              className={cn(
                "flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all",
                pathname === '/my-learning' ? "bg-emerald-500 text-white" : "bg-emerald-500/10 text-emerald-500"
              )}
            >
              <BookMarked className="w-5 h-5" />
              My Learning
            </Link>
          )}

          <div className="pt-6 border-t border-black/5 dark:border-white/5 flex flex-col gap-4">
            {user ? (
              <>
                <Link href="/profile" className="flex items-center justify-between px-6 py-4 rounded-2xl bg-slate-50 dark:bg-white/5">
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase">{user.username}</span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Manage Profile</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full px-6 py-4 rounded-2xl bg-red-500/10 text-red-600 text-sm font-black uppercase tracking-widest"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/portal" className="w-full px-6 py-5 rounded-2xl bg-emerald-600 text-white text-sm font-black uppercase tracking-widest text-center shadow-xl shadow-emerald-500/20">
                Get Started
              </Link>
            )}
            <div className="flex justify-center pt-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
