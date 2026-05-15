"use client"

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  BarChart3,
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Bell,
  Search,
  GraduationCap,
  MessageSquare,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_MENU = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Courses', href: '/admin/courses', icon: BookOpen },
  { name: 'Batches', href: '/admin/batches', icon: Users },
  { name: 'Community', href: '/admin/community', icon: MessageSquare },
  { name: 'Students', href: '/admin/students', icon: GraduationCap },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuth, setIsAuth] = React.useState<boolean | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('adminToken');
      if (token !== 'authenticated' && pathname !== '/admin/login') {
        router.push('/admin/login');
      } else {
        setIsAuth(true);
      }
    };
    checkAuth();
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  // If we are checking auth or on login page, just show children
  if (pathname === '/admin/login') return <>{children}</>;
  if (isAuth === null) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 border-r border-black/5 dark:border-white/5 bg-white dark:bg-slate-900/50 hidden lg:flex flex-col fixed inset-y-0 z-50">
        <div className="p-2 sm:p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white dark:text-slate-950" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Admin<span className="text-emerald-500">Panel</span></span>
          </Link>
        </div>

        <nav className="flex-grow px-4 space-y-2 mt-4">
          {ADMIN_MENU.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-emerald-500" : "group-hover:text-emerald-500 transition-colors")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300",
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 z-[70] lg:hidden transition-transform duration-300 ease-in-out flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white dark:text-slate-950" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Admin<span className="text-emerald-500">Panel</span></span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-grow px-4 space-y-2 mt-4">
          {ADMIN_MENU.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-emerald-500" : "group-hover:text-emerald-500 transition-colors")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow lg:pl-64 flex flex-col min-h-screen w-full min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-2 sm:gap-4 flex-grow min-w-0 max-w-xl">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 shrink-0 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
              aria-label="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 px-3 sm:px-4 py-2 rounded-full flex-grow min-w-0">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input 
                type="text" 
                placeholder="Search..." 
                className="bg-transparent border-none outline-none text-xs sm:text-sm text-slate-600 dark:text-slate-300 w-full min-w-0"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden xs:block">
              <Bell className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
            </button>
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 font-bold text-xs shrink-0">
              AD
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 flex-grow overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
