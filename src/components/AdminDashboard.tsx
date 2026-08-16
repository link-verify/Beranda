import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  QrCode, 
  FileSpreadsheet, 
  MapPin, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Sparkles,
  Smartphone,
  ExternalLink,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportAttendanceToExcel, exportAttendanceToPdf } from '../utils/exportReport';

interface AdminDashboardProps {
  onGoToKiosk: () => void;
  onGoToReports: () => void;
  onGoToEmployees: () => void;
  onGoToLocation: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onGoToKiosk,
  onGoToReports,
  onGoToEmployees,
  onGoToLocation,
}) => {
  const { store, employees, todayAttendance, attendanceRecords } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ON_TIME' | 'LATE' | 'NOT_ATTENDED' | 'WORKING'>('ALL');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Summary Metrics calculations
  const activeEmployees = employees.filter((e) => e.isActive);
  const totalStaff = activeEmployees.length;
  
  const attendedRecords = todayAttendance;
  const attendedEmpIds = new Set(attendedRecords.map((r) => r.employeeId));
  
  const onTimeCount = attendedRecords.filter((r) => r.clockInStatus === 'ON_TIME').length;
  const lateCount = attendedRecords.filter((r) => r.clockInStatus === 'LATE').length;
  const currentlyWorkingCount = attendedRecords.filter((r) => !r.clockOutTime).length;
  const clockedOutCount = attendedRecords.filter((r) => !!r.clockOutTime).length;
  const absentCount = Math.max(0, totalStaff - attendedRecords.length);

  const onTimeRate = attendedRecords.length > 0 ? Math.round((onTimeCount / attendedRecords.length) * 100) : 0;

  // Combine active employees with their attendance status today for complete visibility
  const combinedEmployeeRows = useMemo(() => {
    return activeEmployees.map((emp) => {
      const attRecord = attendedRecords.find((r) => r.employeeId === emp.id);
      return {
        employee: emp,
        attendance: attRecord || null,
        hasAttended: !!attRecord,
        isWorking: attRecord ? !attRecord.clockOutTime : false,
      };
    });
  }, [activeEmployees, attendedRecords]);

  // Filter rows based on search and status filter
  const filteredRows = useMemo(() => {
    return combinedEmployeeRows.filter((item) => {
      const matchesSearch =
        item.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.employee.nip.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.employee.position.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'ON_TIME') return item.attendance?.clockInStatus === 'ON_TIME';
      if (statusFilter === 'LATE') return item.attendance?.clockInStatus === 'LATE';
      if (statusFilter === 'NOT_ATTENDED') return !item.hasAttended;
      if (statusFilter === 'WORKING') return item.isWorking;
      return true;
    });
  }, [combinedEmployeeRows, searchQuery, statusFilter]);

  const handleExportTodayExcel = () => {
    exportAttendanceToExcel(todayAttendance, store, `Hari Ini (${todayStr})`);
  };

  const handleExportTodayPdf = () => {
    exportAttendanceToPdf(todayAttendance, store, `Hari Ini (${todayStr})`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
      {/* Bento Grid Top Row (12 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Bento Cell 1: Dynamic Barcode Quick Widget (4 cols) */}
        <section className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 flex flex-col justify-between items-center text-center">
          <div className="w-full text-left mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Barcode Dinamis</h2>
              <p className="text-[11px] text-slate-500">Update rolling OTP tiap {store.qrRefreshIntervalSec} detik</p>
            </div>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-indigo-200">
              Active
            </span>
          </div>

          {/* Barcode Frame */}
          <div className="relative p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 my-1 w-full flex flex-col items-center justify-center">
            <div className="w-40 h-40 bg-white p-3 shadow-inner rounded-xl flex items-center justify-center relative overflow-hidden">
              <div className="w-full h-full bg-[radial-gradient(#4F46E5_1px,transparent_1px)] [background-size:8px_8px] opacity-15" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <QrCode className="w-24 h-24 text-slate-800" />
                <span className="text-[10px] font-mono font-bold text-indigo-600 mt-1">
                  ANTI-SCREENSHOT
                </span>
              </div>
            </div>
            <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] px-2.5 py-0.5 rounded-full font-bold shadow-xs">
              LIVE OTP
            </div>
          </div>

          <div className="mt-4 w-full space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">Batas Geofence:</span>
              <span className="font-mono font-bold text-indigo-600">{store.geofenceRadiusMeters} meter</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full w-[85%] rounded-full animate-pulse" />
            </div>
            <button
              id="admin-bento-kiosk-btn"
              onClick={onGoToKiosk}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>Buka Layar Barcode Toko (Kiosk)</span>
            </button>
          </div>
        </section>

        {/* Bento Cell 2: Real-time Location Monitoring / Radar (8 cols) */}
        <section className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-200 flex flex-col justify-between overflow-hidden relative">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Pemantauan Lokasi Real-time
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                Koordinat Toko: {store.latitude.toFixed(4)}, {store.longitude.toFixed(4)}
              </p>
            </div>
            <span className="flex items-center text-[10px] bg-red-50 text-red-600 px-2.5 py-1 rounded-full font-bold ring-1 ring-red-200">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping mr-1.5" />
              LIVE RADAR
            </span>
          </div>

          {/* Interactive Radar Stage Canvas */}
          <div className="w-full h-44 bg-slate-50 rounded-2xl relative overflow-hidden border border-slate-200/80 bento-map-grid flex items-center justify-center">
            {/* Center Store Pin */}
            <div className="absolute flex flex-col items-center z-10">
              <div className="w-4 h-4 bg-amber-500 rounded-full border-2 border-white shadow-md animate-pulse flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>
              <span className="mt-1 bg-slate-900 text-white px-2 py-0.5 rounded-md shadow-xs text-[9px] font-bold">
                {store.name}
              </span>
            </div>

            {/* Geofence Ring */}
            <div className="absolute w-36 h-36 rounded-full border border-indigo-400/40 bg-indigo-500/5 animate-pulse" />
            <div className="absolute w-60 h-60 rounded-full border border-indigo-300/20" />

            {/* Simulated Active Employees on Radar */}
            {attendedRecords.slice(0, 4).map((rec, i) => {
              const positions = [
                { top: '22%', left: '26%' },
                { bottom: '25%', right: '28%' },
                { top: '30%', right: '22%' },
                { bottom: '20%', left: '32%' },
              ];
              const pos = positions[i % positions.length];
              return (
                <div key={rec.id} className="absolute flex flex-col items-center z-20" style={pos}>
                  <div className="w-3.5 h-3.5 bg-indigo-600 rounded-full border-2 border-white shadow-md" />
                  <span className="mt-0.5 bg-white text-slate-800 px-1.5 py-0.5 rounded shadow-xs text-[9px] font-bold border border-slate-200">
                    {rec.employeeName.split(' ')[0]} ({rec.clockInDistanceMeters}m)
                  </span>
                </div>
              );
            })}

            {attendedRecords.length === 0 && (
              <div className="text-center text-xs text-slate-400 font-medium z-10 bg-white/80 px-3 py-1.5 rounded-xl border border-slate-200">
                Menunggu absensi staf hari ini...
              </div>
            )}
          </div>

          {/* 3 Metric Mini Bento Blocks */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-indigo-50 p-3.5 rounded-2xl border border-indigo-100">
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Aktif Clock-In</p>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <p className="text-2xl font-black text-slate-900">{attendedRecords.length}</p>
                <span className="text-[11px] text-slate-500 font-semibold">/ {totalStaff}</span>
              </div>
            </div>

            <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100">
              <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Tepat Waktu</p>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <p className="text-2xl font-black text-emerald-600">{onTimeRate}%</p>
                <span className="text-[11px] text-emerald-700 font-medium">({onTimeCount} Staf)</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sedang Bekerja</p>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <p className="text-2xl font-black text-slate-800">{currentlyWorkingCount}</p>
                <span className="text-[11px] text-slate-500 font-medium">({clockedOutCount} Pulang)</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Bento Grid Middle Row (12 columns) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Bento Cell 3: Daftar Karyawan Quick Tile (5 cols) */}
        <section className="md:col-span-5 bg-white rounded-3xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Daftar Karyawan</h2>
              <p className="text-[11px] text-slate-400">Total {employees.length} staf terdaftar</p>
            </div>
            <button
              onClick={onGoToEmployees}
              className="text-indigo-600 hover:text-indigo-700 text-xs font-bold bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-xl transition-colors"
            >
              + Kelola
            </button>
          </div>

          <div className="flex-1 space-y-2 max-h-48 overflow-y-auto pr-1">
            {employees.slice(0, 4).map((emp) => {
              const att = attendedRecords.find((r) => r.employeeId === emp.id);
              return (
                <div key={emp.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{emp.name}</p>
                      <p className="text-[10px] text-slate-500">{emp.position}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    att 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {att ? 'Hadir' : 'Offline'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bento Cell 4: Laporan Harian Dark Tile (3 cols) */}
        <section className="md:col-span-3 bg-indigo-900 rounded-3xl p-5 shadow-lg text-white flex flex-col justify-between border border-indigo-950">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold">Laporan Harian</h2>
              <FileSpreadsheet className="w-4 h-4 text-indigo-300" />
            </div>
            <p className="text-[11px] text-indigo-200 leading-tight">
              Unduh data validitas absensi dan durasi kerja hari ini.
            </p>
          </div>

          <div className="space-y-2 mt-4">
            <button
              onClick={handleExportTodayPdf}
              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition-all text-white font-semibold text-xs"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={handleExportTodayExcel}
              className="w-full bg-white text-indigo-950 hover:bg-indigo-50 py-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-950/30 transition-all font-bold text-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export Excel</span>
            </button>
          </div>
        </section>

        {/* Bento Cell 5: Status Notifikasi Push (4 cols) */}
        <section className="md:col-span-4 bg-white rounded-3xl p-5 shadow-xs border border-slate-200 flex flex-col justify-center">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Status Notifikasi Push
          </h2>
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 border border-amber-200/50 flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900">Sistem Notifikasi Aktif</p>
              <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
                Notifikasi dikirim otomatis saat karyawan Clock-in tepat waktu atau di luar radius.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Bento Grid Bottom Table Cell: Attendance Log (12 cols) */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Controls Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id="admin-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama karyawan, NIP, atau jabatan..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Pills in Bento style */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({combinedEmployeeRows.length})
            </button>
            <button
              onClick={() => setStatusFilter('ON_TIME')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === 'ON_TIME'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Tepat Waktu ({onTimeCount})
            </button>
            <button
              onClick={() => setStatusFilter('LATE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === 'LATE'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Terlambat ({lateCount})
            </button>
            <button
              onClick={() => setStatusFilter('WORKING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === 'WORKING'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              Sedang Bekerja ({currentlyWorkingCount})
            </button>
            <button
              onClick={() => setStatusFilter('NOT_ATTENDED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                statusFilter === 'NOT_ATTENDED'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              Belum Hadir ({absentCount})
            </button>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Karyawan</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">Jam Masuk</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Jarak GPS</th>
                <th className="py-3 px-4">Jam Pulang</th>
                <th className="py-3 px-4">Durasi</th>
                <th className="py-3 px-4 text-right">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Tidak ada data karyawan yang cocok dengan filter pencarian ini.
                  </td>
                </tr>
              ) : (
                filteredRows.map(({ employee, attendance, hasAttended, isWorking }) => {
                  return (
                    <tr 
                      key={employee.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Karyawan Profile */}
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                            {employee.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">
                              {employee.name}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {employee.nip} • {employee.position}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Shift */}
                      <td className="py-3 px-4 font-mono text-slate-600 text-xs">
                        {employee.shiftStart} - {employee.shiftEnd}
                      </td>

                      {/* Jam Masuk */}
                      <td className="py-3 px-4">
                        {attendance ? (
                          <div className="flex items-center space-x-1.5 font-mono font-bold text-slate-900">
                            <Clock className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{attendance.clockInTime}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium italic text-xs">
                            Belum Masuk
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {attendance ? (
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            attendance.clockInStatus === 'ON_TIME'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {attendance.clockInStatus === 'ON_TIME' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Tepat Waktu</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3 h-3 text-rose-600" />
                                <span>Terlambat</span>
                              </>
                            )}
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
                            Menunggu
                          </span>
                        )}
                      </td>

                      {/* Jarak GPS Masuk */}
                      <td className="py-3 px-4">
                        {attendance ? (
                          <div className="flex items-center space-x-1.5">
                            <MapPin className={`w-3.5 h-3.5 ${
                              (attendance.clockInDistanceMeters || 0) <= store.geofenceRadiusMeters
                                ? 'text-indigo-600'
                                : 'text-amber-500'
                            }`} />
                            <span className="font-mono text-xs font-bold text-slate-800">
                              {attendance.clockInDistanceMeters} m
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Jam Pulang */}
                      <td className="py-3 px-4">
                        {attendance?.clockOutTime ? (
                          <div className="flex items-center space-x-1.5 font-mono text-slate-900 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{attendance.clockOutTime}</span>
                          </div>
                        ) : attendance ? (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                            Sedang Bekerja
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Durasi Kerja */}
                      <td className="py-3 px-4 font-mono text-xs text-slate-700">
                        {attendance?.workDurationMinutes ? (
                          <span>
                            {Math.floor(attendance.workDurationMinutes / 60)}j {attendance.workDurationMinutes % 60}m
                          </span>
                        ) : attendance ? (
                          <span className="text-indigo-600 font-semibold">Aktif</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Catatan / Validasi */}
                      <td className="py-3 px-4 text-right">
                        {attendance ? (
                          <span className="text-xs text-slate-600 truncate max-w-[140px] inline-block font-medium">
                            {attendance.clockInNotes || 'Barcode Dinamis'}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
