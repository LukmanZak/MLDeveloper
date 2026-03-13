import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

interface ComponentCardProps {
  data: {
    id: string;
    title: string;
    category: string;
    description: string;
    Visual: React.FC;
  };
  onClick: () => void;
  index: number;
}

export const ComponentCard: React.FC<ComponentCardProps> = ({ data, onClick, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.05 * index, ease: "easeOut" }}
      onClick={onClick}
      className="group rounded-3xl border border-primary/10 bg-primary/[0.02] hover:bg-primary/[0.05] hover:border-primary/30 transition-all duration-500 flex flex-col cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(127,19,236,0.15)] overflow-hidden"
    >
      {/* Visual Area */}
      <div className="h-48 w-full bg-background-dark/80 border-b border-primary/10 flex items-center justify-center relative overflow-hidden">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        
        {/* Glow Effect on Hover */}
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-500"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/20 blur-[50px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-500">
          <data.Visual />
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col gap-3 flex-grow relative">
        <div className="flex justify-between items-start">
          <h4 className="text-xl font-bold text-slate-100 tracking-tight">{data.title}</h4>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 py-1 rounded-md">{data.category}</span>
        </div>
        
        <p className="text-slate-400 text-sm leading-relaxed flex-grow font-medium line-clamp-3">
          {data.description}
        </p>
        
        <div className="mt-4 pt-4 border-t border-primary/10 flex justify-between items-center group-hover:border-primary/20 transition-colors">
          <span className="text-xs font-bold text-slate-500 group-hover:text-primary transition-colors">Lihat Detail & Interaksi</span>
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
            <ArrowRight size={16} className="text-primary group-hover:text-white transform group-hover:translate-x-0.5 transition-all duration-300" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
