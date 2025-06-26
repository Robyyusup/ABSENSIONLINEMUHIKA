export interface User {
  uid: string;
  email: string;
  role: 'kepalaSekolah' | 'wakasek' | 'guru' | 'waliKelas';
  name: string;
  associatedClass?: string;
}

export interface AttendanceEntry {
  id: string;
  nama: string;
  mapel?: string;
  pelajaran?: string;
  kelas: string;
  lokasi?: {
    latitude: number;
    longitude: number;
  };
  foto?: string;
  materi?: string;
  namaGuru?: string;
  status: 'Hadir' | 'Alfa' | 'Izin' | 'Sakit';
  waktu: string;
}

export interface AggregatedAttendance {
  id: string;
  namaGuru?: string;
  namaSiswa?: string;
  pelajaran: string;
  kelas: string;
  lokasi: string;
  foto: string;
  materi?: string;
  namaGuru2?: string;
  dayStatuses: string[];
  totalHadir: number;
  totalAlfa: number;
  totalIzin: number;
  totalSakit: number;
  totalMinggu: string;
}

export interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}