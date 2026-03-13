import React from 'react';

export const V = ({children}: {children: React.ReactNode}) => (
  <div className="flex items-center justify-center w-full h-full p-2">{children}</div>
);

export const P = ({children, title}: {children: React.ReactNode, title?: string}) => (
  <div className="flex flex-col items-center justify-center p-8 bg-background-dark/50 rounded-2xl border border-primary/20 w-full max-w-md min-h-[250px] gap-4 relative overflow-hidden">
    {title && <h4 className="absolute top-4 left-4 text-xs font-bold text-primary uppercase tracking-widest">{title}</h4>}
    {children}
  </div>
);
