import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  Sliders, 
  Save, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Radio, 
  Layers, 
  Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getCurrentPosition, calculateDistanceMeters } from '../utils/geo';

export const StoreLocationSettings: React.FC = () => {
  const { store, updateStoreSettings, todayAttendance, employees } = useApp();

  const [name, setName] = useState(store.name);
  const [code, setCode] = useState(store.code);
  const [address, setAddress] = useState(store.address);
  const [latitude, setLatitude] = useState(store.latitude);
  const [longitude, setLongitude] = useState(store.longitude);
  const [geofenceRadius, setGeofenceRadius] = useState(store.geofenceRadiusMeters);
  const [workStartTime, setWorkStartTime] = useState(store.workStartTime);
  const [workEndTime, setWorkEndTime] = useState(store.workEndTime);
  const [lateTolerance, setLateTolerance] = useState(store.lateToleranceMinutes);
  const [qrRefreshSec, setQrRefreshSec] = useState(store.qrRefreshIntervalSec);
  const [requireGps, setRequireGps] = useState(store.requireGpsValidation);

  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleFetchCurrentLocation = async () => {
    setIsFetchingGps(true);
    const pos = await getCurrentPosition();
    setLatitude(Number(pos.latitude.toFixed(6)));
    setLongitude(Number(pos.longitude.toFixed(6)));
    setIsFetchingGps(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings({
      name,
      code,
      address,
      latitude: Number(latitude),
      longitude: Number(longitude),
      geofenceRadiusMeters: Number(geofenceRadius),
      workStartTime,
      workEndTime,
      lateToleranceMinutes: Number(lateTolerance),
      qrRefreshIntervalSec: Number(qrRefreshSec),
      requireGpsValidation: requireGps,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
      {/* Header Bento Box */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Geofence & Security
          </span>
          <span className="text-xs text-slate-500 font-semibold">
            Radius Aktif: {geofenceRadius} Meter
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-1">
          Pengaturan Lokasi GPS & Geofencing Toko
        </h2>
        <p className="text-xs text-slate-500">
          Tentukan titik koordinat toko fisik, batas toleransi radius absensi karyawan, dan aturan rolling barcode.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left Bento Tile: Form Configuration (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <form onSubmit={handleSave} className="space-y-5">
            {/* Store Identity */}
            <div className="space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Identitas & Alamat Toko</span>
              </h3>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Toko / Cabang
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kode Toko
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alamat Lengkap Toko
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* GPS Coordinates & Geofencing */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <span>Koordinat Geolocation & Radius</span>
                </h3>

                <button
                  type="button"
                  onClick={handleFetchCurrentLocation}
                  disabled={isFetchingGps}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-all border border-indigo-200"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isFetchingGps ? 'animate-spin' : ''}`} />
                  <span>Ambil GPS Saat Ini</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Latitude Toko
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Longitude Toko
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Radius Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Radius Geofencing (Jarak Maksimal):</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono text-xs font-bold">
                    {geofenceRadius} Meter
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={geofenceRadius}
                  onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <p className="text-[11px] text-slate-400">
                  Karyawan yang berada lebih dari {geofenceRadius} meter dari titik toko akan ditolak atau ditandai di luar radius.
                </p>
              </div>
            </div>

            {/* Shift Times & Rolling Barcode */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Aturan Shift & Keamanan Barcode</span>
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jam Standar Masuk Toko
                  </label>
                  <input
                    type="time"
                    value={workStartTime}
                    onChange={(e) => setWorkStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jam Standar Pulang Toko
                  </label>
                  <input
                    type="time"
                    value={workEndTime}
                    onChange={(e) => setWorkEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Toleransi Terlambat (Menit)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={lateTolerance}
                    onChange={(e) => setLateTolerance(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Interval Rolling Barcode (Detik)
                  </label>
                  <select
                    value={qrRefreshSec}
                    onChange={(e) => setQrRefreshSec(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value={15}>15 Detik (Sangat Ketat)</option>
                    <option value={20}>20 Detik (Standar Rekomendasi)</option>
                    <option value={30}>30 Detik</option>
                    <option value={60}>60 Detik</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              {saveSuccess ? (
                <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pengaturan berhasil disimpan!</span>
                </div>
              ) : <div />}

              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Bento Tile: Visual Geofence Radar Simulator (5 cols) */}
        <div className="lg:col-span-5 bg-indigo-950 text-white p-6 rounded-3xl border border-indigo-900 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Radio className="w-5 h-5 text-indigo-400 animate-pulse" />
                <h3 className="font-bold text-sm sm:text-base text-white">Radar Geofence Toko</h3>
              </div>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-indigo-200 font-mono font-bold border border-white/10">
                {geofenceRadius}m Range
              </span>
            </div>

            {/* Interactive Radar Visual Circle */}
            <div className="relative w-full aspect-square max-w-[260px] mx-auto my-4 rounded-full border-2 border-dashed border-indigo-400/40 bg-indigo-900/40 flex items-center justify-center shadow-inner">
              {/* Outer circle rings */}
              <div className="absolute inset-4 rounded-full border border-indigo-800/60" />
              <div className="absolute inset-12 rounded-full border border-indigo-700/40" />
              <div className="absolute inset-20 rounded-full border border-indigo-400/30 bg-indigo-400/10 animate-ping opacity-25" />

              {/* Center Store Pin */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold shadow-md">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold mt-1 text-indigo-200 bg-indigo-950/90 px-2 py-0.5 rounded border border-indigo-800">
                  {store.name}
                </span>
              </div>

              {/* Sample Checked In Employee Dots inside radar */}
              {todayAttendance.map((rec, i) => {
                const angle = (i * 115) % 360;
                const distanceFactor = Math.min(0.85, (rec.clockInDistanceMeters || 10) / Math.max(1, geofenceRadius));
                const rad = (angle * Math.PI) / 180;
                const x = Math.cos(rad) * (distanceFactor * 90);
                const y = Math.sin(rad) * (distanceFactor * 90);

                return (
                  <div
                    key={rec.id}
                    style={{ transform: `translate(${x}px, ${y}px)` }}
                    title={`${rec.employeeName} (${rec.clockInDistanceMeters}m)`}
                    className="absolute z-20 group cursor-pointer"
                  >
                    <div className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-md flex items-center justify-center text-[8px] font-bold text-slate-900">
                      {rec.employeeName.charAt(0)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Radar Legend */}
          <div className="space-y-2 text-xs text-indigo-200 mt-4 border-t border-indigo-900/80 pt-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" />
                Titik Pusat Toko:
              </span>
              <span className="font-mono text-white font-bold">{latitude}, {longitude}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                Karyawan Hadir:
              </span>
              <span className="font-bold text-white">{todayAttendance.length} Titik Terdeteksi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
