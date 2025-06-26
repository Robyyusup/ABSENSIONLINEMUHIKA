import React, { useState } from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useAttendance } from './hooks/useAttendance';
import { LoginForm } from './components/LoginForm';
import { ErrorMessage } from './components/ErrorMessage';
import { Logo } from './components/Logo';
import { TabNavigation } from './components/TabNavigation';
import { AttendanceTable } from './components/AttendanceTable';
import { StudentMap } from './components/StudentMap';
import { StudentGallery } from './components/StudentGallery';
import { LoadingSpinner } from './components/LoadingSpinner';

function App() {
  const { user, loading: authLoading, error, logout, setError } = useAuth();
  const [activeTab, setActiveTab] = useState('guru-absensi');
  const [guruFilterDay, setGuruFilterDay] = useState('all');
  const [siswaFilterDay, setSiswaFilterDay] = useState('all');

  const guruAttendance = useAttendance('guru', user);
  const siswaAttendance = useAttendance('siswa', user);

  // Load data when tab changes or filter changes
  React.useEffect(() => {
    if (user && activeTab === 'guru-absensi') {
      guruAttendance.loadData(guruFilterDay);
    }
  }, [user, activeTab, guruFilterDay]);

  React.useEffect(() => {
    if (user && activeTab === 'siswa-absensi') {
      siswaAttendance.loadData(siswaFilterDay);
    }
  }, [user, activeTab, siswaFilterDay]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Memuat aplikasi..." size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <ErrorMessage message={error} onClose={() => setError('')} />
        <LoginForm onError={setError} />
      </>
    );
  }

  const handleLogout = async () => {
    await logout();
    setActiveTab('guru-absensi');
    setGuruFilterDay('all');
    setSiswaFilterDay('all');
  };

  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Floating background elements */}
      <div className="floating-dots"></div>
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-effect rounded-2xl p-6 mb-6 animate-fade-in-down">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <Logo size="lg" />
              <div className="hidden md:block w-px h-16 bg-gradient-to-b from-transparent via-primary-500/50 to-transparent"></div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold gradient-text">
                  SISTEM ABSENSI DIGITAL
                </h1>
                <p className="text-gray-400 text-sm md:text-base">
                  Panel Admin Rekap Absensi
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-dark-800/50 rounded-xl border border-dark-600">
                <UserIcon className="w-5 h-5 text-primary-400" />
                <div>
                  <p className="text-white font-medium text-sm">{user.name}</p>
                  <p className="text-gray-400 text-xs">{user.role}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-300 border border-red-500/30 rounded-xl hover:bg-red-600/30 transition-all duration-200 button-glow"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'guru-absensi' && (
            <AttendanceTable
              type="guru"
              data={guruAttendance.data}
              loading={guruAttendance.loading}
              filterDay={guruFilterDay}
              onFilterChange={setGuruFilterDay}
              userRole={user.role}
            />
          )}

          {activeTab === 'siswa-absensi' && (
            <AttendanceTable
              type="siswa"
              data={siswaAttendance.data}
              loading={siswaAttendance.loading}
              filterDay={siswaFilterDay}
              onFilterChange={setSiswaFilterDay}
              userRole={user.role}
            />
          )}

          {activeTab === 'map-siswa' && <StudentMap />}

          {activeTab === 'gallery-siswa' && <StudentGallery />}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center animate-fade-in">
          <div className="glass-effect rounded-xl p-4 inline-block">
            <p className="text-gray-400 text-sm">
              © 2025 SMK Muhammadiyah Campaka Purwakarta
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Sistem Manajemen Absensi Digital
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;