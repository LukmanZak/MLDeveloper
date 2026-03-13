import { Layers, Search, Bookmark, User } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function Header({ searchQuery, setSearchQuery }: HeaderProps) {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-primary/20 px-6 md:px-10 py-4 bg-background-dark/80 sticky top-0 z-50 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="size-10 flex items-center justify-center bg-primary rounded-xl text-white shadow-[0_0_20px_rgba(127,19,236,0.4)]">
          <Layers size={22} />
        </div>
        <h2 className="text-slate-100 text-2xl font-black leading-tight tracking-tight">UI Glossarium</h2>
      </div>
      <div className="flex flex-1 justify-end gap-4 md:gap-8">
        <label className="hidden md:flex flex-col min-w-40 h-11 max-w-xs relative group">
          <div className="flex w-full flex-1 items-stretch rounded-xl h-full border border-primary/20 bg-primary/5 transition-all duration-300 group-focus-within:border-primary/50 group-focus-within:bg-primary/10 group-focus-within:shadow-[0_0_15px_rgba(127,19,236,0.15)]">
            <div className="text-primary/50 flex items-center justify-center pl-4 rounded-l-xl transition-colors group-focus-within:text-primary">
              <Search size={18} />
            </div>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex w-full min-w-0 flex-1 border-none bg-transparent focus:ring-0 text-sm text-slate-200 placeholder:text-primary/40 rounded-r-xl px-3 outline-none" 
              placeholder="Search components..." 
            />
          </div>
        </label>
        <div className="flex gap-3">
          <button className="flex items-center justify-center rounded-xl h-11 w-11 bg-primary/10 hover:bg-primary/20 text-slate-300 hover:text-white transition-all duration-300">
            <Bookmark size={20} />
          </button>
          <button className="flex items-center justify-center rounded-xl h-11 w-11 bg-primary hover:bg-primary/90 text-white transition-all duration-300 shadow-[0_0_15px_rgba(127,19,236,0.3)] hover:shadow-[0_0_25px_rgba(127,19,236,0.5)] hover:-translate-y-0.5">
            <User size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
