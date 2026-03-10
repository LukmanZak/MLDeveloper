import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './views/Dashboard';
import Muzakki from './views/Muzakki';
import Distribution from './views/Distribution';
import AreaReports from './views/AreaReports';
import { DataProvider } from './context/DataContext';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  return (
    <DataProvider>
      <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark bg-ramadan-pattern text-slate-900 dark:text-slate-100 antialiased font-display">
        <Header currentView={currentView} setCurrentView={setCurrentView} />
        
        {currentView === 'dashboard' && <Dashboard setCurrentView={setCurrentView} />}
        {currentView === 'muzakki' && <Muzakki />}
        {currentView === 'distribution' && <Distribution />}
        {currentView === 'areareports' && <AreaReports />}
        
        <Footer />
      </div>
    </DataProvider>
  );
}
