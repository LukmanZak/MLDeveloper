import { 
  LayoutDashboard, 
  BookOpen, 
  Palette, 
  Type, 
  Compass, 
  LayoutGrid, 
  MessageSquare, 
  Layers, 
  Layout, 
  Image as ImageIcon, 
  MousePointerClick, 
  Wrench 
} from 'lucide-react';

interface SidebarProps {
  activeCategory: string | null;
  setActiveCategory: (category: string | null) => void;
  currentView: 'glossary' | 'documentation';
  setCurrentView: (view: 'glossary' | 'documentation') => void;
}

export const categories = [
  { id: 'Visual Foundations', icon: Palette, color: 'text-fuchsia-400' },
  { id: 'Input Controls', icon: Type, color: 'text-blue-400' },
  { id: 'Navigation', icon: Compass, color: 'text-cyan-400' },
  { id: 'Data Display', icon: LayoutGrid, color: 'text-indigo-400' },
  { id: 'Feedback', icon: MessageSquare, color: 'text-amber-400' },
  { id: 'Overlays', icon: Layers, color: 'text-rose-400' },
  { id: 'Layouts', icon: Layout, color: 'text-emerald-400' },
  { id: 'Media', icon: ImageIcon, color: 'text-purple-400' },
  { id: 'Interactions', icon: MousePointerClick, color: 'text-orange-400' },
  { id: 'Utilities', icon: Wrench, color: 'text-slate-400' },
];

export function Sidebar({ activeCategory, setActiveCategory, currentView, setCurrentView }: SidebarProps) {
  return (
    <aside className="w-full md:w-64 border-r border-primary/10 p-6 flex flex-col gap-8 bg-background-dark/30 hidden md:flex overflow-y-auto">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-primary/50 px-3">Main Menu</p>
        <nav className="flex flex-col gap-1.5">
          <button 
            onClick={() => {
              setCurrentView('glossary');
              setActiveCategory(null);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all w-full text-left ${currentView === 'glossary' && activeCategory === null ? 'bg-primary/15 text-primary shadow-[inset_0_0_0_1px_rgba(127,19,236,0.2)]' : 'text-slate-400 hover:bg-primary/10 hover:text-slate-200'}`}
          >
            <LayoutDashboard size={18} />
            <span className="text-sm">Glossary</span>
          </button>
          <button 
            onClick={() => setCurrentView('documentation')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all w-full text-left ${currentView === 'documentation' ? 'bg-primary/15 text-primary shadow-[inset_0_0_0_1px_rgba(127,19,236,0.2)]' : 'text-slate-400 hover:bg-primary/10 hover:text-slate-200'}`}
          >
            <BookOpen size={18} />
            <span className="text-sm">Documentation</span>
          </button>
        </nav>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-primary/50 px-3">Categories</p>
        <nav className="flex flex-col gap-1.5">
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => {
                setCurrentView('glossary');
                setActiveCategory(cat.id);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all w-full text-left group ${currentView === 'glossary' && activeCategory === cat.id ? 'bg-primary/10 text-slate-200 shadow-[inset_0_0_0_1px_rgba(127,19,236,0.2)]' : 'text-slate-400 hover:bg-primary/10 hover:text-slate-200'}`}
            >
              <cat.icon size={18} className={`${cat.color} ${activeCategory !== cat.id && 'opacity-70 group-hover:opacity-100'} transition-opacity`} />
              <span className="text-sm">{cat.id}</span>
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}

