import React, { useState, useEffect } from 'react';
import { Download, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { AggregatedAttendance } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import * as XLSX from 'xlsx';

interface AttendanceTableProps {
  type: 'guru' | 'siswa';
  data: AggregatedAttendance[];
  loading: boolean;
  filterDay: string;
  onFilterChange: (day: string) => void;
  userRole?: string;
}

export const AttendanceTable: React.FC<AttendanceTableProps> = ({
  type,
  data,
  loading,
  filterDay,
  onFilterChange,
  userRole
}) => {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [sortedData, setSortedData] = useState<AggregatedAttendance[]>([]);

  useEffect(() => {
    setSortedData(data);
  }, [data]);

  const handleSort = (column: string) => {
    const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(direction);

    const sorted = [...data].sort((a, b) => {
      const aValue = getColumnValue(a, column);
      const bValue = getColumnValue(b, column);

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (direction === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });

    setSortedData(sorted);
  };

  const getColumnValue = (item: AggregatedAttendance, column: string): any => {
    switch (column) {
      case 'nama':
        return type === 'guru' ? item.namaGuru : item.namaSiswa;
      case 'pelajaran':
        return item.pelajaran;
      case 'kelas':
        return item.kelas;
      case 'totalHadir':
        return item.totalHadir;
      case 'totalAlfa':
        return item.totalAlfa;
      default:
        return '';
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(sortedData.map(item => ({
      Nama: type === 'guru' ? item.namaGuru : item.namaSiswa,
      Pelajaran: item.pelajaran,
      Kelas: item.kelas,
      'Total Hadir': item.totalHadir,
      'Total Alfa': item.totalAlfa,
      'Total Izin': item.totalIzin,
      'Total Sakit': item.totalSakit,
      'Status Keseluruhan': item.totalMinggu
    })));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Absensi");
    XLSX.writeFile(wb, `Rekap_Absensi_${type === 'guru' ? 'Guru' : 'Siswa'}.xlsx`);
  };

  const getSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 opacity-50" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-primary-400" />
      : <ArrowDown className="w-4 h-4 text-primary-400" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Hadir':
        return 'bg-green-500/20 text-green-300 border border-green-500/30';
      case 'Alfa':
        return 'bg-red-500/20 text-red-300 border border-red-500/30';
      case 'Sakit':
      case 'Izin':
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
    }
  };

  const getIndicatorColor = (item: AggregatedAttendance) => {
    if (item.totalAlfa > 0) {
      return 'bg-red-500/20 text-red-300 border border-red-500/30';
    } else if (item.totalSakit > 0 || item.totalIzin > 0) {
      return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30';
    } else {
      return 'bg-green-500/20 text-green-300 border border-green-500/30';
    }
  };

  const getIndicatorText = (item: AggregatedAttendance) => {
    if (item.totalAlfa > 0) return 'Buruk';
    if (item.totalSakit > 0 || item.totalIzin > 0) return 'Perhatian';
    return 'Baik';
  };

  const shouldShowColumn = (column: string) => {
    if (userRole === 'kepalaSekolah' || userRole === 'wakasek') {
      return true;
    }
    // Hide location, photo, and material columns for non-admin users
    return !['lokasi', 'foto', 'materi', 'namaGuru2'].includes(column);
  };

  return (
    <div className="glass-effect rounded-2xl p-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <div className="w-1 h-6 bg-gradient-to-b from-primary-400 to-primary-600 rounded-full mr-3"></div>
          {type === 'guru' ? '(GURU) - Rekap Absensi' : '(SISWA) - Rekap Absensi'}
        </h3>
        
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-300">Hari:</label>
            <select
              value={filterDay}
              onChange={(e) => onFilterChange(e.target.value)}
              className="px-3 py-2 bg-dark-800/50 border border-dark-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
            >
              <option value="all">Keseluruhan dalam seminggu</option>
              {[1, 2, 3, 4, 5, 6, 7].map(day => (
                <option key={day} value={day.toString()}>Hari ke-{day}</option>
              ))}
            </select>
          </div>
          
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-lg hover:bg-blue-600/30 transition-all duration-200 button-glow"
          >
            <Download className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message={`Memuat data absensi ${type === 'guru' ? 'guru' : 'siswa'}...`} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-600">
                <th 
                  className="text-left py-3 px-4 text-primary-300 font-semibold cursor-pointer hover:text-primary-200 transition-colors"
                  onClick={() => handleSort('nama')}
                >
                  <div className="flex items-center gap-2">
                    {type === 'guru' ? 'Nama Guru' : 'Nama'}
                    {getSortIcon('nama')}
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-primary-300 font-semibold cursor-pointer hover:text-primary-200 transition-colors"
                  onClick={() => handleSort('pelajaran')}
                >
                  <div className="flex items-center gap-2">
                    Pelajaran
                    {getSortIcon('pelajaran')}
                  </div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-primary-300 font-semibold cursor-pointer hover:text-primary-200 transition-colors"
                  onClick={() => handleSort('kelas')}
                >
                  <div className="flex items-center gap-2">
                    Kelas
                    {getSortIcon('kelas')}
                  </div>
                </th>
                
                {shouldShowColumn('lokasi') && (
                  <th className="text-left py-3 px-4 text-primary-300 font-semibold">Lokasi</th>
                )}
                {shouldShowColumn('foto') && (
                  <th className="text-left py-3 px-4 text-primary-300 font-semibold">Foto</th>
                )}
                {type === 'guru' && shouldShowColumn('materi') && (
                  <th className="text-left py-3 px-4 text-primary-300 font-semibold">Materi</th>
                )}
                {type === 'siswa' && shouldShowColumn('namaGuru2') && (
                  <th className="text-left py-3 px-4 text-primary-300 font-semibold">Nama Guru</th>
                )}
                
                {filterDay === 'all' ? (
                  <>
                    {[1, 2, 3, 4, 5, 6, 7].map(day => (
                      <th key={day} className="text-center py-3 px-4 text-primary-300 font-semibold">
                        Hari {day}
                      </th>
                    ))}
                  </>
                ) : (
                  <th className="text-center py-3 px-4 text-primary-300 font-semibold">
                    Hari ke-{filterDay}
                  </th>
                )}
                
                <th className="text-center py-3 px-4 text-primary-300 font-semibold">Indikator</th>
                <th className="text-left py-3 px-4 text-primary-300 font-semibold">Keseluruhan</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-8 text-gray-400">
                    Tidak ada data absensi untuk ditampilkan
                  </td>
                </tr>
              ) : (
                sortedData.map((item, index) => (
                  <tr 
                    key={item.id} 
                    className="border-b border-dark-700/50 table-row-hover animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="py-3 px-4 text-white font-medium">
                      {type === 'guru' ? item.namaGuru : item.namaSiswa}
                    </td>
                    <td className="py-3 px-4 text-gray-300">{item.pelajaran}</td>
                    <td className="py-3 px-4 text-gray-300">{item.kelas}</td>
                    
                    {shouldShowColumn('lokasi') && (
                      <td className="py-3 px-4">
                        <div dangerouslySetInnerHTML={{ __html: item.lokasi }} />
                      </td>
                    )}
                    {shouldShowColumn('foto') && (
                      <td className="py-3 px-4">
                        {item.foto && item.foto !== 'Tidak Diketahui' ? (
                          <img 
                            src={item.foto} 
                            alt="Foto" 
                            className="w-12 h-12 rounded-lg object-cover border border-primary-500/30 hover-scale"
                          />
                        ) : (
                          <span className="text-gray-500 text-sm">Tidak Ada</span>
                        )}
                      </td>
                    )}
                    {type === 'guru' && shouldShowColumn('materi') && (
                      <td className="py-3 px-4 text-gray-300 max-w-xs truncate">
                        {item.materi}
                      </td>
                    )}
                    {type === 'siswa' && shouldShowColumn('namaGuru2') && (
                      <td className="py-3 px-4 text-gray-300">{item.namaGuru2}</td>
                    )}
                    
                    {filterDay === 'all' ? (
                      item.dayStatuses.map((status, dayIndex) => (
                        <td key={dayIndex} className="py-3 px-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {status}
                          </span>
                        </td>
                      ))
                    ) : (
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.dayStatuses[parseInt(filterDay) - 1])}`}>
                          {item.dayStatuses[parseInt(filterDay) - 1]}
                        </span>
                      </td>
                    )}
                    
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIndicatorColor(item)}`}>
                        {getIndicatorText(item)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300 text-sm">{item.totalMinggu}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};