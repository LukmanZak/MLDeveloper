import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-primary opacity-60 grayscale">
          <span className="material-symbols-outlined">mosque</span>
          <p className="text-xs font-bold tracking-tight">ZakatFitrah Monitor © 1445H</p>
        </div>
        <div className="flex gap-6">
          <a className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors" href="#">Documentation</a>
          <a className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors" href="#">Support Center</a>
          <a className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors" href="#">Security Audit</a>
        </div>
        <div className="text-[10px] text-slate-400">
          System Status: <span className="text-primary font-bold">Operational</span>
        </div>
      </div>
    </footer>
  );
}
