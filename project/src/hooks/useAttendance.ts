import { useState, useEffect } from 'react';
import { ref, get } from 'firebase/database';
import { database } from '../config/firebase';
import { AggregatedAttendance, User } from '../types';

export const useAttendance = (type: 'guru' | 'siswa', user: User | null) => {
  const [data, setData] = useState<AggregatedAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (filterDay: string = 'all') => {
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      const refPath = type === 'guru' ? 'absensi/guru' : 'absensi/siswa';
      const snapshot = await get(ref(database, refPath));
      const rawData = snapshot.val();
      
      if (!rawData) {
        setData([]);
        setLoading(false);
        return;
      }

      const aggregated: { [key: string]: AggregatedAttendance } = {};

      if (type === 'guru') {
        for (const guruId in rawData) {
          if (user.role === 'guru' && guruId !== user.uid) {
            continue;
          }

          const dailyEntries = rawData[guruId];
          const guruName = await getDisplayName(guruId, 'guru');
          
          if (!aggregated[guruId]) {
            aggregated[guruId] = {
              id: guruId,
              namaGuru: guruName,
              pelajaran: 'Tidak Diketahui',
              kelas: 'Tidak Diketahui',
              lokasi: 'Tidak Ada',
              foto: 'Tidak Ada',
              materi: 'Tidak Diketahui',
              dayStatuses: Array(7).fill('Belum Absen'),
              totalHadir: 0,
              totalAlfa: 0,
              totalIzin: 0,
              totalSakit: 0,
              totalMinggu: '0 Hari Hadir'
            };
          }

          for (const date in dailyEntries) {
            const entry = dailyEntries[date];
            const dayOfWeek = new Date(date).getDay();
            const dayIndex = dayOfWeek === 0 ? 7 : dayOfWeek;

            aggregated[guruId].dayStatuses[dayIndex - 1] = entry.status;
            aggregated[guruId].pelajaran = entry.pelajaran || aggregated[guruId].pelajaran;
            aggregated[guruId].kelas = entry.kelas || aggregated[guruId].kelas;
            
            if (entry.lokasi?.latitude && entry.lokasi?.longitude) {
              aggregated[guruId].lokasi = `<a href="https://www.openstreetmap.org/?mlat=${entry.lokasi.latitude}&mlon=${entry.lokasi.longitude}#map=15/${entry.lokasi.latitude}/${entry.lokasi.longitude}" target="_blank" class="text-blue-400 hover:underline">Lihat Peta</a>`;
            }
            
            aggregated[guruId].foto = entry.foto || aggregated[guruId].foto;
            aggregated[guruId].materi = entry.materi || aggregated[guruId].materi;
          }

          // Calculate totals
          aggregated[guruId].totalHadir = aggregated[guruId].dayStatuses.filter(s => s === 'Hadir').length;
          aggregated[guruId].totalAlfa = aggregated[guruId].dayStatuses.filter(s => s === 'Alfa').length;
          aggregated[guruId].totalIzin = aggregated[guruId].dayStatuses.filter(s => s === 'Izin').length;
          aggregated[guruId].totalSakit = aggregated[guruId].dayStatuses.filter(s => s === 'Sakit').length;
          aggregated[guruId].totalMinggu = `${aggregated[guruId].totalHadir} Hadir, ${aggregated[guruId].totalSakit} Sakit, ${aggregated[guruId].totalIzin} Izin, ${aggregated[guruId].totalAlfa} Alfa`;
        }
      } else {
        // Process student data
        for (const userId in rawData) {
          if (user.role === 'guru' && !(await isTeacherOfStudent(userId, user.name))) {
            continue;
          }
          if (user.role === 'waliKelas' && !(await isStudentInWaliKelasClass(userId, user.associatedClass))) {
            continue;
          }

          const mapelData = rawData[userId];
          
          if (!aggregated[userId]) {
            aggregated[userId] = {
              id: userId,
              namaSiswa: 'Tidak Dikenal',
              pelajaran: 'Tidak Diketahui',
              kelas: 'Tidak Diketahui',
              lokasi: 'Tidak Ada',
              foto: 'Tidak Ada',
              namaGuru2: 'Tidak Diketahui',
              dayStatuses: Array(7).fill('Belum Absen'),
              totalHadir: 0,
              totalAlfa: 0,
              totalIzin: 0,
              totalSakit: 0,
              totalMinggu: '0 Hari Hadir'
            };
          }

          for (const mapelKey in mapelData) {
            const waktuData = mapelData[mapelKey];
            for (const waktuKey in waktuData) {
              const entry = waktuData[waktuKey];
              const date = new Date(entry.waktu).toISOString().split('T')[0];
              const dayOfWeek = new Date(date).getDay();
              const dayIndex = dayOfWeek === 0 ? 7 : dayOfWeek;

              aggregated[userId].dayStatuses[dayIndex - 1] = entry.status || 'Hadir';
              aggregated[userId].namaSiswa = entry.nama || aggregated[userId].namaSiswa;
              aggregated[userId].pelajaran = entry.mapel || aggregated[userId].pelajaran;
              aggregated[userId].kelas = entry.kelas || aggregated[userId].kelas;
              aggregated[userId].namaGuru2 = entry.namaGuru || aggregated[userId].namaGuru2;
              
              if (entry.lokasi?.latitude && entry.lokasi?.longitude) {
                aggregated[userId].lokasi = `<a href="https://www.openstreetmap.org/?mlat=${entry.lokasi.latitude}&mlon=${entry.lokasi.longitude}#map=15/${entry.lokasi.latitude}/${entry.lokasi.longitude}" target="_blank" class="text-blue-400 hover:underline">Lihat Peta</a>`;
              }
              
              aggregated[userId].foto = entry.foto || aggregated[userId].foto;
            }
          }

          // Calculate totals
          aggregated[userId].totalHadir = aggregated[userId].dayStatuses.filter(s => s === 'Hadir').length;
          aggregated[userId].totalAlfa = aggregated[userId].dayStatuses.filter(s => s === 'Alfa').length;
          aggregated[userId].totalIzin = aggregated[userId].dayStatuses.filter(s => s === 'Izin').length;
          aggregated[userId].totalSakit = aggregated[userId].dayStatuses.filter(s => s === 'Sakit').length;
          aggregated[userId].totalMinggu = `${aggregated[userId].totalHadir} Hadir, ${aggregated[userId].totalSakit} Sakit, ${aggregated[userId].totalIzin} Izin, ${aggregated[userId].totalAlfa} Alfa`;
        }
      }

      setData(Object.values(aggregated));

    } catch (error) {
      console.error('Error loading attendance data:', error);
      setError('Gagal memuat data absensi');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayName = async (uid: string, type: string): Promise<string> => {
    try {
      const snapshot = await get(ref(database, `users/${uid}`));
      const userData = snapshot.val();
      return userData?.name || (type === 'guru' ? 'Guru Tidak Dikenal' : 'Siswa Tidak Dikenal');
    } catch {
      return type === 'guru' ? 'Guru Tidak Dikenal' : 'Siswa Tidak Dikenal';
    }
  };

  const isTeacherOfStudent = async (studentId: string, teacherName: string): Promise<boolean> => {
    try {
      const snapshot = await get(ref(database, `absensi/siswa/${studentId}`));
      const studentData = snapshot.val();
      
      if (studentData) {
        for (const mapelKey in studentData) {
          const waktuData = studentData[mapelKey];
          for (const waktuKey in waktuData) {
            const entry = waktuData[waktuKey];
            if (entry.namaGuru === teacherName) {
              return true;
            }
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  const isStudentInWaliKelasClass = async (studentId: string, waliKelasClass?: string): Promise<boolean> => {
    if (!waliKelasClass) return false;
    
    try {
      const snapshot = await get(ref(database, `absensi/siswa/${studentId}`));
      const studentData = snapshot.val();
      
      if (studentData) {
        for (const mapelKey in studentData) {
          const waktuData = studentData[mapelKey];
          for (const waktuKey in waktuData) {
            const entry = waktuData[waktuKey];
            if (entry.kelas === waliKelasClass) {
              return true;
            }
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  };

  return { data, loading, error, loadData };
};