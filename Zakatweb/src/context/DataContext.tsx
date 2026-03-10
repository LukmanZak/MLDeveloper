import React, { createContext, useState, useContext, useEffect } from 'react';
import Papa from 'papaparse';

export interface ZakatData {
  ID: string;
  Nama: string;
  Area: string;
  'Jenis Zakat': string;
  Jumlah: string;
  Status: string;
  Tanggal: string;
  [key: string]: any;
}

interface DataContextType {
  sheetUrl: string;
  data: ZakatData[];
  loading: boolean;
  error: string;
  fetchData: (url: string) => void;
  clearData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [data, setData] = useState<ZakatData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const extractSheetId = (url: string) => {
    const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : null;
  };

  const fetchData = (url: string) => {
    setError('');
    const sheetId = extractSheetId(url);
    
    if (!sheetId) {
      setError('Invalid Google Spreadsheet URL. Please make sure it contains /d/SHEET_ID');
      return;
    }

    setLoading(true);
    const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

    Papa.parse(csvUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          setData(results.data as ZakatData[]);
          setSheetUrl(url);
        } else {
          setError('No data found or spreadsheet is empty.');
        }
        setLoading(false);
      },
      error: (err) => {
        setError(`Failed to fetch data: ${err.message}. Make sure the spreadsheet is public ("Anyone with the link can view").`);
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (sheetUrl) {
      // Auto-refresh every 15 seconds
      intervalId = setInterval(() => {
        const sheetId = extractSheetId(sheetUrl);
        if (sheetId) {
          const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
          Papa.parse(csvUrl, {
            download: true,
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.data && results.data.length > 0) {
                setData(results.data as ZakatData[]);
              }
            }
          });
        }
      }, 15000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [sheetUrl]);

  const clearData = () => {
    setSheetUrl('');
    setData([]);
    setError('');
  };

  return (
    <DataContext.Provider value={{ sheetUrl, data, loading, error, fetchData, clearData }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
