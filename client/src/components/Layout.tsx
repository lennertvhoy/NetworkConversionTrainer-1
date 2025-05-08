import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "@/components/ui/theme-provider";
import { CodeSquare, Sun, Moon } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure theme toggle only shows after hydration to avoid mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans dark:bg-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <header className="bg-white shadow-sm dark:bg-zinc-800">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link href="/">
            <a className="text-2xl font-bold text-primary flex items-center gap-2">
              <CodeSquare className="h-6 w-6" />
              <span>BinaryNetTrainer</span>
            </a>
          </Link>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-700"
              aria-label="Toggle theme"
            >
              {mounted && (
                theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )
              )}
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-400">
              <span>Student</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation tabs */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 dark:border-zinc-700">
          <nav className="-mb-px flex space-x-8">
            <Link href="/">
              <a
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  location === "/"
                    ? "text-primary border-primary dark:text-primary-foreground"
                    : "text-slate-500 border-transparent hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                }`}
              >
                Dashboard
              </a>
            </Link>
            <Link href="/binary">
              <a
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  location === "/binary"
                    ? "text-primary border-primary dark:text-primary-foreground"
                    : "text-slate-500 border-transparent hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                }`}
              >
                Binary Conversion
              </a>
            </Link>
            <Link href="/subnetting">
              <a
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  location === "/subnetting"
                    ? "text-primary border-primary dark:text-primary-foreground"
                    : "text-slate-500 border-transparent hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-300"
                }`}
              >
                Subnetting
              </a>
            </Link>
          </nav>
        </div>

        {/* Main content */}
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
