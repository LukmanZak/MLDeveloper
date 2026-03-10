import React, { useState } from 'react';
import { useData } from '../context/DataContext';

export default function Muzakki() {
  const { sheetUrl, data, loading, error, fetchData, clearData } = useData();
  const [inputUrl, setInputUrl] = useState(sheetUrl);

  const handleLoadData = () => {
    fetchData(inputUrl);
  };

  const handleClear = () => {
    clearData();
    setInputUrl('');
  };

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Data Muzakki</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and sync donor records from Google Spreadsheet.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label htmlFor="sheet-url" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Google Spreadsheet URL {data.length > 0 && <span className="text-primary ml-2">(Locked)</span>}
            </label>
            <input
              id="sheet-url"
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              disabled={data.length > 0}
              placeholder="https://docs.google.com/spreadsheets/d/..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          {data.length > 0 ? (
            <button
              onClick={handleClear}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all h-[42px] whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-sm">lock_open</span>
              Change URL
            </button>
          ) : (
            <button
              onClick={handleLoadData}
              disabled={loading || !inputUrl}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all h-[42px] whitespace-nowrap"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-sm">sync</span>
              ) : (
                <span className="material-symbols-outlined text-sm">cloud_sync</span>
              )}
              {loading ? 'Loading...' : 'Sync Data'}
            </button>
          )}
        </div>
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800/50 flex items-start gap-2">
            <span className="material-symbols-outlined text-sm mt-0.5">error</span>
            <p>{error}</p>
          </div>
        )}
        <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">info</span>
          Ensure your Google Spreadsheet is set to "Anyone with the link can view". Expected columns: ID, Nama, Area, Jenis Zakat, Jumlah, Status, Tanggal.
        </div>
      </div>

      {data.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <h3 className="font-bold text-slate-900 dark:text-white">Synced Records ({data.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                  {columns.map((col, idx) => (
                    <th key={idx} className="px-6 py-4 whitespace-nowrap">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {data.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    {columns.map((col, colIndex) => (
                      <td key={colIndex} className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {row[col]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
