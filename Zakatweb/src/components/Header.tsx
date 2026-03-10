import React from 'react';

interface HeaderProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function Header({ currentView, setCurrentView }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined text-3xl">mosque</span>
              <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight flex items-center gap-1">
                ZakatFitrah Monitor
                <span className="material-symbols-outlined text-amber-500 text-sm animate-pulse">star</span>
              </h2>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`text-sm font-semibold transition-colors ${currentView === 'dashboard' ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary'}`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('muzakki')}
                className={`text-sm font-semibold transition-colors ${currentView === 'muzakki' ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary'}`}
              >
                Data Muzakki
              </button>
              <button
                onClick={() => setCurrentView('distribution')}
                className={`text-sm font-semibold transition-colors ${currentView === 'distribution' ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary'}`}
              >
                Distribution
              </button>
              <button
                onClick={() => setCurrentView('areareports')}
                className={`text-sm font-semibold transition-colors ${currentView === 'areareports' ? 'text-primary' : 'text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary'}`}
              >
                Area Reports
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
              <input className="bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm w-64 focus:ring-2 focus:ring-primary outline-none text-slate-900 dark:text-white" placeholder="Search data..." type="text" />
            </div>
            <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Live Updates</span>
            </div>
            <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden">
              <img className="w-full h-full object-cover" alt="User profile avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAurPaVCZFvmnOeZPEVP9sdb-Lo9T5SmwZu2ah1fM9uq9OmR6UTexZjKoU1eFVg42YvTLtcqf5X4EZ0G95MAdDGu63vzEfN5xHdecBy5gMrsGW88HzAs84ITFbV9LL4wJ8nGioxiVkRuikV8UNdLOCBeMIj8Qu8ffzso5OC8LsR77aX4cnLcbze26smr4-lvPhrrgFufFKu_erSELnz6THeoTJgRKDKUq_zJW9WbvsUMTo56gobPf0FncGa-mPOhCLQD4MlLE8_uDE" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
