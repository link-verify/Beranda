import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  Camera, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  LogOut, 
  LogIn, 
  KeyRound, 
  Sparkles, 
  History, 
  ShieldCheck, 
  RefreshCw, 
  UserCheck, 
  Navigation,
  Smartphone,
  ChevronRight,
  ArrowRight,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateDistanceMeters, getCurrentPosition } from '../utils/geo';
import { Employee } from '../types';

export const EmployeeMobileView: React.FC = () => {
  const { 
    store, 
    employees, 
    currentEmployee, 
    setCurrentEmployee, 
    loginAsEmployee, 
    todayAttendance, 
    attendanceRecords,
    clockInEmployee, 
    clockOutEmployee,
    currentGps,
    updateGpsLocation
  } = useApp();

  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');
  const [pinInput, setPinInput] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState<string>(currentEmployee?.id || employees[0]?.id || '');
  const [loginError, setLoginError] = useState('');
  
  // Scanner Modal & Input States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [manualOtpInput, setManualOtpInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Live GPS Distance to store
  const [liveDistance, setLiveDistance] = useState<number>(0);
  const [isRefreshingGps, setIsRefreshingGps] = useState(false);

  // Today's attendance record for current employee
  const todayRecord = todayAttendance.find((r) => r.employeeId === currentEmployee?.id);
  const isClockedIn = !!todayRecord;
  const isClockedOut = !!todayRecord?.clockOutTime;

  // Recalculate distance
  const refreshDistance = async () => {
    setIsRefreshingGps(true);
    const pos = await getCurrentPosition();
    const dist = calculateDistanceMeters(
      store.latitude,
      store.longitude,
      pos.latitude,
      pos.longitude
    );
    setLiveDistance(dist);
    setIsRefreshingGps(false);
  };

  useEffect(() => {
    refreshDistance();
  }, [store]);

  // Set default employee if none
  useEffect(() => {
    if (!currentEmployee && employees.length > 0) {
      setCurrentEmployee(employees[0]);
    }
  }, [employees, currentEmployee, setCurrentEmployee]);

  // Handle Quick Employee Switch (for demo/convenience or pin)
  const handleSelectEmployee = (emp: Employee) => {
    setCurrentEmployee(emp);
    setActionFeedback(null);
  };

  // Process Clock In
  const handlePerformClockIn = async (qrDataOrOtp: string) => {
    if (!currentEmployee) return;
    setIsProcessing(true);
    setActionFeedback(null);

    const result = await clockInEmployee(currentEmployee.id, qrDataOrOtp, notesInput);
    setIsProcessing(false);

    if (result.success) {
      setActionFeedback({ type: 'success', message: result.message });
      setIsScannerOpen(false);
      setManualOtpInput('');
      setNotesInput('');
    } else {
      setActionFeedback({ type: 'error', message: result.message });
    }
  };

  // Process Clock Out
  const handlePerformClockOut = async () => {
    if (!currentEmployee) return;
    setIsProcessing(true);
    setActionFeedback(null);

    const result = await clockOutEmployee(currentEmployee.id, notesInput);
    setIsProcessing(false);

    if (result.success) {
      setActionFeedback({ type: 'success', message: result.message });
      setNotesInput('');
    } else {
      setActionFeedback({ type: 'error', message: result.message });
    }
  };

  // Personal History
  const personalHistory = attendanceRecords.filter((r) => r.employeeId === currentEmployee?.id);

  const isInsideRadius = liveDistance <= store.geofenceRadiusMeters;

  return (
    <div className="max-w-xl mx-auto px-4 py-5 space-y-4">
      {/* Employee Header Profile Bento Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
              {currentEmployee?.name.charAt(0) || 'K'}
            </div>
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentEmployee?.nip}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight mt-1">
                {currentEmployee?.name}
              </h2>
              <p className="text-xs text-slate-500">
                {currentEmployee?.position}
              </p>
            </div>
          </div>

          {/* Employee Switcher Dropdown */}
          <div className="relative">
            <select
              value={currentEmployee?.id || ''}
              onChange={(e) => {
                const found = employees.find((emp) => emp.id === e.target.value);
                if (found) handleSelectEmployee(found);
              }}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.nip})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Shift Details & Store Name */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 text-slate-600">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Shift: <strong>{currentEmployee?.shiftStart} - {currentEmployee?.shiftEnd}</strong></span>
          </div>
          <div className="text-slate-500 font-medium">
            Toko: <strong className="text-slate-900">{store.name}</strong>
          </div>
        </div>
      </div>

      {/* Real-time GPS Distance Indicator Card */}
      <div className={`p-4 rounded-3xl border transition-all flex items-center justify-between shadow-xs ${
        isInsideRadius
          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
          : 'bg-amber-50/70 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-2xl ${
            isInsideRadius ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
          }`}>
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs">
                {isInsideRadius ? 'Lokasi Valid (Dalam Radius Toko)' : 'Di Luar Radius Toko'}
              </span>
            </div>
            <p className="text-xs opacity-90 mt-0.5">
              Jarak Anda: <strong className="font-mono font-bold">{liveDistance} m</strong> (Batas: {store.geofenceRadiusMeters} m)
            </p>
          </div>
        </div>

        <button
          onClick={refreshDistance}
          disabled={isRefreshingGps}
          className="p-2 rounded-xl hover:bg-black/5 transition-colors"
          title="Perbarui Koordinat GPS"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshingGps ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Action Status Feedback Banner */}
      {actionFeedback && (
        <div className={`p-4 rounded-3xl border flex items-start space-x-3 text-xs font-semibold ${
          actionFeedback.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {actionFeedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <div className="flex-1">
            <p>{actionFeedback.message}</p>
          </div>
        </div>
      )}

      {/* Today Attendance Status & Action Center Bento Box */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-700 flex items-center justify-between">
          <span>Status Absensi Hari Ini</span>
          <span className="text-xs font-normal text-slate-500 normal-case">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </h3>

        {/* Timeline Status Tracker */}
        <div className="grid grid-cols-2 gap-3">
          {/* Clock In Status Box */}
          <div className={`p-4 rounded-2xl border ${
            isClockedIn 
              ? 'bg-emerald-50/60 border-emerald-200' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Jam Masuk</span>
              <LogIn className={`w-4 h-4 ${isClockedIn ? 'text-emerald-600' : 'text-slate-400'}`} />
            </div>
            <div className="mt-2 font-mono text-xl font-bold text-slate-900">
              {todayRecord ? todayRecord.clockInTime : '--:--:--'}
            </div>
            <div className="mt-1 text-[11px]">
              {todayRecord ? (
                <span className={`font-bold ${
                  todayRecord.clockInStatus === 'ON_TIME' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {todayRecord.clockInStatus === 'ON_TIME' ? '✓ Tepat Waktu' : '⚠️ Terlambat'}
                </span>
              ) : (
                <span className="text-slate-400">Belum Clock-In</span>
              )}
            </div>
          </div>

          {/* Clock Out Status Box */}
          <div className={`p-4 rounded-2xl border ${
            isClockedOut 
              ? 'bg-indigo-50/60 border-indigo-200' 
              : isClockedIn 
              ? 'bg-amber-50/60 border-amber-200' 
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Jam Pulang</span>
              <LogOut className={`w-4 h-4 ${isClockedOut ? 'text-indigo-600' : 'text-slate-400'}`} />
            </div>
            <div className="mt-2 font-mono text-xl font-bold text-slate-900">
              {todayRecord?.clockOutTime ? todayRecord.clockOutTime : '--:--:--'}
            </div>
            <div className="mt-1 text-[11px]">
              {todayRecord?.clockOutTime ? (
                <span className="text-indigo-600 font-bold">✓ Selesai Shift</span>
              ) : isClockedIn ? (
                <span className="text-amber-600 font-semibold animate-pulse">Sedang Bekerja</span>
              ) : (
                <span className="text-slate-400">Menunggu Masuk</span>
              )}
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="space-y-3 pt-1">
          {!isClockedIn ? (
            <button
              id="emp-scan-clockin-btn"
              onClick={() => setIsScannerOpen(true)}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm shadow-xs flex items-center justify-center space-x-2 transition-all active:scale-98"
            >
              <Camera className="w-5 h-5" />
              <span>Scan Barcode Toko untuk Masuk</span>
            </button>
          ) : !isClockedOut ? (
            <button
              id="emp-perform-clockout-btn"
              onClick={handlePerformClockOut}
              disabled={isProcessing}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm shadow-xs flex items-center justify-center space-x-2 transition-all active:scale-98"
            >
              <LogOut className="w-5 h-5" />
              <span>{isProcessing ? 'Memproses...' : 'Lakukan Clock-Out (Pulang)'}</span>
            </button>
          ) : (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs font-semibold text-slate-600">
              🎉 Anda telah menyelesaikan absensi hari ini. Sampai jumpa besok!
            </div>
          )}
        </div>
      </div>

      {/* Personal History Bento Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-700 flex items-center gap-1.5 mb-3">
          <History className="w-4 h-4 text-indigo-600" />
          <span>Riwayat Absensi Pribadi Saya</span>
        </h3>

        {personalHistory.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            Belum ada data absensi untuk akun Anda.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {personalHistory.map((rec) => (
              <div 
                key={rec.id}
                className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{rec.date}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      rec.clockInStatus === 'ON_TIME'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {rec.clockInStatus === 'ON_TIME' ? 'Tepat Waktu' : 'Terlambat'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Masuk: {rec.clockInTime} • Pulang: {rec.clockOutTime || 'Aktif'}
                  </p>
                </div>

                <div className="text-right font-mono text-slate-700 text-xs font-bold">
                  {rec.workDurationMinutes ? `${Math.floor(rec.workDurationMinutes / 60)}j ${rec.workDurationMinutes % 60}m` : '-'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scanner & Manual Input Modal */}
      {isScannerOpen && (
        <ScannerModal
          store={store}
          onClose={() => setIsScannerOpen(false)}
          onScanSuccess={handlePerformClockIn}
          isProcessing={isProcessing}
          notesInput={notesInput}
          setNotesInput={setNotesInput}
        />
      )}
    </div>
  );
};

// Subcomponent: Live Camera Scanner & Rolling OTP Input Modal
interface ScannerModalProps {
  store: any;
  onClose: () => void;
  onScanSuccess: (data: string) => void;
  isProcessing: boolean;
  notesInput: string;
  setNotesInput: (val: string) => void;
}

const ScannerModal: React.FC<ScannerModalProps> = ({
  store,
  onClose,
  onScanSuccess,
  isProcessing,
  notesInput,
  setNotesInput,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [activeMode, setActiveMode] = useState<'camera' | 'manual'>('camera');
  const [scanError, setScanError] = useState('');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (activeMode === 'camera') {
      const scanner = new Html5QrcodeScanner(
        'qr-reader-container',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        /* verbose= */ false
      );

      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          scanner.clear();
          onScanSuccess(decodedText);
        },
        (error) => {
          // Continuous frame error, ignore normal empty frames
        }
      );

      return () => {
        try {
          scanner.clear();
        } catch {}
      };
    }
  }, [activeMode, onScanSuccess]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    onScanSuccess(manualCode.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-500" />
            <span>Scan Barcode Toko</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher: Camera vs 6-Digit OTP */}
        <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveMode('camera')}
            className={`py-2 rounded-lg transition-all ${
              activeMode === 'camera'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Kamera Barcode
          </button>
          <button
            onClick={() => setActiveMode('manual')}
            className={`py-2 rounded-lg transition-all ${
              activeMode === 'manual'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Input Kode 6-Digit
          </button>
        </div>

        {activeMode === 'camera' ? (
          <div className="mt-4 space-y-3 text-center">
            <div id="qr-reader-container" className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700" />
            <p className="text-[11px] text-slate-400">
              Arahkan kamera ke Barcode Dinamis yang tampil di layar kasir toko.
            </p>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Masukkan 6-Digit Rolling OTP Toko
              </label>
              <input
                type="text"
                maxLength={6}
                required
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Contoh: 849201"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-mono text-2xl font-black tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1 text-center">
                Kode 6-digit berganti setiap {store.qrRefreshIntervalSec} detik di layar toko.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="Contoh: Masuk shift pagi kasir"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing || manualCode.length < 4}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? 'Memvalidasi...' : 'Kirim Absensi'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
