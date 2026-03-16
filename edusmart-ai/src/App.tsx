import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  LayoutDashboard, 
  UserCheck, 
  BrainCircuit, 
  Rocket, 
  ClipboardList, 
  LogOut, 
  Search, 
  Bell, 
  CheckCircle2, 
  Calendar, 
  Star, 
  ArrowRight, 
  User, 
  Download, 
  Share2, 
  Save,
  Eye,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  BarChart3,
  History,
  Link2,
  Lock,
  Unlock,
  ExternalLink,
  Table as TableIcon,
  HelpCircle,
  FileQuestion,
  ScrollText,
  Smile,
  PieChart,
  Upload,
  Plus,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { 
  generateModulAjar, 
  generateProyekP5, 
  generateSoal, 
  generateWorksheet, 
  generateRubrik, 
  generateIceBreaking, 
  generateAnalisisNilai 
} from './services/gemini';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { cn } from './lib/utils';
import { Student } from './types';

// --- Mock Data ---
const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'Aditya Pratama', nis: '1022001', status: 'hadir' },
  { id: '2', name: 'Bella Saphira', nis: '1022002', status: 'hadir' },
  { id: '3', name: 'Citra Kirana', nis: '1022003', status: 'hadir' },
  { id: '4', name: 'Dedi Mulyadi', nis: '1022004', status: 'hadir' },
  { id: '5', name: 'Eka Wijaya', nis: '1022005', status: 'hadir' },
];

// --- Components ---

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
    animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
    exit={{ opacity: 0, scale: 0.9, x: '-50%', y: '-50%' }}
    className={cn(
      "fixed top-1/2 left-1/2 z-[100] px-8 py-4 rounded-3xl shadow-2xl flex flex-col items-center gap-4 border backdrop-blur-xl min-w-[320px] text-center",
      type === 'success' ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-red-500/20 border-red-500/30 text-red-400"
    )}
  >
    <div className={cn("p-3 rounded-2xl", type === 'success' ? "bg-green-500/20" : "bg-red-500/20")}>
      {type === 'success' ? <CheckCircle2 className="w-8 h-8" /> : <Bell className="w-8 h-8" />}
    </div>
    <div className="space-y-1">
      <h4 className="font-black uppercase tracking-tighter text-lg">
        {type === 'success' ? 'Berhasil' : 'Terjadi Kesalahan'}
      </h4>
      <p className="text-sm font-medium opacity-80">{message}</p>
    </div>
    <button 
      onClick={onClose}
      className="mt-2 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
    >
      Tutup
    </button>
  </motion.div>
);

