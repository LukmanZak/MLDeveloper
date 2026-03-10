import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';

export default function Distribution() {
  const { data } = useData();
  const [filter, setFilter] = useState('all');

  const filteredData = useMemo(() => {
    if (filter === 'all') return data;
    if (filter === 'verified') return data.filter(item => (item.Status || '').toLowerCase().includes('verifi') || (item.Status || '').toLowerCase().includes('terverifikasi'));
    if (filter === 'distributed') return data.filter(item => (item.Status || '').toLowerCase().includes('disalurkan') || (item.Status || '').toLowerCase().includes('distributed') || (item.Status || '').toLowerCase().includes('selesai') || (item.Status || '').toLowerCase().includes('terdistribusi'));
    return data;
  }, [data, filter]);

  const stats = useMemo(() => {
    let verified = 0;
    let distributed = 0;

    data.forEach(item => {
      const status = (item.Status || '').toLowerCase();
      if (status.includes('verifi') || status.includes('terverifikasi')) verified++;
      else if (status.includes('disalurkan') || status.includes('distributed') || status.includes('selesai') || status.includes('terdistribusi')) distributed++;
    });

    return { total: data.length, verified, distributed };
  }, [data]);

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('verifi') || s.includes('terverifikasi')) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Terverifikasi</span>;
    }
    if (s.includes('disalurkan') || s.includes('distributed') || s.includes('selesai') || s.includes('terdistribusi')) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">Terdistribusi</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">{status}</span>;
  };

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Resident Zakat Records</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Detailed tracking for collection period 1445H.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">volunteer_activism</span>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Residents</p>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-emerald-500 bg-emerald-500/10 p-2 rounded-lg">verified</span>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Terverifikasi</p>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.verified}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-indigo-500 bg-indigo-500/10 p-2 rounded-lg">diversity_3</span>
            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Terdistribusi</p>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.distributed}</h3>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap gap-3 items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex gap-2">
            <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === 'all' ? 'bg-primary text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>All Records</button>
            <button onClick={() => setFilter('verified')} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${filter === 'verified' ? 'bg-primary text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>
              <span className="material-symbols-outlined text-sm">verified</span> Terverifikasi
            </button>
            <button onClick={() => setFilter('distributed')} className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${filter === 'distributed' ? 'bg-primary text-white shadow-sm' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'}`}>
              <span className="material-symbols-outlined text-sm">diversity_3</span> Terdistribusi
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                <th className="px-6 py-4">Resident Name</th>
                <th className="px-6 py-4">Zakat Type</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredData.map((item, idx) => {
                const initials = item.Nama ? item.Nama.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
                const isCash = (item['Jenis Zakat'] || '').toLowerCase().includes('uang') || (item['Jenis Zakat'] || '').toLowerCase().includes('cash');
                const icon = isCash ? 'payments' : 'rice_bowl';
                const iconColor = isCash ? 'text-emerald-600 dark:text-emerald-500' : 'text-amber-600 dark:text-amber-500';
                
                const amountNum = parseFloat(item.Jumlah) || 0;
                const cleanJumlah = item.Jumlah ? item.Jumlah.toString().replace(/kg/i, '').trim() : '0';
                const formattedAmount = isCash ? `Rp ${amountNum.toLocaleString()}` : `${cleanJumlah} kg`;

                return (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">{initials}</div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{item.Nama}</p>
                          <p className="text-xs text-slate-500">ID: #{item.ID}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <span className={`material-symbols-outlined ${iconColor} text-lg`}>{icon}</span>
                        {item['Jenis Zakat']}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{formattedAmount}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {getStatusBadge(item.Status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary transition-colors"><span className="material-symbols-outlined">more_horiz</span></button>
                    </td>
                  </tr>
                );
              })}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
