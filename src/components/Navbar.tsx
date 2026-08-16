import React, { useState, useEffect } from 'react';
import { 
  Store, 
  UserCheck, 
  QrCode, 
  Users, 
  FileSpreadsheet, 
  MapPin, 
  Bell, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Monitor,
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavbarProps {
  activeTab: 'dashboard' | 'kiosk' | 'employees' | 'reports' | 'location';
  setActiveTab: (tab: 'dashboard' | 'kiosk' | 'employees' | 'reports' | 'location') => void;
  onOpenNotifications: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenNotifications }) => {
  const { 
    store, 
    role, 
    setRole, 
    currentEmployee, 
    unreadNotificationCount, 
    soundEnabled, 
    setSoundEnabled,
    todayAttendance,
    employees
  } = useApp();

  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalActiveStaff = employees.filter(e => e.isActive).length;
  const attendedCount = todayAttendance.length;

  return (
    <header className="sticky top-0 z-40 bg-[#F1F5F9]/80 backdrop-blur-md pb-2 pt-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Bento Header Main Box */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs p-3.5 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            {/* Logo & Store Identity */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
                <QrCode className="w-5 h-5 font-bold" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900">
                    PresensiPro <span className="text-indigo-600">{role === 'ADMIN' ? 'Admin' : 'Mobile'}</span>
                  </h1>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {store.code}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Store className="w-3 h-3 text-indigo-500" />
                  <span className="truncate max-w-[200px] sm:max-w-[280px] font-medium">{store.name}</span>
                </p>
              </div>
            </div>

            {/* Center Clock & Quick Stats */}
            <div className="hidden lg:flex items-center space-x-5 bg-slate-50 px-4 py-1.5 rounded-2xl border border-slate-200/80">
              <div className="flex items-center space-x-2 text-slate-600">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-medium text-slate-500">{currentDate}</span>
                <span className="font-mono text-xs font-bold text-slate-900 tracking-wider">{currentTime}</span>
              </div>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="text-slate-500">Kehadiran:</span>
                <span className="font-bold text-emerald-600">{attendedCount}</span>
                <span className="text-slate-400">/</span>
                <span className="font-semibold text-slate-700">{totalActiveStaff} Staf</span>
              </div>
            </div>

            {/* Right Action Controls & User Profile Badge */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Mode Switcher: Admin vs Karyawan */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  id="mode-admin-btn"
                  onClick={() => setRole('ADMIN')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    role === 'ADMIN'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
                <button
                  id="mode-karyawan-btn"
                  onClick={() => setRole('EMPLOYEE')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    role === 'EMPLOYEE'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Karyawan</span>
                </button>
              </div>

              {/* Sound Toggle */}
              <button
                id="toggle-sound-btn"
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Suara Aktif' : 'Suara Dimatikan'}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors border border-slate-200"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </button>

              {/* Notification Bell with Badge */}
              <button
                id="notifications-btn"
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors border border-slate-200"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white animate-pulse">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Profile Pill */}
              <div className="hidden md:flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {role === 'ADMIN' ? 'Andi Wijaya' : (currentEmployee?.name || 'Staf')}
                  </p>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                    {role === 'ADMIN' ? 'Manager Toko' : (currentEmployee?.position || 'Karyawan')}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {role === 'ADMIN' ? 'AW' : (currentEmployee?.name.charAt(0) || 'K')}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation for Admin in Bento Grid Style */}
          {role === 'ADMIN' && (
            <nav className="flex space-x-1.5 sm:space-x-2 border-t border-slate-100 mt-3 pt-2.5 overflow-x-auto scrollbar-none">
              <button
                id="nav-tab-dashboard"
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Dashboard Bento</span>
              </button>

              <button
                id="nav-tab-kiosk"
                onClick={() => setActiveTab('kiosk')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'kiosk'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Barcode Kiosk Toko</span>
              </button>

              <button
                id="nav-tab-employees"
                onClick={() => setActiveTab('employees')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'employees'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span>Daftar Karyawan</span>
              </button>

              <button
                id="nav-tab-reports"
                onClick={() => setActiveTab('reports')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'reports'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
                <span>Laporan & Ekspor</span>
              </button>

              <button
                id="nav-tab-location"
                onClick={() => setActiveTab('location')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  activeTab === 'location'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>Geofence GPS</span>
              </button>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};
