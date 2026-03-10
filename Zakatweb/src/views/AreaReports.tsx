import React, { useMemo, useState } from 'react';
import { useData } from '../context/DataContext';

export default function AreaReports() {
  const { data } = useData();
  const [selectedArea, setSelectedArea] = useState<string | null>(null);

  const areaStats = useMemo(() => {
    let areas: Record<string, { total: number; distributed: number; totalAmount: number; isCash: boolean }> = {};
    
    data.forEach(item => {
      const area = item.Area || 'Unknown';
      if (!areas[area]) {
        areas[area] = { total: 0, distributed: 0, totalAmount: 0, isCash: false };
      }
      
      areas[area].total++;
      
      const status = (item.Status || '').toLowerCase();
      if (status.includes('disalurkan') || status.includes('distributed') || status.includes('selesai') || status.includes('terdistribusi')) {
        areas[area].distributed++;
      }

      const amount = parseFloat(item.Jumlah) || 0;
      areas[area].totalAmount += amount;

      const type = (item['Jenis Zakat'] || '').toLowerCase();
      if (type.includes('uang') || type.includes('cash')) {
        areas[area].isCash = true;
      }
    });

    return areas;
  }, [data]);

  const formatCurrency = (amount: number, isCash: boolean) => {
    if (!isCash) return `${amount} kg`;
    if (amount >= 1000000) {
      return 'Rp ' + (amount / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (amount >= 1000) {
      return 'Rp ' + (amount / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return 'Rp ' + amount.toString();
  };

  return (
    <main className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-background-dark/50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Area Reports</h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time sector completion tracking analytics.</p>
            </div>
            <div className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl">
              <button className="px-4 py-2 text-sm font-medium bg-white dark:bg-slate-700 shadow-sm rounded-lg text-slate-900 dark:text-white transition-all">All Areas</button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Area Performance Overview</h3>
                <p className="text-sm text-slate-500">Real-time sector completion tracking</p>
              </div>
              <span className="material-symbols-outlined text-slate-400">analytics</span>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Object.entries(areaStats).map(([area, stats]: [string, any], idx) => {
                const { total, distributed } = stats;
                const progress = total > 0 ? Math.round((distributed / total) * 100) : 0;
                let statusColor = 'bg-primary/10 text-primary';
                let statusText = 'ON TRACK';
                let barColor = 'bg-primary';
                
                if (progress === 100) {
                  statusColor = 'bg-primary/20 text-primary';
                  statusText = 'COMPLETED';
                } else if (progress < 30) {
                  statusColor = 'bg-slate-500/10 text-slate-500';
                  statusText = 'DELAYED';
                  barColor = 'bg-slate-400';
                } else if (progress < 60) {
                  statusColor = 'bg-amber-500/10 text-amber-500';
                  statusText = 'ATTENTION';
                  barColor = 'bg-amber-500';
                }

                return (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50 ${progress === 100 ? 'cursor-pointer hover:border-primary/50 hover:shadow-md transition-all' : ''}`}
                    onClick={() => {
                      if (progress === 100) {
                        setSelectedArea(area);
                      }
                    }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Sector {String(idx + 1).padStart(2, '0')}</p>
                        <p className="text-sm font-bold">{area}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColor}`}>{statusText}</span>
                    </div>
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{progress}%</span>
                      <span className="text-[10px] text-slate-400">{distributed} / {total} Units</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full">
                      <div className={`${barColor} h-full rounded-full transition-all duration-500 ${progress >= 80 ? 'shadow-[0_0_8px_rgba(16,185,129,0.4)]' : ''}`} style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                );
              })}
              
              {Object.keys(areaStats).length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500">
                  No area data available. Please sync data first.
                </div>
              )}
            </div>
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/20 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
              <p className="text-[10px] text-slate-400">Last sync: Just now</p>
              <button className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">refresh</span> Refresh Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Completed Area */}
      {selectedArea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-lg">Distribution Report - {selectedArea}</h3>
              <button 
                onClick={() => setSelectedArea(null)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="rounded-xl overflow-hidden mb-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <img 
                  src={`https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1000`} 
                  alt="Distribution Documentation" 
                  className="w-full h-64 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mb-1">Status</p>
                  <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">100% Distributed</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1">Total Units</p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">{areaStats[selectedArea]?.total} Households</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500">Documentation Notes</h4>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  All zakat packages for {selectedArea} have been successfully distributed to the registered households. The distribution process was completed smoothly without any reported issues. Documentation photos have been verified by the field coordinator.
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
              <button 
                onClick={() => setSelectedArea(null)}
                className="px-6 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
