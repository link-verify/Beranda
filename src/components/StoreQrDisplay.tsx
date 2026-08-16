import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { 
  QrCode, 
  RefreshCw, 
  ShieldCheck, 
  Maximize, 
  Minimize, 
  Clock, 
  Sparkles, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  Store as StoreIcon,
  Volume2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { stringifyQrPayload } from '../utils/security';

export const StoreQrDisplay: React.FC = () => {
  const { 
    store, 
    currentQrPayload, 
    qrCountdownSec, 
    refreshQrNow, 
    todayAttendance, 
    employees, 
    soundEnabled 
  } = useApp();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentMicroTime, setCurrentMicroTime] = useState('');

  // Live timer for anti-screenshot watermark
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const ms = String(d.getMilliseconds()).padStart(3, '0');
      setCurrentMicroTime(`${time}.${ms}`);
    };
    const timer = setInterval(updateTime, 100);
    return () => clearInterval(timer);
  }, []);

  // Render QR Code onto Canvas whenever payload updates
  useEffect(() => {
    if (!canvasRef.current) return;

    const qrData = stringifyQrPayload(currentQrPayload);

    QRCode.toCanvas(
      canvasRef.current,
      qrData,
      {
        width: 320,
        margin: 2,
        color: {
          dark: '#0f172a', // slate-900
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      },
      (error) => {
        if (error) console.error('Gagal merender QR Code', error);
      }
    );
  }, [currentQrPayload]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const progressPercent = ((store.qrRefreshIntervalSec - qrCountdownSec) / store.qrRefreshIntervalSec) * 100;
  const recentAttendances = todayAttendance.slice(0, 5);

  return (
    <div 
      ref={containerRef}
      className={`min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center p-4 sm:p-6 transition-all ${
        isFullscreen ? 'bg-slate-950 text-white min-h-screen py-10' : ''
      }`}
    >
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Bento Tile: Dynamic QR Code Box (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-200 text-center relative overflow-hidden flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3 text-left">
              <div className="p-2.5 bg-indigo-50 rounded-2xl text-indigo-600 border border-indigo-100">
                <StoreIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-tight">
                  {store.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Barcode Absensi Toko (Rolling OTP)
                </p>
              </div>
            </div>

            <button
              id="kiosk-fullscreen-btn"
              onClick={toggleFullscreen}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title={isFullscreen ? 'Keluar Layar Penuh' : 'Mode Layar Penuh Kiosk'}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>

          {/* QR Code Canvas Frame with Anti-Tamper Hologram Border */}
          <div className="relative inline-block my-2 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-indigo-200 shadow-inner">
            <canvas ref={canvasRef} className="rounded-xl mx-auto shadow-sm max-w-full" />
            
            {/* Live Anti-Screenshot Running Timestamp Watermark */}
            <div className="mt-2 text-[11px] font-mono text-slate-500 flex items-center justify-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              <span className="font-semibold">LIVE STAMP:</span>
              <span className="font-bold text-slate-800">{currentMicroTime}</span>
            </div>
          </div>

          {/* Countdown & Refresh Indicator */}
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${qrCountdownSec <= 3 ? 'animate-spin' : ''}`} />
                Barcode berganti otomatis dalam:
              </span>
              <span className="text-indigo-600 font-mono text-sm font-bold">
                {qrCountdownSec}s
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Fallback 6-Digit OTP Box (If camera cannot read) */}
          <div className="mt-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="text-left">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                <span>Kode Manual (Fallback OTP):</span>
              </div>
              <span className="text-xl font-mono font-extrabold tracking-widest text-slate-900">
                {currentQrPayload.otpCode}
              </span>
            </div>

            <button
              id="refresh-qr-manual-btn"
              onClick={refreshQrNow}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ganti Sekarang</span>
            </button>
          </div>
        </div>

        {/* Right Bento Column: Security Features & Real-time Check-In Feed (5 cols) */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          {/* Security Banner Bento Tile */}
          <div className="bg-indigo-900 text-white p-5 rounded-3xl border border-indigo-950 shadow-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-white/10 text-indigo-200 rounded-xl border border-white/10">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-white">Sistem Proteksi Anti-Curang</h4>
                <p className="text-xs text-indigo-200">Validasi 3 Lapis Keamanan</p>
              </div>
            </div>

            <ul className="space-y-2 text-xs text-indigo-100">
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Rolling Barcode:</strong> Berputar setiap {store.qrRefreshIntervalSec} detik, screenshot otomatis kadaluwarsa.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Single-Use Token:</strong> Barcode yang discan langsung hangus untuk karyawan lain.</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Geofence GPS:</strong> Wajib berada dalam radius {store.geofenceRadiusMeters}m dari toko.</span>
              </li>
            </ul>
          </div>

          {/* Live Recent Check-Ins Bento Tile */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex-1">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Absensi Hari Ini</span>
              </h4>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {todayAttendance.length} / {employees.length} Hadir
              </span>
            </div>

            {recentAttendances.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-medium">
                Belum ada karyawan yang melakukan scan hari ini.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {recentAttendances.map((rec) => (
                  <div 
                    key={rec.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{rec.employeeName}</p>
                      <p className="text-[11px] text-slate-500">
                        {rec.position} • {rec.clockInTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.clockInStatus === 'ON_TIME'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {rec.clockInStatus === 'ON_TIME' ? 'Tepat Waktu' : 'Terlambat'}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Jarak: {rec.clockInDistanceMeters}m
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
