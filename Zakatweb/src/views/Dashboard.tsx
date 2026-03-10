import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';

interface DashboardProps {
  setCurrentView: (view: string) => void;
}

export default function Dashboard({ setCurrentView }: DashboardProps) {
  const { data } = useData();

  const stats = useMemo(() => {
    let totalMuzakki = data.length;
    let totalRice = 0;
    let totalCash = 0;
    let countRice = 0;
    let countCash = 0;
    let distributedCount = 0;
    let areaGroups: Record<string, { total: number; distributed: number }> = {};
    let recentSubmissions = [...data].reverse().slice(0, 5);

    data.forEach(item => {
      // Calculate amounts
      const amount = parseFloat(item.Jumlah) || 0;
      const type = (item['Jenis Zakat'] || '').toLowerCase();
      if (type.includes('beras') || type.includes('rice')) {
        totalRice += amount;
        countRice++;
      } else if (type.includes('uang') || type.includes('cash')) {
        totalCash += amount;
        countCash++;
      }

      // Calculate distribution
      const status = (item.Status || '').toLowerCase();
      const isDistributed = status.includes('disalurkan') || status.includes('distributed') || status.includes('selesai') || status.includes('terdistribusi');
      if (isDistributed) {
        distributedCount++;
      }

      // Calculate area performance
      const area = item.Area || 'Unknown';
      if (!areaGroups[area]) {
        areaGroups[area] = { total: 0, distributed: 0 };
      }
      areaGroups[area].total++;
      if (isDistributed) {
        areaGroups[area].distributed++;
      }
    });

    const distributionRate = totalMuzakki > 0 ? Math.round((distributedCount / totalMuzakki) * 100) : 0;

    return { totalMuzakki, totalRice, totalCash, countRice, countCash, distributionRate, areaGroups, recentSubmissions };
  }, [data]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return amount.toString();
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('verifi') || s.includes('terverifikasi')) return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400';
    if (s.includes('selesai') || s.includes('disalurkan') || s.includes('distributed') || s.includes('terdistribusi')) return 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400';
    return 'bg-slate-500/20 text-slate-500';
  };

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section & Real-time Stats */}
      <div className="mb-10">
        <div className="relative w-full h-48 md:h-64 rounded-2xl overflow-hidden mb-8 shadow-md">
          {/* Mosque Image Background */}
          <img 
            src="https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=2000" 
            alt="Mosque" 
            className="absolute inset-0 w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 to-slate-900/40 dark:from-slate-900/90 dark:to-slate-900/60"></div>
          
          <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end">
            <div className="flex items-center gap-3 mb-2">
              <span className="material-symbols-outlined text-amber-400 text-3xl animate-pulse">star</span>
              <span className="material-symbols-outlined text-amber-400 text-2xl">dark_mode</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Dashboard Ramadhan 1445H</h1>
            <p className="text-slate-200 mt-2 max-w-2xl">Real-time monitoring of collection and distribution progress across all sectors during the holy month.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <span className="material-symbols-outlined">volunteer_activism</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Muzakki</p>
            </div>
            <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">{stats.totalMuzakki} <span className="text-sm font-normal text-slate-400 italic">Donors</span></p>
            <div className="mt-2 flex items-center text-xs text-primary font-medium">
              <span className="material-symbols-outlined text-xs">trending_up</span>
              <span>12% from yesterday</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <span className="material-symbols-outlined">rice_bowl</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Rice Collected</p>
            </div>
            <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">{stats.totalRice.toLocaleString()} <span className="text-sm font-normal text-slate-400 italic">kg</span></p>
            <div className="mt-2 flex items-center text-xs text-primary font-medium">
              <span className="material-symbols-outlined text-xs">check_circle</span>
              <span>Terverifikasi 100%</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Cash Collected</p>
            </div>
            <div className="flex flex-col">
              <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-widest">IDR Equivalent</p>
              <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">{formatCurrency(stats.totalCash)}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <span className="material-symbols-outlined">diversity_3</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Distribution Rate</p>
            </div>
            <p className="text-slate-900 dark:text-white text-3xl font-bold tracking-tight">{stats.distributionRate}%</p>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-primary h-full transition-all duration-500" style={{ width: `${stats.distributionRate}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Monitoring Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Distribution Status & Area Coverage */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Section: Area Coverage Map Simulation */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Area Performance Overview</h3>
                <p className="text-sm text-slate-500">Real-time sector completion tracking</p>
              </div>
              <span className="material-symbols-outlined text-slate-400">analytics</span>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(stats.areaGroups).map(([area, data]: [string, any], idx) => {
                const { total, distributed } = data;
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
                  <div key={idx} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/50">
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
              {Object.keys(stats.areaGroups).length === 0 && (
                <div className="col-span-full text-center py-8 text-slate-500">
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

          {/* Section: Zakat Type Breakdown */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-bold">Zakat Type Breakdown</h3>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Beras (Rice)</span>
                  <span className="text-xs font-bold text-primary">{stats.totalRice} kg</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full">
                  <div className="bg-primary h-full rounded-full" style={{ width: stats.totalMuzakki > 0 ? `${Math.min(100, (stats.countRice / (stats.countRice + stats.countCash)) * 100)}%` : '0%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Uang (Cash)</span>
                  <span className="text-xs font-bold text-emerald-500">Rp {stats.totalCash.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 h-2.5 rounded-full">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: stats.totalMuzakki > 0 ? `${Math.min(100, (stats.countCash / (stats.countRice + stats.countCash)) * 100)}%` : '0%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recent Submissions */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-bold">Recent Submissions</h3>
              <button className="text-xs font-bold text-primary hover:underline" onClick={() => setCurrentView('muzakki')}>View All</button>
            </div>
            <div className="flex-1 p-2 overflow-y-auto max-h-[700px]">
              {stats.recentSubmissions.map((item, idx) => {
                const isCash = (item['Jenis Zakat'] || '').toLowerCase().includes('uang') || (item['Jenis Zakat'] || '').toLowerCase().includes('cash');
                const icon = isCash ? 'payments' : 'rice_bowl';
                const iconColor = isCash ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary';
                
                const amountNum = parseFloat(item.Jumlah) || 0;
                const cleanJumlah = item.Jumlah ? item.Jumlah.toString().replace(/kg/i, '').trim() : '0';
                const formattedAmount = isCash ? `Rp ${amountNum.toLocaleString()}` : `${cleanJumlah} kg`;

                return (
                  <div key={idx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors border-b border-slate-50 dark:border-slate-700 last:border-none">
                    <div className="flex items-start gap-4">
                      <div className={`size-10 rounded-lg ${iconColor} flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined">{icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{item.Nama}</p>
                        <p className="text-xs text-slate-500">{item['Jenis Zakat']}: {formattedAmount}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${getStatusColor(item.Status)}`}>{item.Status}</span>
                          <span className="text-[10px] text-slate-400">{item.Tanggal}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {stats.recentSubmissions.length === 0 && (
                <div className="p-4 text-center text-sm text-slate-500">
                  No recent submissions found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
