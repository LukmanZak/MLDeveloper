export interface Student {
  id: string;
  name: string;
  nis: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpa';
  note?: string;
}

export interface ModulAjar {
  id: string;
  title: string;
  subject: string;
  content: string;
  createdAt: string;
}

export interface ProyekP5 {
  id: string;
  title: string;
  theme: string;
  content: string;
  createdAt: string;
}
