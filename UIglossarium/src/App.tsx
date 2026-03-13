/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar, categories } from './components/Sidebar';
import { ComponentCard } from './components/ComponentCard';
import { ComponentDetail } from './components/ComponentDetail';
import { componentsData } from './data/index';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';

export default function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'glossary' | 'documentation'>('glossary');
  const [searchQuery, setSearchQuery] = useState('');
  
  const selectedComponent = componentsData.find(c => c.id === selectedId);
  
  // Filter logic
  let filteredComponents = componentsData;
  if (searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase();
    filteredComponents = componentsData.filter(c => 
      c.title.toLowerCase().includes(q) || 
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  } else if (activeCategory !== null) {
    filteredComponents = componentsData.filter(c => c.category === activeCategory);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header searchQuery={searchQuery} setSearchQuery={(q) => {
        setSearchQuery(q);
        if (q.trim() !== '') {
          setCurrentView('glossary');
          setSelectedId(null);
        }
      }} />
      <div className="flex flex-1 max-w-[1800px] w-full mx-auto">
        <Sidebar 
          activeCategory={activeCategory} 
          setActiveCategory={(cat) => {
            setActiveCategory(cat);
            setSelectedId(null);
            setSearchQuery('');
          }} 
          currentView={currentView}
          setCurrentView={(view) => {
            setCurrentView(view);
            setSelectedId(null);
            if (view === 'documentation') setSearchQuery('');
          }}
        />
        <main className="flex-1 p-6 md:p-10 lg:p-14 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            {currentView === 'documentation' ? (
              <motion.div 
                key="documentation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="max-w-4xl mx-auto"
              >
                <div className="mb-12">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-100 tracking-tight mb-5">
                    Documentation
                  </h1>
                  <p className="text-lg md:text-xl text-slate-400 leading-relaxed font-medium">
                    Tujuan dan panduan penggunaan UI Glossarium.
                  </p>
                </div>
                
                <div className="rounded-3xl overflow-hidden border border-primary/20 shadow-2xl mb-12">
                  <img 
                    src="https://stupid-coffee-cow.myfilebase.com/ipfs/QmQNpcUojT72qiFGscdyadQEL1VuLUnV3gxjQN57sduwBk" 
                    alt="UI Design Process" 
                    className="w-full h-90 md:h-120 object-cover"
                  />
                </div>
                
                <div className="prose prose-invert prose-lg max-w-none">
                  <h2 className="text-2xl font-bold text-white mb-4">Tujuan Dibuatnya UI Glossarium</h2>
                  <p className="text-slate-300 mb-6 leading-relaxed">
                    UI Glossarium dirancang sebagai pusat referensi interaktif bagi desainer, developer, dan product manager. 
                    Tujuan utamanya adalah untuk menyamakan pemahaman (mental model) mengenai berbagai komponen antarmuka pengguna (UI) 
                    dan pola interaksi (UX) yang sering digunakan dalam pengembangan aplikasi modern.
                  </p>
                  <h3 className="text-xl font-bold text-white mb-3">Manfaat Utama</h3>
                  <ul className="list-disc pl-6 text-slate-300 space-y-2 mb-8">
                    <li><strong>Standardisasi Istilah:</strong> Memastikan seluruh tim menggunakan nama yang sama untuk komponen yang sama (misalnya, membedakan antara Toggle Switch dan Checkbox).</li>
                    <li><strong>Referensi Visual & Interaktif:</strong> Tidak hanya membaca definisi, pengguna dapat melihat bentuk visual dan mencoba interaksi langsung (Playground) dari setiap komponen.</li>
                    <li><strong>Mempercepat Proses Desain & Development:</strong> Mengurangi kebingungan saat handoff desain ke development karena semua komponen sudah terdefinisi dengan jelas.</li>
                  </ul>
                  <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl">
                    <h4 className="text-primary font-bold mb-2">Cara Menggunakan</h4>
                    <p className="text-slate-300 text-sm">
                      Gunakan menu navigasi di sebelah kiri untuk menjelajahi berbagai kategori komponen, atau gunakan fitur pencarian di atas untuk menemukan komponen spesifik dengan cepat. Klik pada kartu komponen untuk melihat detail dan mencoba interaksinya.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : selectedComponent ? (
              <ComponentDetail 
                key="detail" 
                component={selectedComponent} 
                onBack={() => setSelectedId(null)} 
              />
            ) : (
              <motion.div 
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="mb-12">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-100 tracking-tight mb-5">
                    {searchQuery ? 'Search Results' : (activeCategory || 'UI Glossarium')}
                  </h1>
                  <p className="text-lg md:text-xl text-slate-400 max-w-3xl leading-relaxed font-medium">
                    {searchQuery 
                      ? `Menampilkan hasil pencarian untuk "${searchQuery}"` 
                      : (activeCategory 
                          ? `Komponen dalam kategori ${activeCategory}` 
                          : 'Kamus visual interaktif untuk komponen UI dan interaksi UX. Pilih kategori di bawah atau gunakan menu di samping.')}
                  </p>
                </div>
                
                {/* Show Category Grid if no active category and no search query */}
                {!activeCategory && !searchQuery ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categories.map((cat, idx) => {
                      const count = componentsData.filter(c => c.category === cat.id).length;
                      return (
                        <motion.button
                          key={cat.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: idx * 0.05 }}
                          onClick={() => setActiveCategory(cat.id)}
                          className="group flex flex-col items-start p-6 bg-slate-800/50 border border-primary/10 rounded-3xl hover:bg-primary/5 hover:border-primary/30 transition-all text-left hover:-translate-y-1 hover:shadow-xl"
                        >
                          <div className={`p-4 rounded-2xl bg-slate-900 mb-4 group-hover:scale-110 transition-transform ${cat.color}`}>
                            <cat.icon size={32} />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">{cat.id}</h3>
                          <p className="text-slate-400 text-sm mb-4">{count} Komponen</p>
                          <div className="mt-auto flex items-center gap-2 text-primary text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0">
                            Lihat Kategori <ArrowRight size={16} />
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredComponents.map((component, idx) => (
                      <ComponentCard 
                        key={component.id} 
                        data={component} 
                        index={idx} 
                        onClick={() => setSelectedId(component.id)}
                      />
                    ))}
                    {filteredComponents.length === 0 && (
                      <div className="col-span-full py-20 text-center text-slate-500 font-medium">
                        Tidak ada komponen yang ditemukan.
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}


