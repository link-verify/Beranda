import React, { useState, useMemo } from 'react';
import { 
  FileSpreadsheet, 
  ArrowUpRight, 
  Calendar, 
  Filter, 
  Download, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  MapPin,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { exportAttendanceToExcel, exportAttendanceToPdf } from '../utils/exportReport';

export const AttendanceReports: React.FC = () => {
  const { store, employees, attendanceRecords } = useApp();

  const [dateFilterMode, setDateFilterMode] = useState<'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM'>('TODAY');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter records based on selected date mode and filters
  const filteredRecords = useMemo(() => {
    const now = new Date();
    
    return attendanceRecords.filter((rec) => {
      // Date Filter
      if (dateFilterMode === 'TODAY') {
        if (rec.date !== todayStr) return false;
      } else if (dateFilterMode === 'WEEK') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        const weekAgoStr = weekAgo.toISOString().split('T')[0];
        if (rec.date < weekAgoStr || rec.date > todayStr) return false;
      } else if (dateFilterMode === 'MONTH') {
        const monthAgo = new Date();
        monthAgo.setDate(now.getDate() - 30);
        const monthAgoStr = monthAgo.toISOString().split('T')[0];
        if (rec.date < monthAgoStr || rec.date > todayStr) return false;
      } else if (dateFilterMode === 'CUSTOM') {
        if (customStartDate && rec.date < customStartDate) return false;
        if (customEndDate && rec.date > customEndDate) return false;
      }

      // Employee Filter
      if (selectedEmployeeId !== 'ALL' && rec.employeeId !== selectedEmployeeId) {
        return false;
      }

      // Status Filter
      if (selectedStatus !== 'ALL') {
        if (selectedStatus === 'ON_TIME' && rec.clockInStatus !== 'ON_TIME') return false;
        if (selectedStatus === 'LATE' && rec.clockInStatus !== 'LATE') return false;
        if (selectedStatus === 'OUTSIDE_RADIUS' && rec.clockInStatus !== 'OUTSIDE_RADIUS') return false;
      }

      return true;
    });
  }, [attendanceRecords, dateFilterMode, customStartDate, customEndDate, selectedEmployeeId, selectedStatus, todayStr]);

  // Summary Metrics for the filtered range
  const totalEntries = filteredRecords.length;
  const onTimeEntries = filteredRecords.filter((r) => r.clockInStatus === 'ON_TIME').length;
  const lateEntries = filteredRecords.filter((r) => r.clockInStatus === 'LATE').length;
  const onTimePercentage = totalEntries > 0 ? Math.round((onTimeEntries / totalEntries) * 100) : 0;
  
  const totalWorkMinutes = filteredRecords.reduce((acc, curr) => acc + (curr.workDurationMinutes || 0), 0);
  const totalHoursStr = `${Math.floor(totalWorkMinutes / 60)} Jam ${totalWorkMinutes % 60} Menit`;

  const getFilterDescription = () => {
    let desc = 'Hari Ini';
    if (dateFilterMode === 'WEEK') desc = '7 Hari Terakhir';
    if (dateFilterMode === 'MONTH') desc = '30 Hari Terakhir';
    if (dateFilterMode === 'CUSTOM') desc = `${customStartDate || 'Awal'} s/d ${customEndDate || 'Akhir'}`;
    if (selectedEmployeeId !== 'ALL') {
      const emp = employees.find(e => e.id === selectedEmployeeId);
      if (emp) desc += ` - ${emp.name}`;
    }
    return desc;
  };

  const handleExportExcel = () => {
    exportAttendanceToExcel(filteredRecords, store, getFilterDescription());
  };

  const handleExportPdf = () => {
    exportAttendanceToPdf(filteredRecords, store, getFilterDescription());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
      {/* Header & Export Actions Bento Box */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Export Center
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Toko: {store.name}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-1">
            Laporan Absensi & Rekapitulasi
          </h2>
          <p className="text-xs text-slate-500">
            Unduh rekapitulasi absensi harian, mingguan, atau bulanan dalam format resmi Excel (.xlsx) dan PDF.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            id="report-export-excel-btn"
            onClick={handleExportExcel}
            className="flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Unduh Excel (.xlsx)</span>
          </button>

          <button
            id="report-export-pdf-btn"
            onClick={handleExportPdf}
            className="flex items-center space-x-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>Unduh PDF (.pdf)</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bento Box */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Date Presets */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setDateFilterMode('TODAY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateFilterMode === 'TODAY'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setDateFilterMode('WEEK')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateFilterMode === 'WEEK'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Hari Terakhir
            </button>
            <button
              onClick={() => setDateFilterMode('MONTH')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateFilterMode === 'MONTH'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setDateFilterMode('CUSTOM')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateFilterMode === 'CUSTOM'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kustom Rentang
            </button>
          </div>

          {/* Employee & Status Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Employee Select */}
            <div className="flex items-center space-x-1.5">
              <label className="text-xs font-bold text-slate-500">Karyawan:</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Karyawan ({employees.length})</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.nip})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Select */}
            <div className="flex items-center space-x-1.5">
              <label className="text-xs font-bold text-slate-500">Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Semua Status</option>
                <option value="ON_TIME">Tepat Waktu</option>
                <option value="LATE">Terlambat</option>
              </select>
            </div>
          </div>
        </div>

        {/* Custom Date Input Bar if active */}
        {dateFilterMode === 'CUSTOM' && (
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center space-x-2">
              <span className="text-slate-500 font-medium">Dari Tanggal:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-slate-500 font-medium">Sampai Tanggal:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900"
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary KPI Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold">Total Absensi</span>
          <div className="mt-1 text-2xl font-extrabold text-slate-900">
            {totalEntries} <span className="text-xs font-semibold text-slate-400">kali</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold">Tepat Waktu</span>
          <div className="mt-1 text-2xl font-extrabold text-emerald-600">
            {onTimeEntries} <span className="text-xs font-semibold text-emerald-700">({onTimePercentage}%)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold">Keterlambatan</span>
          <div className="mt-1 text-2xl font-extrabold text-rose-600">
            {lateEntries} <span className="text-xs font-semibold text-rose-700">kali</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-bold">Akumulasi Jam Kerja</span>
          <div className="mt-1 text-lg font-extrabold text-indigo-600">
            {totalHoursStr}
          </div>
        </div>
      </div>

      {/* Report Table Bento Box */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            <span>Pratinjau Data Laporan ({filteredRecords.length} Baris)</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Periode: {getFilterDescription()}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">NIP & Nama</th>
                <th className="py-3 px-4">Jabatan</th>
                <th className="py-3 px-4">Jam Masuk</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Jarak GPS</th>
                <th className="py-3 px-4">Jam Pulang</th>
                <th className="py-3 px-4">Durasi</th>
                <th className="py-3 px-4">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                    Tidak ada rekaman absensi pada periode atau filter ini.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {rec.date}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{rec.employeeName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{rec.employeeNip}</p>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {rec.position}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                      {rec.clockInTime}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        rec.clockInStatus === 'ON_TIME'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {rec.clockInStatus === 'ON_TIME' ? 'Tepat Waktu' : 'Terlambat'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 font-medium">
                      {rec.clockInDistanceMeters !== undefined ? `${rec.clockInDistanceMeters}m` : '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-800 font-medium">
                      {rec.clockOutTime || <span className="text-amber-600 font-semibold italic">Sedang Kerja</span>}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700 font-bold">
                      {rec.workDurationMinutes ? `${Math.floor(rec.workDurationMinutes / 60)}j ${rec.workDurationMinutes % 60}m` : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs truncate max-w-[150px]" title={rec.clockInNotes}>
                      {rec.clockInNotes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
