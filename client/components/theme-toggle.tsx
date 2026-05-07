"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full bg-slate-800/50 border border-white/10 animate-pulse" />
    )
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex items-center justify-center w-9 h-9 rounded-full bg-slate-800/50 border border-white/10 hover:bg-slate-700/50 transition-all group overflow-hidden"
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center transition-transform duration-500 transform rotate-0 dark:-rotate-90">
        <Sun className="h-5 w-5 text-amber-400 absolute transition-all scale-100 dark:scale-0 opacity-100 dark:opacity-0" />
        <Moon className="h-5 w-5 text-blue-400 absolute transition-all scale-0 dark:scale-100 opacity-0 dark:opacity-100" />
      </div>
    </button>
  )
}
