import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Code2, Eye } from 'lucide-react';

interface ComponentDetailProps {
  component: {
    id: string;
    title: string;
    category: string;
    description: string;
    Playground: React.FC;
  };
  onBack: () => void;
}

export const ComponentDetail: React.FC<ComponentDetailProps> = ({ component, onBack }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col gap-8 w-full max-w-5xl mx-auto"
    >
      {/* Header / Back Button */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="size-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-primary uppercase tracking-widest">{component.category}</span>
          <h2 className="text-3xl font-black text-slate-100">{component.title}</h2>
        </div>
      </div>

      {/* Description */}
      <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
        <p className="text-slate-300 text-lg leading-relaxed">
          {component.description}
        </p>
      </div>

      {/* Interactive Playground */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-slate-100 font-bold text-xl">
          <Eye className="text-primary" />
          Interactive Playground
        </div>
        <p className="text-slate-400 text-sm">Coba klik dan berinteraksi dengan komponen di bawah ini.</p>
        
        <div className="w-full min-h-[400px] bg-background-dark/80 border border-primary/20 rounded-3xl flex items-center justify-center p-8 relative overflow-hidden shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          
          <div className="relative z-10 w-full flex justify-center">
            <component.Playground />
          </div>
        </div>
      </div>

      {/* Code Snippet Placeholder (Optional visual flair) */}
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex items-center gap-2 text-slate-100 font-bold text-xl">
          <Code2 className="text-primary" />
          Usage Guidelines
        </div>
        <div className="p-6 rounded-2xl bg-[#0d0d12] border border-slate-800 font-mono text-sm text-slate-400">
          <div className="flex gap-2 mb-4 border-b border-slate-800 pb-2">
            <div className="size-3 rounded-full bg-rose-500/50"></div>
            <div className="size-3 rounded-full bg-amber-500/50"></div>
            <div className="size-3 rounded-full bg-emerald-500/50"></div>
          </div>
          <p className="text-emerald-400 mb-2">// Pastikan komponen ini mudah diakses (Accessible)</p>
          <p><span className="text-purple-400">import</span> {'{'} {component.title.replace(/\s+/g, '')} {'}'} <span className="text-purple-400">from</span> <span className="text-amber-300">'@/components/ui'</span>;</p>
          <br/>
          <p><span className="text-blue-400">export default function</span> <span className="text-amber-200">Example</span>() {'{'}</p>
          <p className="pl-4"><span className="text-purple-400">return</span> (</p>
          <p className="pl-8 text-slate-300">&lt;{component.title.replace(/\s+/g, '')} /&gt;</p>
          <p className="pl-4">);</p>
          <p>{'}'}</p>
        </div>
      </div>
    </motion.div>
  );
}