const PreviewModal = ({ 
  isOpen, 
  onClose, 
  content, 
  title,
  onSaveCloud,
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  content: string; 
  title: string;
  onSaveCloud?: () => void;
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!previewRef.current || !content) return;
    setPdfLoading(true);
    
    try {
      // Create a hidden print container for better PDF formatting
      const printContainer = document.createElement('div');
      printContainer.style.position = 'absolute';
      printContainer.style.left = '-9999px';
      printContainer.style.top = '0';
      printContainer.style.width = '210mm'; // A4 width
      printContainer.style.backgroundColor = 'white';
      printContainer.style.color = 'black';
      printContainer.style.padding = '20mm';
      printContainer.className = 'pdf-print-container';
      
      // Add printable styles
      const style = document.createElement('style');
      style.textContent = `
        .pdf-print-container { font-family: "Inter", sans-serif; line-height: 1.6; color: #1a1a1a; }
        .pdf-print-container h1 { font-size: 24pt; margin-bottom: 20pt; color: #000; border-bottom: 2pt solid #eee; padding-bottom: 10pt; }
        .pdf-print-container h2 { font-size: 18pt; margin-top: 25pt; margin-bottom: 15pt; color: #333; }
        .pdf-print-container h3 { font-size: 14pt; margin-top: 20pt; margin-bottom: 10pt; color: #444; }
        .pdf-print-container p { margin-bottom: 12pt; font-size: 11pt; }
        .pdf-print-container ul, .pdf-print-container ol { margin-bottom: 15pt; padding-left: 20pt; }
        .pdf-print-container li { margin-bottom: 5pt; font-size: 11pt; }
        .pdf-print-container table { width: 100%; border-collapse: collapse; margin-bottom: 20pt; }
        .pdf-print-container th, .pdf-print-container td { border: 1pt solid #ddd; padding: 8pt; text-align: left; font-size: 10pt; }
        .pdf-print-container th { background-color: #f8f9fa; font-weight: bold; }
        .pdf-print-container blockquote { border-left: 4pt solid #eee; padding-left: 15pt; font-style: italic; color: #666; margin: 20pt 0; }
        .pdf-print-container code { background: #f4f4f4; padding: 2pt 4pt; border-radius: 3pt; font-family: monospace; font-size: 9pt; }
        .pdf-print-container pre { background: #f4f4f4; padding: 15pt; border-radius: 5pt; overflow-x: auto; margin-bottom: 15pt; }
      `;
      document.head.appendChild(style);

      // Render markdown to the print container
      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = previewRef.current.innerHTML;
      printContainer.appendChild(contentDiv);
      document.body.appendChild(printContainer);

      const canvas = await html2canvas(printContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`${title.replace(/\s+/g, '_').toLowerCase()}.pdf`);
      
      // Cleanup
      document.body.removeChild(printContainer);
      document.head.removeChild(style);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setPdfLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-slate-950/90 backdrop-blur-xl"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-[#0d1324] w-full max-w-5xl h-full max-h-[90vh] rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden"
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-xs text-slate-500">Hasil AI EduSmart</p>
          </div>
          <div className="flex items-center gap-3">
            {onSaveCloud && (
              <button 
                onClick={onSaveCloud}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                <Save className="w-4 h-4" /> Simpan
              </button>
            )}
            <button 
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all border border-slate-700"
            >
              {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              PDF
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
            >
              <Plus className="w-6 h-6 rotate-45" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar bg-[#0d1324]">
          <div ref={previewRef} className="prose prose-invert prose-blue max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm, remarkMath]} 
              rehypePlugins={[rehypeKatex]}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/30 flex md:hidden gap-3">
          {onSaveCloud && (
            <button 
              onClick={onSaveCloud}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold"
            >
              <Save className="w-4 h-4" /> Simpan
            </button>
          )}
          <button 
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-xl text-xs font-bold border border-slate-700"
          >
            {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            PDF
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const Sidebar = ({ geminiKey, setGeminiKey }: { geminiKey: string, setGeminiKey: (k: string) => void }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAiOpen, setIsAiOpen] = useState(true);
  const [showKeyInput, setShowKeyInput] = useState(false);

  const mainItems = [
    { path: '/', icon: LayoutDashboard, label: 'Beranda' },
    { path: '/presensi', icon: UserCheck, label: 'Presensi' },
    { path: '/analisis-nilai', icon: PieChart, label: 'Analisis Nilai' },
    { path: '/laporan', icon: BarChart3, label: 'Laporan' },
  ];

  const aiItems = [
    { path: '/modul-ajar', icon: BrainCircuit, label: 'Modul Ajar' },
    { path: '/proyek-p5', icon: Rocket, label: 'Proyek P5' },
    { path: '/buat-soal', icon: FileQuestion, label: 'Buat Soal' },
    { path: '/worksheet', icon: ScrollText, label: 'Worksheet' },
    { path: '/rubrik', icon: ClipboardList, label: 'Rubrik Penilaian' },
    { path: '/ice-breaking', icon: Smile, label: 'Ice Breaking' },
  ];

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col fixed h-full z-20 overflow-y-auto custom-scrollbar">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-blue-600 rounded-lg p-2 flex items-center justify-center">
          <BrainCircuit className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight">EduSmart</h1>
          <p className="text-slate-500 text-xs">Pusat Guru Indonesia</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1 mt-4">
        {mainItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm",
              location.pathname === item.path 
                ? "bg-blue-600/20 text-blue-500" 
                : "text-slate-400 hover:bg-slate-800"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}

        <div className="pt-4 pb-2">
          <button 
            onClick={() => setIsAiOpen(!isAiOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors"
          >
            <span>Asisten AI</span>
            <ChevronRight className={cn("w-3 h-3 transition-transform", isAiOpen && "rotate-90")} />
          </button>
          
          <AnimatePresence>
            {isAiOpen && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden space-y-1 mt-1"
              >
                {aiItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors font-medium text-sm ml-2",
                      location.pathname === item.path 
                        ? "bg-indigo-600/20 text-indigo-400" 
                        : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800 mt-auto space-y-4">
        <div className="px-3 py-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Gemini API Key</label>
          <div className="relative">
            <input 
              type={showKeyInput ? "text" : "password"}
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="Masukkan API Key..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500 pr-8"
            />
            <button 
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="absolute right-2 top-2 text-slate-500 hover:text-slate-300"
            >
              {showKeyInput ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            </button>
          </div>
          <p className="text-[9px] text-slate-600 mt-1 italic">Key disimpan di browser Anda.</p>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
            SA
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">Siti Aminah</p>
            <p className="text-xs text-slate-500 truncate">Guru Matematika</p>
          </div>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('isLoggedIn');
            navigate('/login');
          }}
          className="mt-4 w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors text-sm"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
};

const Header = ({ title, subtitle, hideControls = false }: { title: string; subtitle: string; hideControls?: boolean }) => (
  <header className="flex justify-between items-center mb-8">
    <div>
      <h2 className="text-2xl font-bold text-white">{title}</h2>
      <p className="text-slate-500">{subtitle}</p>
    </div>
    {!hideControls && (
      <div className="flex items-center gap-4">
        <div className="relative">
          <input 
            className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm w-64 text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none placeholder-slate-500" 
            placeholder="Cari data..." 
            type="text"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
        </div>
        <button className="w-10 h-10 flex items-center justify-center border border-slate-700 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all">
          <Bell className="w-5 h-5" />
        </button>
      </div>
    )}
  </header>
);

const SpreadsheetInput = ({ 
  url, 
  setUrl, 
  isLocked, 
  setIsLocked 
}: { 
  url: string; 
  setUrl: (v: string) => void; 
  isLocked: boolean; 
  setIsLocked: (v: boolean) => void;
}) => {
  const [tokens, setTokens] = useState<any>(null);

  useEffect(() => {
    const savedTokens = localStorage.getItem('google_tokens');
    if (savedTokens) setTokens(JSON.parse(savedTokens));

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        localStorage.setItem('google_tokens', JSON.stringify(event.data.tokens));
        setTokens(event.data.tokens);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnect = async () => {
    try {
      const res = await fetch('/api/auth/url');
      const { url } = await res.json();
      window.open(url, 'google_oauth', 'width=600,height=700');
    } catch (err) {
      console.error(err);
    }
  };

  const extractId = (url: string) => {
    const sheetMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const docMatch = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
    return sheetMatch ? sheetMatch[1] : (docMatch ? docMatch[1] : null);
  };

  const isDoc = url.includes('/document/d/');

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 mb-8 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn("p-2 rounded-lg", isDoc ? "bg-blue-500/10" : "bg-green-500/10")}>
            {isDoc ? <FileText className="w-5 h-5 text-blue-500" /> : <TableIcon className="w-5 h-5 text-green-500" />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Integrasi Google {isDoc ? 'Docs' : 'Sheets'}</h4>
            <p className="text-xs text-slate-500">Auto-fill data ke {isDoc ? 'dokumen' : 'spreadsheet'} Anda.</p>
          </div>
        </div>
        {!tokens ? (
          <button 
            onClick={handleConnect}
            className="text-xs font-bold text-blue-500 hover:underline flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" /> Hubungkan Google
          </button>
        ) : (
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
              Terhubung
            </span>
            <button 
              onClick={handleConnect}
              className="text-[9px] text-slate-500 hover:text-blue-400 transition-colors"
            >
              Ganti Akun / Refresh Izin
            </button>
          </div>
        )}
      </div>

      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <input 
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isLocked}
            placeholder="Masukkan URL Google Spreadsheet..."
            className={cn(
              "w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all pl-10",
              isLocked ? "opacity-50 cursor-not-allowed border-blue-600/50" : "focus:ring-2 focus:ring-blue-600"
            )}
          />
          <Link2 className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
        </div>
        <button 
          onClick={() => setIsLocked(!isLocked)}
          disabled={!url || !extractId(url)}
          className={cn(
            "px-4 rounded-xl flex items-center justify-center transition-all disabled:opacity-30",
            isLocked ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
          )}
        >
          {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </button>
      </div>
      {url && !extractId(url) && (
        <p className="text-[10px] text-red-400 mt-2 ml-1">URL Spreadsheet tidak valid</p>
      )}
    </div>
  );
};

// --- Pages ---

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('isLoggedIn', 'true');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-600 rounded-2xl p-4 mb-4">
            <BrainCircuit className="text-white w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-white">EduSmart AI</h1>
          <p className="text-slate-500 text-center mt-2">Masuk untuk mengelola pembelajaran cerdas Anda</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email / Username</label>
            <input 
              type="text" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="nama@sekolah.sch.id"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Kata Sandi</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-600 outline-none"
              placeholder="••••••••"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20"
          >
            Masuk Sekarang
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-slate-500 text-sm">Masuk dengan akun lain</p>
          <div className="mt-4 flex justify-center gap-4">
             <img src="https://img.icons8.com/color/48/000000/google-logo.png" className="w-8 h-8 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" alt="Google" />
             <img src="https://img.icons8.com/color/48/000000/microsoft-excel-2019.png" className="w-8 h-8 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" alt="Excel" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <Header title="Selamat Datang, Siti!" subtitle="Senin, 20 Mei 2024 • Hari yang cerah untuk mengajar." />
      
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Siswa Hadir', value: '95%', trend: '+2.4%', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Siswa Izin/Sakit', value: '4', trend: 'Tetap', icon: Calendar, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Rata-rata Nilai', value: '82.5', trend: '+5.1', icon: Star, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-500 text-sm font-medium">{stat.label}</span>
              <div className={cn("p-2 rounded-lg", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-white">{stat.value}</span>
              <span className={cn("text-sm font-medium mb-1", stat.trend.includes('+') ? 'text-green-500' : 'text-slate-400')}>
                {stat.trend}
              </span>
            </div>
          </motion.div>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h3 className="text-lg font-bold text-white mb-4">Akses Cepat AI</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link to="/modul-ajar" className="bg-blue-600 p-6 rounded-2xl text-white flex flex-col justify-between group cursor-pointer hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">
                <div>
                  <BrainCircuit className="w-10 h-10 mb-4" />
                  <h4 className="text-lg font-bold">Modul Ajar AI</h4>
                  <p className="text-blue-100 text-sm mt-1">Buat RPP dan modul ajar otomatis sesuai kurikulum merdeka.</p>
                </div>
                <div className="mt-6 flex items-center text-sm font-semibold">
                  Mulai <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              <Link to="/proyek-p5" className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between group cursor-pointer hover:border-blue-600 transition-all shadow-sm">
                <div>
                  <Rocket className="w-10 h-10 text-blue-500 mb-4" />
                  <h4 className="text-lg font-bold text-white">Proyek P5 AI</h4>
                  <p className="text-slate-500 text-sm mt-1">Susun rencana Proyek Penguatan Profil Pelajar Pancasila.</p>
                </div>
                <div className="mt-6 flex items-center text-sm font-semibold text-blue-500">
                  Mulai <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              <Link to="/buat-soal" className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between group cursor-pointer hover:border-blue-600 transition-all shadow-sm">
                <div>
                  <FileQuestion className="w-10 h-10 text-indigo-500 mb-4" />
                  <h4 className="text-lg font-bold text-white">Buat Soal AI</h4>
                  <p className="text-slate-500 text-sm mt-1">Generate soal latihan, kunci jawaban, dan pembahasan.</p>
                </div>
                <div className="mt-6 flex items-center text-sm font-semibold text-indigo-500">
                  Mulai <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              <Link to="/worksheet" className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between group cursor-pointer hover:border-blue-600 transition-all shadow-sm">
                <div>
                  <ScrollText className="w-10 h-10 text-emerald-500 mb-4" />
                  <h4 className="text-lg font-bold text-white">Worksheet AI</h4>
                  <p className="text-slate-500 text-sm mt-1">Buat lembar kerja siswa interaktif dan kontekstual.</p>
                </div>
                <div className="mt-6 flex items-center text-sm font-semibold text-emerald-500">
                  Mulai <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              <Link to="/rubrik" className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between group cursor-pointer hover:border-blue-600 transition-all shadow-sm">
                <div>
                  <ClipboardList className="w-10 h-10 text-orange-500 mb-4" />
                  <h4 className="text-lg font-bold text-white">Rubrik AI</h4>
                  <p className="text-slate-500 text-sm mt-1">Susun rubrik penilaian tugas yang objektif dan terukur.</p>
                </div>
                <div className="mt-6 flex items-center text-sm font-semibold text-orange-500">
                  Mulai <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              <Link to="/ice-breaking" className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between group cursor-pointer hover:border-blue-600 transition-all shadow-sm">
                <div>
                  <Smile className="w-10 h-10 text-pink-500 mb-4" />
                  <h4 className="text-lg font-bold text-white">Ice Breaking</h4>
                  <p className="text-slate-500 text-sm mt-1">Cari ide aktivitas seru untuk menghidupkan suasana kelas.</p>
                </div>
                <div className="mt-6 flex items-center text-sm font-semibold text-pink-500">
                  Mulai <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-4">Jadwal Hari Ini</h3>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-800/50 border-b border-slate-800">
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Waktu</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Kelas</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Mata Pelajaran</th>
                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {[
                    { time: '07:30 - 09:00', class: 'Kelas 10-A', subject: 'Matematika Dasar', status: 'Selesai', color: 'bg-green-500/10 text-green-500' },
                    { time: '09:15 - 10:45', class: 'Kelas 11-C', subject: 'Kalkulus I', status: 'Sedang Berlangsung', color: 'bg-blue-500/10 text-blue-500 animate-pulse' },
                    { time: '11:00 - 12:30', class: 'Kelas 10-B', subject: 'Aljabar', status: 'Mendatang', color: 'bg-slate-800 text-slate-400' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 text-sm text-slate-400">{row.time}</td>
                      <td className="px-6 py-4 text-sm font-medium text-white">{row.class}</td>
                      <td className="px-6 py-4 text-sm text-slate-400">{row.subject}</td>
                      <td className="px-6 py-4">
                        <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider", row.color)}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-lg font-bold text-white mb-4">Aktivitas Terakhir</h3>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-6">
              {[
                { label: 'Modul Ajar "Trigonometri" berhasil dibuat', time: '2 jam yang lalu', color: 'bg-blue-500' },
                { label: 'Presensi Kelas 10-A disimpan', time: '3 jam yang lalu', color: 'bg-green-500' },
                { label: 'Budi Santoso izin sakit (Kelas 11-C)', time: '5 jam yang lalu', color: 'bg-yellow-500' },
              ].map((act, i) => (
                <div key={i} className="flex gap-4">
                  <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", act.color)}></div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{act.label}</p>
                    <p className="text-xs text-slate-500">{act.time}</p>
                  </div>
                </div>
              ))}
              <button className="w-full text-center text-blue-500 text-sm font-semibold pt-2 hover:underline">Lihat Semua Aktivitas</button>
            </div>
          </section>

          <section>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white overflow-hidden relative shadow-lg border border-slate-700">
              <div className="relative z-10">
                <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-1">Proyek P5 Aktif</p>
                <h4 className="text-lg font-bold text-white mb-4">Gaya Hidup Berkelanjutan: Pengolahan Sampah Digital</h4>
                <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                  <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>75% Selesai</span>
                  <span>Tenggat: 15 Jun</span>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-blue-600/10 rounded-full blur-2xl"></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const PresensiPage = () => {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  
  const updateStatus = (id: string, status: Student['status']) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  return (
    <div className="space-y-8">
      <Header title="Rekap Absensi Kelas" subtitle="Kelola kehadiran siswa harian dengan mudah." />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Pilih Kelas</label>
            <select className="w-full rounded-xl border-slate-700 bg-slate-800 text-white text-sm focus:ring-blue-600 outline-none p-2">
              <option>XI MIPA 1</option>
              <option>XI MIPA 2</option>
            </select>
          </div>
          <div className="mt-4">
            <p className="text-sm text-slate-500">Total Siswa: <span className="font-bold text-white">32 Orang</span></p>
          </div>
        </div>

        {[
          { label: 'Hadir', value: '94%', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Izin/Sakit', value: '2 Siswa', icon: Calendar, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Alpa', value: '0 Siswa', icon: ClipboardList, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm flex items-center gap-4">
            <div className={cn("size-12 rounded-full flex items-center justify-center", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-lg text-white">Daftar Kehadiran Siswa</h3>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2">
            <Save className="w-4 h-4" /> Simpan Absensi
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-500 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">No</th>
                <th className="px-6 py-4">Nama Siswa</th>
                <th className="px-6 py-4">NIS</th>
                <th className="px-6 py-4 text-center">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {students.map((student, i) => (
                <tr key={student.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-slate-400">{i + 1}</td>
                  <td className="px-6 py-4 font-medium text-white">{student.name}</td>
                  <td className="px-6 py-4 text-slate-500">{student.nis}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      {[
                        { id: 'hadir', label: 'Hadir', active: 'bg-green-600 text-white', inactive: 'hover:bg-green-600/10 text-green-500 border-green-500/20' },
                        { id: 'izin', label: 'Izin', active: 'bg-yellow-600 text-white', inactive: 'hover:bg-yellow-600/10 text-yellow-500 border-yellow-500/20' },
                        { id: 'sakit', label: 'Sakit', active: 'bg-orange-600 text-white', inactive: 'hover:bg-orange-600/10 text-orange-500 border-orange-500/20' },
                        { id: 'alpa', label: 'Alpa', active: 'bg-red-600 text-white', inactive: 'hover:bg-red-600/10 text-red-500 border-red-500/20' },
                      ].map((btn) => (
                        <button
                          key={btn.id}
                          onClick={() => updateStatus(student.id, btn.id as Student['status'])}
                          className={cn(
                            "px-4 py-1.5 rounded-full border text-xs font-bold transition-all",
                            student.status === btn.id ? btn.active : btn.inactive
                          )}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 bg-slate-800/50 flex items-center justify-between text-sm text-slate-500">
          <p>Menampilkan {students.length} dari 32 siswa</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800"><ChevronLeft className="w-4 h-4" /></button>
            <button className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold">1</button>
            <button className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800">2</button>
            <button className="px-3 py-1 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LaporanPage = () => {
  const [savedModuls, setSavedModuls] = useState<any[]>([]);
  const [savedProyeks, setSavedProyeks] = useState<any[]>([]);

  useEffect(() => {
    const moduls = JSON.parse(localStorage.getItem('saved_moduls') || '[]');
    const proyeks = JSON.parse(localStorage.getItem('saved_proyeks') || '[]');
    setSavedModuls(moduls);
    setSavedProyeks(proyeks);
  }, []);

  return (
    <div className="space-y-8">
      <Header title="Laporan & Riwayat" subtitle="Pantau progres siswa dan akses kembali dokumen AI Anda." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h3 className="text-lg font-bold text-white mb-4">Nilai Akademik Siswa (XI MIPA 1)</h3>
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead className="bg-slate-800/50 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Nama Siswa</th>
                    <th className="px-6 py-4">Tugas 1</th>
                    <th className="px-6 py-4">Tugas 2</th>
                    <th className="px-6 py-4">UTS</th>
                    <th className="px-6 py-4">Rata-rata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-sm">
                  {[
                    { name: 'Aditya Pratama', t1: 85, t2: 90, uts: 88, avg: 87.6 },
                    { name: 'Bella Saphira', t1: 78, t2: 82, uts: 80, avg: 80.0 },
                    { name: 'Citra Kirana', t1: 92, t2: 88, uts: 95, avg: 91.6 },
                    { name: 'Dedi Mulyadi', t1: 70, t2: 75, uts: 72, avg: 72.3 },
                    { name: 'Eka Wijaya', t1: 88, t2: 85, uts: 84, avg: 85.6 },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-white">{row.name}</td>
                      <td className="px-6 py-4 text-slate-400">{row.t1}</td>
                      <td className="px-6 py-4 text-slate-400">{row.t2}</td>
                      <td className="px-6 py-4 text-slate-400">{row.uts}</td>
                      <td className="px-6 py-4 font-bold text-blue-500">{row.avg}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-4">Riwayat Modul Ajar AI</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedModuls.length > 0 ? savedModuls.map((m, i) => (
                <div key={i} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-blue-600 transition-all group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="p-2 bg-blue-600/10 rounded-lg">
                      <BrainCircuit className="w-5 h-5 text-blue-500" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{m.date}</span>
                  </div>
                  <h4 className="font-bold text-white mb-1">{m.topic}</h4>
                  <p className="text-xs text-slate-500 mb-4">{m.subject} • {m.phase}</p>
                  <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors">
                    Lihat Detail
                  </button>
                </div>
              )) : (
                <div className="col-span-2 py-12 bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500">
                  <History className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">Belum ada modul yang disimpan</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-lg font-bold text-white mb-4">Riwayat Proyek P5</h3>
            <div className="space-y-4">
              {savedProyeks.length > 0 ? savedProyeks.map((p, i) => (
                <div key={i} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-blue-600 transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-600/10 rounded-lg">
                      <Rocket className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{p.theme}</h4>
                      <p className="text-[10px] text-slate-500">{p.date}</p>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition-colors">
                    Buka Proyek
                  </button>
                </div>
              )) : (
                <div className="py-12 bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-slate-500">
                  <History className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">Belum ada proyek</p>
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-600/20">
              <h4 className="font-bold mb-2">Ekspor Laporan</h4>
              <p className="text-xs text-blue-100 mb-4">Unduh semua data nilai dan riwayat modul dalam format Excel atau PDF.</p>
              <div className="space-y-2">
                <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
                  <Download className="w-4 h-4" /> Unduh Excel (.xlsx)
                </button>
                <button className="w-full py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all">
                  <Download className="w-4 h-4" /> Unduh PDF (.pdf)
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const ModulAjarPage = ({ geminiKey }: { geminiKey: string }) => {
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [result, setResult] = useState<string | null>(() => localStorage.getItem('modul_last_result'));
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  // Persisted state
  const [sheetUrl, setSheetUrl] = useState(() => localStorage.getItem('modul_sheet_url') || '');
  const [isLocked, setIsLocked] = useState(() => localStorage.getItem('modul_is_locked') === 'true');

  useEffect(() => {
    localStorage.setItem('modul_sheet_url', sheetUrl);
  }, [sheetUrl]);

  useEffect(() => {
    localStorage.setItem('modul_is_locked', isLocked.toString());
  }, [isLocked]);

  useEffect(() => {
    if (result) {
      localStorage.setItem('modul_last_result', result);
    }
  }, [result]);

  const previewRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    subject: '',
    grade: '7',
    topic: '',
    goals: '',
    meetings: 2,
    duration: 80,
    learningModel: 'Problem Based Learning',
    depth: 3,
    includeAssessment: true,
    includeRemedial: true,
    methods: [] as string[],
    location: ''
  });

  const handleGenerate = async () => {
    if (!form.subject || !form.topic) return;
    setLoading(true);
    setSaved(false);
    setError(null);
    setResult(""); // Clear previous result
    try {
      await generateModulAjar(form, (content) => {
        setResult(content);
      }, geminiKey);
      setIsPreviewOpen(true);
    } catch (err: any) {
      console.error(err);
      setError(`Gagal generate: ${err.message || 'Terjadi kesalahan'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setError(null);
    setSaved(false);
    
    // Save to Local Storage
    const existing = JSON.parse(localStorage.getItem('saved_moduls') || '[]');
    const newEntry = {
      ...form,
      content: result,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      id: Date.now()
    };
    localStorage.setItem('saved_moduls', JSON.stringify([newEntry, ...existing]));

    // Sync to Spreadsheet/Doc if locked
    let syncMessage = "Berhasil Disimpan";
    if (isLocked && sheetUrl) {
      const tokens = JSON.parse(localStorage.getItem('google_tokens') || 'null');
      if (!tokens) {
        setError("Silakan hubungkan akun Google terlebih dahulu.");
        return;
      }

      const isSpreadsheet = sheetUrl.includes('/spreadsheets/d/');
      const isDoc = sheetUrl.includes('/document/d/');
      
      try {
        if (isSpreadsheet) {
          const spreadsheetId = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1];
          if (!spreadsheetId) throw new Error("ID Spreadsheet tidak valid.");

          const res = await fetch('/api/sheets/append', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              spreadsheetId,
              tokens,
              sheetName: 'Modul Ajar',
              values: [
                new Date().toLocaleString('id-ID'),
                form.subject,
                form.grade,
                form.topic,
                form.goals,
                form.methods.join(', '),
                result.substring(0, 1000) + (result.length > 1000 ? '...' : '')
              ]
            })
          });
          
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Gagal menyimpan ke Spreadsheet.");
          }
          syncMessage = "Berhasil Disimpan & Sinkron ke Sheets";
        } else if (isDoc) {
          const documentId = sheetUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)?.[1];
          if (!documentId) throw new Error("ID Dokumen tidak valid.");

          const res = await fetch('/api/docs/append', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              documentId,
              tokens,
              title: `Modul Ajar: ${form.topic}`,
              content: result
            })
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Gagal menyimpan ke Google Docs.");
          }
          syncMessage = "Berhasil Disimpan & Sinkron ke Docs";
        }
      } catch (err: any) {
        console.error('Sync failed:', err);
        setError(`Gagal sinkronisasi: ${err.message}`);
        return;
      }
    }

    setSaved(true);
    // Use a custom message if synced
    (window as any)._lastToastMessage = syncMessage;
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current || !result) return;
    setPdfLoading(true);
    setError(null);
    
    try {
      const element = previewRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0d1324',
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          // Remove all style tags that might contain oklch/oklab or replace them
          const styleTags = clonedDoc.querySelectorAll('style');
          styleTags.forEach(tag => {
            if (tag.textContent?.includes('oklch') || tag.textContent?.includes('oklab')) {
              tag.textContent = tag.textContent
                .replace(/oklch\([^)]+\)/g, '#cbd5e1')
                .replace(/oklab\([^)]+\)/g, '#cbd5e1');
            }
          });

          const clonedElement = clonedDoc.querySelector('.prose') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.color = '#cbd5e1';
            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach((el: any) => {
              if (el instanceof HTMLElement) {
                const style = el.getAttribute('style') || '';
                if (style.includes('oklch') || style.includes('oklab')) {
                  el.style.color = '#cbd5e1';
                  el.style.backgroundColor = 'transparent';
                  el.style.borderColor = '#334155';
                }
              }
            });
            const headings = clonedElement.querySelectorAll('h1, h2, h3, h4, h5, h6, strong');
            headings.forEach((h: any) => {
              if (h instanceof HTMLElement) h.style.color = '#ffffff';
            });
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const imgWidth = pdfWidth;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(`Modul_Ajar_${form.topic.replace(/\s+/g, '_')}.pdf`);
    } catch (err: any) {
      console.error('PDF generation failed:', err);
      setError(`Gagal membuat PDF: ${err.message}`);
    } finally {
      setPdfLoading(false);
    }
  };

  const toggleMethod = (method: string) => {
    setForm(prev => ({
      ...prev,
      methods: prev.methods.includes(method) 
        ? prev.methods.filter(m => m !== method)
        : [...prev.methods, method]
    }));
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#0a0f1d] p-8">
      <div className="max-w-4xl mx-auto">
        <Header 
          title="AI Modul Ajar" 
          subtitle="Transformasi ide pembelajaran menjadi modul terstruktur dalam hitungan detik." 
          hideControls={true}
        />
        
        <SpreadsheetInput 
          url={sheetUrl} 
          setUrl={setSheetUrl} 
          isLocked={isLocked} 
          setIsLocked={setIsLocked} 
        />

        <div className="max-w-3xl space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 group">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Mata Pelajaran</label>
              <select 
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 text-white h-14 px-5 text-sm focus:ring-2 focus:ring-blue-600 outline-none appearance-none cursor-pointer"
                value={form.subject}
                onChange={e => setForm({...form, subject: e.target.value})}
              >
                <option value="">Pilih Mata Pelajaran</option>
                {['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS', 'PAI', 'PPKn', 'Seni Budaya', 'PJOK', 'Informatika'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Kelas</label>
              <select 
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 text-white h-14 px-5 text-sm focus:ring-2 focus:ring-blue-600 outline-none appearance-none cursor-pointer"
                value={form.grade}
                onChange={e => setForm({...form, grade: e.target.value})}
              >
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(g => (
                  <option key={g} value={g}>Kelas {g}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Jumlah Pertemuan</label>
              <input 
                type="number"
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 text-white h-14 px-5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" 
                value={form.meetings}
                onChange={e => setForm({...form, meetings: parseInt(e.target.value) || 1})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Durasi (Menit)</label>
              <input 
                type="number"
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 text-white h-14 px-5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" 
                value={form.duration}
                onChange={e => setForm({...form, duration: parseInt(e.target.value) || 40})}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Model Pembelajaran</label>
            <div className="grid grid-cols-2 gap-3">
              {['Problem Based Learning', 'Project Based Learning', 'Discovery Learning', 'Inquiry Learning'].map(m => (
                <label key={m} className={cn(
                  "flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all",
                  form.learningModel === m ? "bg-blue-600/20 border-blue-500 text-white" : "bg-slate-900/50 border-slate-800 text-slate-400"
                )}>
                  <input 
                    type="radio" 
                    name="learningModel"
                    checked={form.learningModel === m}
                    onChange={() => setForm({...form, learningModel: m})}
                    className="hidden"
                  />
                  <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", form.learningModel === m ? "border-blue-500" : "border-slate-700")}>
                    {form.learningModel === m && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </div>
                  <span className="text-xs font-bold">{m}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Tingkat Kedalaman Materi</label>
              <span className="text-xs font-bold text-blue-500">{form.depth}/5</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="5" 
              step="1"
              value={form.depth}
              onChange={e => setForm({...form, depth: parseInt(e.target.value)})}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={cn(
                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                form.includeAssessment ? "bg-blue-600 border-blue-600" : "border-slate-700 group-hover:border-slate-600"
              )}>
                <input 
                  type="checkbox" 
                  checked={form.includeAssessment}
                  onChange={e => setForm({...form, includeAssessment: e.target.checked})}
                  className="hidden"
                />
                {form.includeAssessment && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
              <span className="text-xs font-bold text-slate-300">Sertakan Asesmen</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={cn(
                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                form.includeRemedial ? "bg-blue-600 border-blue-600" : "border-slate-700 group-hover:border-slate-600"
              )}>
                <input 
                  type="checkbox" 
                  checked={form.includeRemedial}
                  onChange={e => setForm({...form, includeRemedial: e.target.checked})}
                  className="hidden"
                />
                {form.includeRemedial && <CheckCircle2 className="w-4 h-4 text-white" />}
              </div>
              <span className="text-xs font-bold text-slate-300">Sertakan Pengayaan & Remedial</span>
            </label>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Topik Utama</label>
            <input 
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 text-white h-14 px-5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" 
              placeholder="Misal: Eksplorasi Luar Angkasa atau Sistem Ekskresi" 
              value={form.topic}
              onChange={e => setForm({...form, topic: e.target.value})}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Tujuan Pembelajaran</label>
            <textarea 
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 text-white p-5 text-sm focus:ring-2 focus:ring-blue-600 outline-none min-h-[120px] resize-none" 
              placeholder="Apa kompetensi yang ingin dicapai siswa?" 
              value={form.goals}
              onChange={e => setForm({...form, goals: e.target.value})}
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Lokasi (Kota/Kabupaten)</label>
            <input 
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 text-white h-14 px-5 text-sm focus:ring-2 focus:ring-blue-600 outline-none transition-all" 
              placeholder="Contoh: Jakarta Selatan, Surabaya, dll." 
              value={form.location}
              onChange={e => setForm({...form, location: e.target.value})}
            />
            <p className="text-[10px] text-slate-500 mt-1 italic">AI akan menyesuaikan konten dengan lingkungan lokal.</p>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Metodologi Pilihan</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['Diskusi Aktif', 'Eksperimen', 'Project Based', 'Flipped Class', 'Gamifikasi'].map(m => (
                <button 
                  key={m} 
                  onClick={() => toggleMethod(m)}
                  className={cn(
                    "flex items-center justify-center gap-2 p-4 rounded-2xl border transition-all text-xs font-bold",
                    form.methods.includes(m) 
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20" 
                      : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !form.subject || !form.topic}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <BrainCircuit className="w-6 h-6" />}
            Generate Modul Sekarang
          </button>

          {result && (
            <button 
              onClick={() => setIsPreviewOpen(true)}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all border border-slate-700 shadow-lg"
            >
              <Eye className="w-5 h-5" /> Preview Hasil Modul
            </button>
          )}
        </div>
      </div>

      <PreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        content={result}
        title={`Modul Ajar: ${form.topic}`}
        onSaveCloud={handleSave}
      />
      
      <AnimatePresence>
        {saved && (
          <Toast 
            message={(window as any)._lastToastMessage || "Berhasil Disimpan"} 
            type="success" 
            onClose={() => setSaved(false)} 
          />
        )}
        {error && (
          <Toast 
            message={error} 
            type="error" 
            onClose={() => setError(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// --- AI Pembuat Soal Page ---
const SoalGeneratorPage = ({ geminiKey }: { geminiKey: string }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(() => localStorage.getItem('soal_last_result') || '');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) localStorage.setItem('soal_last_result', result);
  }, [result]);
  const [formData, setFormData] = useState({
    subject: 'Matematika',
    grade: '7',
    topic: '',
    count: 5,
    types: ['Pilihan Ganda'],
    difficulty: 3,
    location: '',
    isDifferentiated: false
  });

  const subjects = ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS', 'PAI', 'PPKn', 'Seni Budaya', 'PJOK'];
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const questionTypes = ['Pilihan Ganda', 'Isian Singkat', 'Essay', 'Benar/Salah'];

  const handleGenerate = async () => {
    if (!formData.topic) return;
    setLoading(true);
    setResult('');
    try {
      await generateSoal(formData, (chunk) => {
        setResult(chunk);
      }, geminiKey);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      const response = await fetch('/api/docs/append', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Soal ${formData.subject} - ${formData.topic}`,
          content: result
        })
      });
      if (response.ok) alert('Berhasil disimpan ke Google Docs!');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    setPdfLoading(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(previewRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Soal_${formData.subject}_${formData.topic.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error(error);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#0a0f1d] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-indigo-600/20 rounded-2xl">
            <FileQuestion className="text-indigo-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Buat Soal AI</h2>
            <p className="text-xs text-slate-500">Generate soal latihan otomatis.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mata Pelajaran</label>
            <select 
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kelas</label>
            <select 
              value={formData.grade}
              onChange={(e) => setFormData({...formData, grade: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            >
              {grades.map(g => <option key={g} value={g}>Kelas {g}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Materi / Topik</label>
            <input 
              type="text"
              placeholder="Contoh: Aljabar Linear"
              value={formData.topic}
              onChange={(e) => setFormData({...formData, topic: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jumlah Soal ({formData.count})</label>
            <input 
              type="range"
              min="1"
              max="20"
              value={formData.count}
              onChange={(e) => setFormData({...formData, count: parseInt(e.target.value)})}
              className="w-full accent-indigo-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jenis Soal</label>
            <div className="grid grid-cols-2 gap-2">
              {questionTypes.map(type => (
                <label key={type} className="flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 transition-all">
                  <input 
                    type="checkbox"
                    checked={formData.types.includes(type)}
                    onChange={(e) => {
                      const newTypes = e.target.checked 
                        ? [...formData.types, type]
                        : formData.types.filter(t => t !== type);
                      setFormData({...formData, types: newTypes});
                    }}
                    className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                  />
                  <span className="text-xs text-slate-300">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tingkat Kesulitan</label>
              <span className="text-xs font-bold text-indigo-500">{formData.difficulty}/5</span>
            </div>
            <input 
              type="range"
              min="1"
              max="5"
              value={formData.difficulty}
              onChange={(e) => setFormData({...formData, difficulty: parseInt(e.target.value)})}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
              <span>Mudah</span>
              <span>Sedang</span>
              <span>Sulit</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lokasi (Kota/Kabupaten)</label>
            <input 
              type="text"
              placeholder="Contoh: Jakarta Selatan"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <input 
              type="checkbox" 
              id="diff-soal"
              checked={formData.isDifferentiated}
              onChange={(e) => setFormData({...formData, isDifferentiated: e.target.checked})}
              className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="diff-soal" className="text-sm font-medium text-white cursor-pointer">
              Generate Soal Berdiferensiasi (Dasar, Menengah, Mahir)
            </label>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !formData.topic}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-600/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
            {loading ? 'Sedang Merumuskan...' : 'Generate Soal'}
          </button>

          {result && (
            <button 
              onClick={() => setIsPreviewOpen(true)}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all border border-slate-700 shadow-lg"
            >
              <Eye className="w-5 h-5" /> Preview Hasil Soal
            </button>
          )}
        </div>
      </div>

      <PreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        content={result || ''}
        title={`Soal: ${formData.topic}`}
        onSaveCloud={handleSave}
      />
    </div>
  );
};

// --- AI Generator Worksheet Page ---
const WorksheetGeneratorPage = ({ geminiKey }: { geminiKey: string }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(() => localStorage.getItem('worksheet_last_result') || '');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) localStorage.setItem('worksheet_last_result', result);
  }, [result]);
  const [formData, setFormData] = useState({
    subject: 'Matematika',
    grade: '7',
    topic: '',
    context: '',
    activityCount: 3,
    difficulty: 3,
    location: '',
    isDifferentiated: false
  });

  const subjects = ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS', 'PAI', 'PPKn', 'Seni Budaya', 'PJOK'];
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  const handleGenerate = async () => {
    if (!formData.topic) return;
    setLoading(true);
    setResult('');
    try {
      await generateWorksheet(formData, (chunk) => {
        setResult(chunk);
      }, geminiKey);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      const response = await fetch('/api/docs/append', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Worksheet ${formData.subject} - ${formData.topic}`,
          content: result
        })
      });
      if (response.ok) alert('Berhasil disimpan ke Google Docs!');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    setPdfLoading(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(previewRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Worksheet_${formData.subject}_${formData.topic.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error(error);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#0a0f1d] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-emerald-600/20 rounded-2xl">
            <ScrollText className="text-emerald-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Worksheet AI</h2>
            <p className="text-xs text-slate-500">Buat lembar kerja siswa kontekstual.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mata Pelajaran</label>
            <select 
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            >
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kelas</label>
            <select 
              value={formData.grade}
              onChange={(e) => setFormData({...formData, grade: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            >
              {grades.map(g => <option key={g} value={g}>Kelas {g}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Materi / Topik</label>
            <input 
              type="text"
              placeholder="Contoh: Ekosistem Laut"
              value={formData.topic}
              onChange={(e) => setFormData({...formData, topic: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Konteks Kehidupan Nyata</label>
            <textarea 
              placeholder="Contoh: Masalah sampah plastik di pantai dekat sekolah"
              value={formData.context}
              onChange={(e) => setFormData({...formData, context: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all h-24 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jumlah Aktivitas ({formData.activityCount})</label>
            <input 
              type="range"
              min="1"
              max="10"
              value={formData.activityCount}
              onChange={(e) => setFormData({...formData, activityCount: parseInt(e.target.value)})}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tingkat Kesulitan ({formData.difficulty})</label>
            <input 
              type="range"
              min="1"
              max="5"
              value={formData.difficulty}
              onChange={(e) => setFormData({...formData, difficulty: parseInt(e.target.value)})}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lokasi (Kota/Kabupaten)</label>
            <input 
              type="text"
              placeholder="Contoh: Jakarta Selatan"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
            <input 
              type="checkbox" 
              id="diff-ws"
              checked={formData.isDifferentiated}
              onChange={(e) => setFormData({...formData, isDifferentiated: e.target.checked})}
              className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-emerald-600 focus:ring-emerald-600"
            />
            <label htmlFor="diff-ws" className="text-sm font-medium text-white cursor-pointer">
              Generate Worksheet Berdiferensiasi
            </label>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !formData.topic}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-600/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
            {loading ? 'Sedang Merancang...' : 'Generate Worksheet'}
          </button>

          {result && (
            <button 
              onClick={() => setIsPreviewOpen(true)}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all border border-slate-700 shadow-lg"
            >
              <Eye className="w-5 h-5" /> Preview Hasil Worksheet
            </button>
          )}
        </div>
      </div>

      <PreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        content={result || ''}
        title={`Worksheet: ${formData.topic}`}
        onSaveCloud={handleSave}
      />
    </div>
  );
};

// --- AI Rubrik Penilaian Page ---
const RubrikGeneratorPage = ({ geminiKey }: { geminiKey: string }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(() => localStorage.getItem('rubrik_last_result') || '');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) localStorage.setItem('rubrik_last_result', result);
  }, [result]);
  const [formData, setFormData] = useState({
    taskType: '',
    competencies: ['Pemahaman Konsep'],
    levels: 4
  });

  const competenciesList = ['Kreativitas', 'Kolaborasi', 'Komunikasi', 'Pemahaman Konsep', 'Kerapihan', 'Ketepatan Waktu', 'Berpikir Kritis'];

  const handleGenerate = async () => {
    if (!formData.taskType) return;
    setLoading(true);
    setResult('');
    try {
      const stream = await generateRubrik(formData, (chunk) => {
        setResult(chunk);
      }, geminiKey);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    try {
      const response = await fetch('/api/docs/append', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Rubrik Penilaian - ${formData.taskType}`,
          content: result
        })
      });
      if (response.ok) alert('Berhasil disimpan ke Google Docs!');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;
    setPdfLoading(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(previewRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Rubrik_${formData.taskType.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error(error);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#0a0f1d] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-orange-600/20 rounded-2xl">
            <ClipboardList className="text-orange-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Rubrik AI</h2>
            <p className="text-xs text-slate-500">Susun rubrik penilaian otomatis.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jenis Tugas</label>
            <input 
              type="text"
              placeholder="Contoh: Membuat Infografis"
              value={formData.taskType}
              onChange={(e) => setFormData({...formData, taskType: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kompetensi yang Dinilai</label>
            <div className="grid grid-cols-1 gap-2">
              {competenciesList.map(comp => (
                <label key={comp} className="flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 transition-all">
                  <input 
                    type="checkbox"
                    checked={formData.competencies.includes(comp)}
                    onChange={(e) => {
                      const newComp = e.target.checked 
                        ? [...formData.competencies, comp]
                        : formData.competencies.filter(c => c !== comp);
                      setFormData({...formData, competencies: newComp});
                    }}
                    className="w-4 h-4 rounded border-slate-700 text-orange-600 focus:ring-orange-500 bg-slate-900"
                  />
                  <span className="text-xs text-slate-300">{comp}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jumlah Level Penilaian</label>
            <div className="flex gap-4">
              {[3, 4, 5].map(level => (
                <label key={level} className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-800/50 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 transition-all">
                  <input 
                    type="radio"
                    name="levels"
                    checked={formData.levels === level}
                    onChange={() => setFormData({...formData, levels: level})}
                    className="w-4 h-4 border-slate-700 text-orange-600 focus:ring-orange-500 bg-slate-900"
                  />
                  <span className="text-xs text-slate-300">{level} Level</span>
                </label>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !formData.taskType}
            className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-orange-600/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
            {loading ? 'Sedang Menyusun...' : 'Generate Rubrik'}
          </button>

          {result && (
            <button 
              onClick={() => setIsPreviewOpen(true)}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all border border-slate-700 shadow-lg"
            >
              <Eye className="w-5 h-5" /> Preview Hasil Rubrik
            </button>
          )}
        </div>
      </div>

      <PreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        content={result || ''}
        title={`Rubrik: ${formData.taskType}`}
        onSaveCloud={handleSave}
      />
    </div>
  );
};

// --- AI Analisis Nilai Page ---
const AnalisisNilaiPage = ({ geminiKey }: { geminiKey: string }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<any>(() => {
    const saved = localStorage.getItem('analisis_last_result');
    return saved ? JSON.parse(saved) : null;
  });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [kkm, setKKM] = useState(75);
  const [showChart, setShowChart] = useState(true);

  useEffect(() => {
    if (analysis) localStorage.setItem('analisis_last_result', JSON.stringify(analysis));
  }, [analysis]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const jsonData = XLSX.utils.sheet_to_json(ws);
      setData(jsonData);
    };
    reader.readAsBinaryString(file);
  };

  const handleAnalyze = async () => {
    if (data.length === 0) return;
    setLoading(true);
    try {
      const result = await generateAnalisisNilai({ studentData: data, kkm });
      setAnalysis(result);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!analysis) return;
    try {
      const content = `
# Analisis Nilai Siswa
**Rata-rata Kelas:** ${analysis.average}
**Nilai Tertinggi:** ${analysis.highest}
**Nilai Terendah:** ${analysis.lowest}
**Tingkat Kelulusan:** ${((analysis.passed.length / data.length) * 100).toFixed(0)}%

## Rekomendasi
${analysis.recommendations}

## Daftar Siswa Remedial
${analysis.remedial.join(', ')}

## Daftar Siswa Pengayaan
${analysis.enrichment.join(', ')}
      `;
      const response = await fetch('/api/docs/append', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Analisis Nilai - ${new Date().toLocaleDateString()}`,
          content
        })
      });
      if (response.ok) alert('Berhasil disimpan ke Google Docs!');
    } catch (error) {
      console.error(error);
    }
  };

  const chartData = data.map((item: any) => ({
    name: item.Nama || item.name || 'Siswa',
    nilai: parseFloat(item.Nilai || item.score || 0)
  })).sort((a, b) => b.nilai - a.nilai);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/20 rounded-2xl">
            <PieChart className="text-blue-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Analisis Nilai Siswa</h2>
            <p className="text-xs text-slate-500">Unggah data nilai dan dapatkan analisis mendalam.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Unggah File (Excel/CSV)</label>
              <div className="relative group">
                <input 
                  type="file" 
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center group-hover:border-blue-500 transition-all">
                  <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2 group-hover:text-blue-500" />
                  <p className="text-xs text-slate-400">Klik atau seret file ke sini</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">KKM ({kkm})</label>
              <input 
                type="range"
                min="0"
                max="100"
                value={kkm}
                onChange={(e) => setKKM(parseInt(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox"
                checked={showChart}
                onChange={(e) => setShowChart(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-900"
              />
              <span className="text-xs text-slate-300">Tampilkan Grafik</span>
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={loading || data.length === 0}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-blue-600/20"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart3 className="w-5 h-5" />}
              {loading ? 'Menganalisis...' : 'Mulai Analisis'}
            </button>

            {analysis && (
              <button 
                onClick={() => setIsPreviewOpen(true)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700"
              >
                <Eye className="w-4 h-4" /> Lihat Preview Analisis
              </button>
            )}
          </div>

          {data.length > 0 && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Data Terdeteksi</h4>
              <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-2">
                {data.slice(0, 10).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                    <span className="text-[10px] text-slate-300 truncate max-w-[120px]">{item.Nama || item.name || `Siswa ${i+1}`}</span>
                    <span className="text-[10px] font-bold text-blue-400">{item.Nilai || item.score || 0}</span>
                  </div>
                ))}
                {data.length > 10 && <p className="text-[10px] text-slate-500 text-center mt-2">...dan {data.length - 10} lainnya</p>}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-3 space-y-8">
          {analysis ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Rata-rata Kelas</p>
                    <h3 className="text-3xl font-black text-white">{analysis.average?.toFixed(1) || 0}</h3>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Tingkat Kelulusan</p>
                    <h3 className="text-3xl font-black text-emerald-500">{data.length > 0 ? ((analysis.passed?.length / data.length) * 100).toFixed(0) : 0}%</h3>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-widest">Rekomendasi Strategi</h4>
                    <button onClick={handleSave} className="p-2 hover:bg-slate-800 rounded-lg transition-all text-blue-500">
                      <Save className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none text-slate-400">
                    <ReactMarkdown>{analysis.recommendations}</ReactMarkdown>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                    <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-4">Siswa Remedial ({analysis.remedial?.length || 0})</h4>
                    <div className="space-y-2">
                      {analysis.remedial?.slice(0, 5).map((s: string, i: number) => (
                        <p key={i} className="text-[10px] text-slate-400">• {s}</p>
                      ))}
                      {analysis.remedial?.length > 5 && <p className="text-[10px] text-slate-500">...dan {analysis.remedial.length - 5} lainnya</p>}
                    </div>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6">
                    <h4 className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-4">Siswa Pengayaan ({analysis.enrichment?.length || 0})</h4>
                    <div className="space-y-2">
                      {analysis.enrichment?.slice(0, 5).map((s: string, i: number) => (
                        <p key={i} className="text-[10px] text-slate-400">• {s}</p>
                      ))}
                      {analysis.enrichment?.length > 5 && <p className="text-[10px] text-slate-500">...dan {analysis.enrichment.length - 5} lainnya</p>}
                    </div>
                  </div>
                </div>
              </div>

              {showChart && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 flex flex-col h-full">
                  <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-8">Visualisasi Performa</h4>
                  <div className="flex-1 min-h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#64748b" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          hide={data.length > 15}
                        />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          domain={[0, 100]}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                          itemStyle={{ color: '#60a5fa', fontSize: '12px' }}
                        />
                        <Bar dataKey="nilai" radius={[4, 4, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.nilai >= kkm ? '#10b981' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[500px] flex flex-col items-center justify-center text-center opacity-40">
              <div className="w-24 h-24 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700">
                <PieChart className="text-slate-600 w-10 h-10" />
              </div>
              <h4 className="text-white font-bold mb-2">Belum Ada Analisis</h4>
              <p className="text-xs text-slate-500 max-w-[250px]">
                Unggah file nilai Anda dan klik tombol analisis untuk melihat hasilnya.
              </p>
            </div>
          )}
        </div>
      </div>

      <PreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        content={analysis?.raw_markdown || ''}
        title="Analisis Nilai Siswa"
        onSaveCloud={() => {}}
      />
    </div>
  );
};

// --- AI Ice Breaking Page ---
const IceBreakingPage = ({ geminiKey }: { geminiKey: string }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(() => localStorage.getItem('icebreaking_last_result') || '');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    if (result) localStorage.setItem('icebreaking_last_result', result);
  }, [result]);
  const [formData, setFormData] = useState({
    subject: 'Matematika',
    topic: '',
    duration: '10',
    types: ['Game']
  });

  const subjects = ['Matematika', 'Bahasa Indonesia', 'Bahasa Inggris', 'IPA', 'IPS', 'PAI', 'PPKn', 'Seni Budaya', 'PJOK'];
  const activityTypes = ['Game', 'Diskusi', 'Mini Challenge', 'Fisik', 'Kuis'];

  const handleGenerate = async () => {
    setLoading(true);
    setResult('');
    try {
      await generateIceBreaking(formData, (chunk) => {
        setResult(chunk);
      }, geminiKey);
      setIsPreviewOpen(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#0a0f1d] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-pink-600/20 rounded-2xl">
            <Smile className="text-pink-500 w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Ice Breaking AI</h2>
            <p className="text-xs text-slate-500">Cari ide aktivitas seru di kelas.</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Mata Pelajaran</label>
            <select 
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-pink-500 outline-none transition-all"
            >
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Materi (Opsional)</label>
            <input 
              type="text"
              placeholder="Contoh: Perkalian"
              value={formData.topic}
              onChange={(e) => setFormData({...formData, topic: e.target.value})}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-pink-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Durasi Kegiatan</label>
            <div className="flex gap-4">
              {['5', '10', '15'].map(d => (
                <label key={d} className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-800/50 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 transition-all">
                  <input 
                    type="radio"
                    name="duration"
                    checked={formData.duration === d}
                    onChange={() => setFormData({...formData, duration: d})}
                    className="w-4 h-4 border-slate-700 text-pink-600 focus:ring-pink-500 bg-slate-900"
                  />
                  <span className="text-xs text-slate-300">{d} Menit</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Jenis Aktivitas</label>
            <div className="grid grid-cols-2 gap-2">
              {activityTypes.map(type => (
                <label key={type} className="flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 transition-all">
                  <input 
                    type="checkbox"
                    checked={formData.types.includes(type)}
                    onChange={(e) => {
                      const newTypes = e.target.checked 
                        ? [...formData.types, type]
                        : formData.types.filter(t => t !== type);
                      setFormData({...formData, types: newTypes});
                    }}
                    className="w-4 h-4 rounded border-slate-700 text-pink-600 focus:ring-pink-500 bg-slate-900"
                  />
                  <span className="text-xs text-slate-300">{type}</span>
                </label>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-4 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-pink-600/20"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
            {loading ? 'Sedang Mencari Ide...' : 'Cari Ide Ice Breaking'}
          </button>

          {result && (
            <button 
              onClick={() => setIsPreviewOpen(true)}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all border border-slate-700 shadow-lg"
            >
              <Eye className="w-5 h-5" /> Preview Hasil Ice Breaking
            </button>
          )}
        </div>
      </div>

      <PreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        content={result}
        title={`Ice Breaking: ${formData.subject}`}
        onSaveCloud={() => {}}
      />
    </div>
  );
};

const ProyekP5Page = ({ geminiKey }: { geminiKey: string }) => {
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [result, setResult] = useState<string | null>(() => localStorage.getItem('p5_last_result') || null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (result) localStorage.setItem('p5_last_result', result);
  }, [result]);

  // Persisted state
  const [sheetUrl, setSheetUrl] = useState(() => localStorage.getItem('p5_sheet_url') || '');
  const [isLocked, setIsLocked] = useState(() => localStorage.getItem('p5_is_locked') === 'true');

  useEffect(() => {
    localStorage.setItem('p5_sheet_url', sheetUrl);
  }, [sheetUrl]);

  useEffect(() => {
    localStorage.setItem('p5_is_locked', isLocked.toString());
  }, [isLocked]);

  const previewRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    theme: '',
    grade: '7',
    durationWeeks: 4,
    groupCount: 5,
    focus: [] as string[],
    productType: 'Poster/Video',
    complexity: 3,
    includeRubric: true,
    location: ''
  });

  const handleGenerate = async () => {
    if (!form.theme) return;
    setLoading(true);
    setSaved(false);
    setError(null);
    setResult(""); // Clear previous result
    try {
      await generateProyekP5(form, (content) => {
        setResult(content);
      }, geminiKey);
      setIsPreviewOpen(true);
    } catch (err: any) {
      console.error(err);
      setError(`Gagal generate: ${err.message || 'Terjadi kesalahan'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setError(null);
    setSaved(false);
    
    // Save to Local Storage
    const existing = JSON.parse(localStorage.getItem('saved_proyeks') || '[]');
    const newEntry = {
      ...form,
      content: result,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      id: Date.now()
    };
    localStorage.setItem('saved_proyeks', JSON.stringify([newEntry, ...existing]));

    // Sync to Spreadsheet/Doc if locked
    let syncMessage = "Berhasil Disimpan";
    if (isLocked && sheetUrl) {
      const tokens = JSON.parse(localStorage.getItem('google_tokens') || 'null');
      if (!tokens) {
        setError("Silakan hubungkan akun Google terlebih dahulu.");
        return;
      }

      const isSpreadsheet = sheetUrl.includes('/spreadsheets/d/');
      const isDoc = sheetUrl.includes('/document/d/');

      try {
        if (isSpreadsheet) {
          const spreadsheetId = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1];
          if (!spreadsheetId) throw new Error("ID Spreadsheet tidak valid.");

          const res = await fetch('/api/sheets/append', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              spreadsheetId,
              tokens,
              sheetName: 'Proyek P5',
              values: [
                new Date().toLocaleString('id-ID'),
                form.theme,
                form.grade,
                `${form.durationWeeks} Minggu`,
                form.focus.join(', '),
                result.substring(0, 1000) + (result.length > 1000 ? '...' : '')
              ]
            })
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Gagal menyimpan ke Spreadsheet.");
          }
          syncMessage = "Berhasil Disimpan & Sinkron ke Sheets";
        } else if (isDoc) {
          const documentId = sheetUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/)?.[1];
          if (!documentId) throw new Error("ID Dokumen tidak valid.");

          const res = await fetch('/api/docs/append', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              documentId,
              tokens,
              title: `Proyek P5: ${form.theme}`,
              content: result
            })
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Gagal menyimpan ke Google Docs.");
          }
          syncMessage = "Berhasil Disimpan & Sinkron ke Docs";
        }
      } catch (err: any) {
        console.error('Sync failed:', err);
        setError(`Gagal sinkronisasi: ${err.message}`);
        return;
      }
    }

    setSaved(true);
    (window as any)._lastToastMessage = syncMessage;
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleDimension = (dim: string) => {
    setForm(prev => ({
      ...prev,
      focus: prev.focus.includes(dim) 
        ? prev.focus.filter(d => d !== dim)
        : [...prev.focus, dim]
    }));
  };

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#0a0f1d] p-8">
      <div className="max-w-4xl mx-auto">
        <Header 
          title="AI Perencana Proyek P5" 
          subtitle="Rancang Projek Penguatan Profil Pelajar Pancasila yang bermakna dan terintegrasi." 
          hideControls={true}
        />
        
        <SpreadsheetInput 
          url={sheetUrl} 
          setUrl={setSheetUrl} 
          isLocked={isLocked} 
          setIsLocked={setIsLocked} 
        />

        <div className="space-y-8 mt-8">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Tema Utama Proyek</label>
            <div className="relative">
              <select 
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 text-white h-14 px-5 text-sm focus:ring-2 focus:ring-blue-600 outline-none appearance-none cursor-pointer"
                value={form.theme}
                onChange={e => setForm({...form, theme: e.target.value})}
              >
                <option value="">Pilih Tema Strategis</option>
                <option value="Gaya Hidup Berkelanjutan">Gaya Hidup Berkelanjutan</option>
                <option value="Kearifan Lokal">Kearifan Lokal</option>
                <option value="Bhinneka Tunggal Ika">Bhinneka Tunggal Ika</option>
                <option value="Bangunlah Jiwa dan Raganya">Bangunlah Jiwa dan Raganya</option>
                <option value="Suara Demokrasi">Suara Demokrasi</option>
                <option value="Rekayasa dan Teknologi">Rekayasa dan Teknologi</option>
                <option value="Kewirausahaan">Kewirausahaan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Kelas</label>
              <select 
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 text-white h-14 px-5 text-sm focus:ring-2 focus:ring-blue-600 outline-none appearance-none cursor-pointer"
                value={form.grade}
                onChange={e => setForm({...form, grade: e.target.value})}
              >
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(g => (
                  <option key={g} value={g}>Kelas {g}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Durasi (Minggu)</label>
              <input 
                type="number"
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 text-white h-14 px-5 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                value={form.durationWeeks}
                onChange={e => setForm({...form, durationWeeks: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Jumlah Kelompok</label>
              <input 
                type="number"
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 text-white h-14 px-5 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                value={form.groupCount}
                onChange={e => setForm({...form, groupCount: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Jenis Produk</label>
              <select 
                className="w-full rounded-2xl border border-slate-800 bg-slate-900/50 text-white h-14 px-5 text-sm focus:ring-2 focus:ring-blue-600 outline-none appearance-none cursor-pointer"
                value={form.productType}
                onChange={e => setForm({...form, productType: e.target.value})}
              >
                <option value="Poster/Video">Poster/Video</option>
                <option value="Prototipe/Produk Fisik">Prototipe/Produk Fisik</option>
                <option value="Laporan Ilmiah">Laporan Ilmiah</option>
                <option value="Kampanye Sosial">Kampanye Sosial</option>
                <option value="Pameran/Karya Seni">Pameran/Karya Seni</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Kompleksitas Proyek</label>
              <span className="text-xs font-bold text-indigo-500">{form.complexity}/5</span>
            </div>
            <input 
              type="range"
              min="1"
              max="5"
              value={form.complexity}
              onChange={(e) => setForm({...form, complexity: parseInt(e.target.value)})}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox"
                  checked={form.includeRubric}
                  onChange={e => setForm({...form, includeRubric: e.target.checked})}
                  className="hidden"
                />
                <div className={cn(
                  "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                  form.includeRubric ? "bg-indigo-600 border-indigo-600" : "border-slate-700 group-hover:border-slate-600"
                )}>
                  {form.includeRubric && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
              </div>
              <span className="text-xs font-bold text-slate-300">Sertakan Rubrik Penilaian</span>
            </label>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Target Dimensi Profil Pancasila</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Beriman, Bertakwa & Berakhlak Mulia',
                'Berkebinekaan Global',
                'Gotong Royong',
                'Mandiri',
                'Bernalar Kritis',
                'Kreatif'
              ].map(dim => (
                <button 
                  key={dim} 
                  onClick={() => toggleDimension(dim)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border transition-all text-xs font-bold",
                    form.focus.includes(dim) 
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20" 
                      : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
                  )}
                >
                  <span>{dim}</span>
                  {form.focus.includes(dim) && <CheckCircle2 className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !form.theme}
            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Rocket className="w-6 h-6" />}
            Rancang Proyek Sekarang
          </button>

          {result && (
            <button 
              onClick={() => setIsPreviewOpen(true)}
              className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all border border-slate-700 shadow-lg"
            >
              <Eye className="w-5 h-5" /> Preview Hasil Proyek P5
            </button>
          )}
        </div>

        <AnimatePresence>
          {saved && (
            <Toast 
              message={(window as any)._lastToastMessage || "Berhasil Disimpan"} 
              type="success" 
              onClose={() => setSaved(false)} 
            />
          )}
          {error && (
            <Toast 
              message={error} 
              type="error" 
              onClose={() => setError(null)} 
            />
          )}
        </AnimatePresence>
      </div>

      <PreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        content={result || ''}
        title={`Proyek P5: ${form.theme}`}
        onSaveCloud={handleSave}
      />
    </div>
  );
};

const MainLayout = ({ children, geminiKey, setGeminiKey }: { children: React.ReactNode, geminiKey: string, setGeminiKey: (k: string) => void }) => {
  return (
    <div className="flex min-h-screen bg-[#0f172a]">
      <Sidebar geminiKey={geminiKey} setGeminiKey={setGeminiKey} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

// --- App Router ---

export default function App() {
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');

  useEffect(() => {
    localStorage.setItem('gemini_api_key', geminiKey);
  }, [geminiKey]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout geminiKey={geminiKey} setGeminiKey={setGeminiKey}><Dashboard /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/presensi" element={
          <ProtectedRoute>
            <MainLayout geminiKey={geminiKey} setGeminiKey={setGeminiKey}><PresensiPage /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/modul-ajar" element={
          <ProtectedRoute>
            <MainLayout geminiKey={geminiKey} setGeminiKey={setGeminiKey}><ModulAjarPage geminiKey={geminiKey} /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/proyek-p5" element={
          <ProtectedRoute>
            <MainLayout geminiKey={geminiKey} setGeminiKey={setGeminiKey}><ProyekP5Page geminiKey={geminiKey} /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/buat-soal" element={
          <ProtectedRoute>
            <MainLayout geminiKey={geminiKey} setGeminiKey={setGeminiKey}><SoalGeneratorPage geminiKey={geminiKey} /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/worksheet" element={
          <ProtectedRoute>
            <MainLayout geminiKey={geminiKey} setGeminiKey={setGeminiKey}><WorksheetGeneratorPage geminiKey={geminiKey} /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/rubrik" element={
          <ProtectedRoute>
            <MainLayout geminiKey={geminiKey} setGeminiKey={setGeminiKey}><RubrikGeneratorPage geminiKey={geminiKey} /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/analisis-nilai" element={
          <ProtectedRoute>
            <MainLayout geminiKey={geminiKey} setGeminiKey={setGeminiKey}><AnalisisNilaiPage geminiKey={geminiKey} /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/ice-breaking" element={
          <ProtectedRoute>
            <MainLayout geminiKey={geminiKey} setGeminiKey={setGeminiKey}><IceBreakingPage geminiKey={geminiKey} /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/laporan" element={
          <ProtectedRoute>
            <MainLayout geminiKey={geminiKey} setGeminiKey={setGeminiKey}><LaporanPage /></MainLayout>
          </ProtectedRoute>
        } />
        <Route path="*" element={<NavigateToHome />} />
      </Routes>
    </Router>
  );
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!loggedIn) navigate('/login');
  }, [navigate]);
  return <>{children}</>;
};

const NavigateToHome = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!loggedIn) navigate('/login');
    else navigate('/');
  }, [navigate]);
  return null;
};
