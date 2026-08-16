import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  StoreSettings, 
  Employee, 
  AttendanceRecord, 
  AppNotification, 
  UserRole,
  DynamicQrPayload
} from '../types';
import { calculateDistanceMeters, getCurrentPosition } from '../utils/geo';
import { generateDynamicQrPayload, validateQrScan } from '../utils/security';
import { soundFx } from '../utils/audio';
import { 
  fireOnTimeCelebration, 
  fireLateNotification, 
  sendBrowserPushNotification,
  requestNotificationPermission 
} from '../utils/notifications';

// Initial Mock Store
const DEFAULT_STORE: StoreSettings = {
  id: 'store_001',
  name: 'Toko Berkah Utama & Mart',
  code: 'TBK-01',
  address: 'Jl. Sudirman No. 45, Jakarta Pusat (Kawasan Toko Utama)',
  latitude: -6.2088,
  longitude: 106.8456,
  geofenceRadiusMeters: 80, // 80 meters around store
  workStartTime: '08:00',
  workEndTime: '17:00',
  lateToleranceMinutes: 15,
  qrRefreshIntervalSec: 20, // refreshes every 20 seconds
  allowManualOtpFallback: true,
  requireGpsValidation: true,
};

// Initial Mock Employees
const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'emp_001',
    nip: 'EMP-2026-001',
    name: 'Ahmad Fauzi',
    email: 'ahmad.fauzi@tokoberkah.com',
    phone: '081234567890',
    position: 'Kepala Kasir & Store Supervisor',
    pin: '1234',
    shiftStart: '08:00',
    shiftEnd: '17:00',
    isActive: true,
    joinedDate: '2025-01-10',
  },
  {
    id: 'emp_002',
    nip: 'EMP-2026-002',
    name: 'Siti Rahmawati',
    email: 'siti.rahma@tokoberkah.com',
    phone: '082198765432',
    position: 'Kasir & Front Office',
    pin: '2345',
    shiftStart: '08:00',
    shiftEnd: '17:00',
    isActive: true,
    joinedDate: '2025-02-15',
  },
  {
    id: 'emp_003',
    nip: 'EMP-2026-003',
    name: 'Budi Pratama',
    email: 'budi.pratama@tokoberkah.com',
    phone: '085711223344',
    position: 'Staf Gudang & Logistik',
    pin: '3456',
    shiftStart: '08:00',
    shiftEnd: '17:00',
    isActive: true,
    joinedDate: '2025-03-01',
  },
  {
    id: 'emp_004',
    nip: 'EMP-2026-004',
    name: 'Dewi Lestari',
    email: 'dewi.lestari@tokoberkah.com',
    phone: '087855667788',
    position: 'Pramuniaga Toko',
    pin: '4567',
    shiftStart: '08:00',
    shiftEnd: '17:00',
    isActive: true,
    joinedDate: '2025-04-12',
  },
  {
    id: 'emp_005',
    nip: 'EMP-2026-005',
    name: 'Rian Saputra',
    email: 'rian.saputra@tokoberkah.com',
    phone: '089633445566',
    position: 'Inventory & Display Staf',
    pin: '5678',
    shiftStart: '08:00',
    shiftEnd: '17:00',
    isActive: true,
    joinedDate: '2025-05-20',
  },
];

// Generate dynamic today sample attendance
function generateInitialAttendance(): AttendanceRecord[] {
  const today = new Date().toISOString().split('T')[0];
  return [
    {
      id: 'att_001',
      employeeId: 'emp_001',
      employeeName: 'Ahmad Fauzi',
      employeeNip: 'EMP-2026-001',
      position: 'Kepala Kasir & Store Supervisor',
      date: today,
      clockInTime: '07:52:14',
      clockInIso: `${today}T07:52:14Z`,
      clockInLat: -6.20875,
      clockInLng: 106.84558,
      clockInDistanceMeters: 8,
      clockInStatus: 'ON_TIME',
      clockInQrTokenUsed: 'ABS-TBK-01-INIT-1',
      clockInNotes: 'Absen di pintu kasir',
      isVerifiedGps: true,
    },
    {
      id: 'att_002',
      employeeId: 'emp_002',
      employeeName: 'Siti Rahmawati',
      employeeNip: 'EMP-2026-002',
      position: 'Kasir & Front Office',
      date: today,
      clockInTime: '08:04:30',
      clockInIso: `${today}T08:04:30Z`,
      clockInLat: -6.20882,
      clockInLng: 106.84562,
      clockInDistanceMeters: 14,
      clockInStatus: 'ON_TIME',
      clockInQrTokenUsed: 'ABS-TBK-01-INIT-2',
      clockInNotes: 'Tepat waktu sebelum batas toleransi',
      isVerifiedGps: true,
    },
    {
      id: 'att_003',
      employeeId: 'emp_003',
      employeeName: 'Budi Pratama',
      employeeNip: 'EMP-2026-003',
      position: 'Staf Gudang & Logistik',
      date: today,
      clockInTime: '08:24:10',
      clockInIso: `${today}T08:24:10Z`,
      clockInLat: -6.20890,
      clockInLng: 106.84570,
      clockInDistanceMeters: 22,
      clockInStatus: 'LATE',
      clockInQrTokenUsed: 'ABS-TBK-01-INIT-3',
      clockInNotes: 'Macet di jalan Thamrin',
      isVerifiedGps: true,
    },
  ];
}

interface AppContextType {
  // Store
  store: StoreSettings;
  updateStoreSettings: (newSettings: Partial<StoreSettings>) => void;

  // Role & Session
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentEmployee: Employee | null;
  setCurrentEmployee: (emp: Employee | null) => void;
  loginAsEmployee: (nipOrEmail: string, pin: string) => { success: boolean; message: string };
  logout: () => void;

  // Employees CRUD
  employees: Employee[];
  addEmployee: (empData: Omit<Employee, 'id' | 'joinedDate'>) => void;
  updateEmployee: (id: string, empData: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  toggleEmployeeStatus: (id: string) => void;

  // Attendance
  attendanceRecords: AttendanceRecord[];
  todayAttendance: AttendanceRecord[];
  clockInEmployee: (
    employeeId: string, 
    scannedQrData: string, 
    notes?: string,
    simulatedCoords?: { lat: number; lng: number }
  ) => Promise<{ success: boolean; message: string; record?: AttendanceRecord }>;
  clockOutEmployee: (
    employeeId: string, 
    notes?: string,
    simulatedCoords?: { lat: number; lng: number }
  ) => Promise<{ success: boolean; message: string; record?: AttendanceRecord }>;

  // Dynamic QR
  currentQrPayload: DynamicQrPayload;
  qrCountdownSec: number;
  refreshQrNow: () => void;

  // Live Location Tracker
  currentGps: { lat: number; lng: number; accuracy: number; error?: string };
  updateGpsLocation: () => Promise<void>;

  // Notifications
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  enablePushNotifications: () => Promise<boolean>;

  // Sound FX
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local storage state initialization
  const [store, setStore] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('absensi_store_settings');
    return saved ? JSON.parse(saved) : DEFAULT_STORE;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('absensi_employees');
    return saved ? JSON.parse(saved) : DEFAULT_EMPLOYEES;
  });

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('absensi_records');
    return saved ? JSON.parse(saved) : generateInitialAttendance();
  });

  const [usedTokens, setUsedTokens] = useState<Set<string>>(new Set());

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif_init_1',
      title: 'Selamat Datang di Sistem Absensi QR Toko',
      message: 'Sistem absensi barcode dinamis dengan geofencing GPS siap digunakan.',
      type: 'INFO',
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    },
  ]);

  const [role, setRole] = useState<UserRole>('ADMIN');
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(DEFAULT_EMPLOYEES[0]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Live GPS state
  const [currentGps, setCurrentGps] = useState<{ lat: number; lng: number; accuracy: number; error?: string }>({
    lat: DEFAULT_STORE.latitude,
    lng: DEFAULT_STORE.longitude,
    accuracy: 15,
  });

  // Dynamic QR state
  const [currentQrPayload, setCurrentQrPayload] = useState<DynamicQrPayload>(() => generateDynamicQrPayload(store));
  const [qrCountdownSec, setQrCountdownSec] = useState<number>(store.qrRefreshIntervalSec);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('absensi_store_settings', JSON.stringify(store));
  }, [store]);

  useEffect(() => {
    localStorage.setItem('absensi_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('absensi_records', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  // Request browser push notification on start
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Update QR Code automatically based on interval
  useEffect(() => {
    const updatePayload = () => {
      const payload = generateDynamicQrPayload(store);
      setCurrentQrPayload(payload);
      const remainingMs = payload.expiresAt - Date.now();
      const remainingSec = Math.max(1, Math.ceil(remainingMs / 1000));
      setQrCountdownSec(remainingSec);
    };

    updatePayload();
    const intervalTimer = setInterval(() => {
      const now = Date.now();
      const remainingMs = currentQrPayload.expiresAt - now;
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
      
      if (remainingSec <= 0) {
        updatePayload();
      } else {
        setQrCountdownSec(remainingSec);
      }
    }, 1000);

    return () => clearInterval(intervalTimer);
  }, [store, currentQrPayload.expiresAt]);

  // Fetch initial GPS
  const updateGpsLocation = useCallback(async () => {
    const pos = await getCurrentPosition();
    setCurrentGps({
      lat: pos.latitude,
      lng: pos.longitude,
      accuracy: pos.accuracy,
      error: pos.error,
    });
  }, []);

  useEffect(() => {
    updateGpsLocation();
  }, [updateGpsLocation]);

  // Push notification helper
  const addAppNotification = useCallback((
    title: string, 
    message: string, 
    type: AppNotification['type'],
    employeeName?: string,
    isOnTime?: boolean
  ) => {
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      message,
      type,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      read: false,
      employeeName,
      isOnTime,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 40)]);
  }, []);

  // Filter today's records
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const todayAttendance = useMemo(() => {
    return attendanceRecords.filter((r) => r.date === todayStr);
  }, [attendanceRecords, todayStr]);

  // Store update
  const updateStoreSettings = useCallback((newSettings: Partial<StoreSettings>) => {
    setStore((prev) => ({ ...prev, ...newSettings }));
    addAppNotification('Pengaturan Toko Diperbarui', 'Konfigurasi lokasi & shift toko berhasil disimpan.', 'INFO');
  }, [addAppNotification]);

  // Employees CRUD
  const addEmployee = useCallback((empData: Omit<Employee, 'id' | 'joinedDate'>) => {
    const newEmp: Employee = {
      ...empData,
      id: `emp_${Date.now()}`,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setEmployees((prev) => [newEmp, ...prev]);
    addAppNotification(
      'Karyawan Baru Ditambahkan',
      `Akun ${newEmp.name} (${newEmp.nip}) berhasil dibuat.`,
      'SUCCESS'
    );
  }, [addAppNotification]);

  const updateEmployee = useCallback((id: string, empData: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, ...empData } : emp))
    );
    if (currentEmployee?.id === id) {
      setCurrentEmployee((prev) => (prev ? { ...prev, ...empData } : null));
    }
  }, [currentEmployee]);

  const deleteEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    addAppNotification('Karyawan Dihapus', 'Data karyawan telah dihapus dari sistem.', 'WARNING');
  }, [addAppNotification]);

  const toggleEmployeeStatus = useCallback((id: string) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, isActive: !emp.isActive } : emp))
    );
  }, []);

  // Employee Login
  const loginAsEmployee = useCallback((nipOrEmail: string, pin: string) => {
    const cleanSearch = nipOrEmail.trim().toLowerCase();
    const found = employees.find(
      (e) => (e.nip.toLowerCase() === cleanSearch || e.email.toLowerCase() === cleanSearch) && e.pin === pin
    );

    if (!found) {
      return { success: false, message: 'NIP/Email atau PIN yang Anda masukkan salah!' };
    }

    if (!found.isActive) {
      return { success: false, message: 'Akun karyawan ini sedang dinonaktifkan oleh toko.' };
    }

    setCurrentEmployee(found);
    setRole('EMPLOYEE');
    return { success: true, message: `Selamat datang kembali, ${found.name}!` };
  }, [employees]);

  const logout = useCallback(() => {
    setRole('ADMIN');
  }, []);

  // Clock In Flow
  const clockInEmployee = useCallback(async (
    employeeId: string, 
    scannedQrData: string, 
    notes?: string,
    simulatedCoords?: { lat: number; lng: number }
  ) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) {
      return { success: false, message: 'Data karyawan tidak ditemukan.' };
    }

    // Check if already clocked in today
    const currentTodayRecord = todayAttendance.find((r) => r.employeeId === employeeId);
    if (currentTodayRecord) {
      return { 
        success: false, 
        message: `Anda sudah melakukan Clock-In hari ini pada pukul ${currentTodayRecord.clockInTime}!` 
      };
    }

    // 1. Validate QR Code Security & Expiry
    const qrValidation = validateQrScan(scannedQrData, store, usedTokens);
    if (!qrValidation.isValid || !qrValidation.payload) {
      if (soundEnabled) soundFx.playWarningTone();
      return {
        success: false,
        message: qrValidation.reason || 'Barcode tidak valid atau sudah kadaluwarsa!',
      };
    }

    // 2. Validate GPS Location & Radius
    let lat = simulatedCoords?.lat || currentGps.lat;
    let lng = simulatedCoords?.lng || currentGps.lng;

    // Refresh live GPS if available
    if (!simulatedCoords) {
      const pos = await getCurrentPosition();
      lat = pos.latitude;
      lng = pos.longitude;
    }

    const distanceMeters = calculateDistanceMeters(
      store.latitude,
      store.longitude,
      lat,
      lng
    );

    const isInsideRadius = distanceMeters <= store.geofenceRadiusMeters;

    if (store.requireGpsValidation && !isInsideRadius && !simulatedCoords) {
      if (soundEnabled) soundFx.playWarningTone();
      return {
        success: false,
        message: `Lokasi Anda berada ${distanceMeters}m dari toko (Radius maksimal yang diizinkan ${store.geofenceRadiusMeters}m). Harap mendekat ke area toko!`,
      };
    }

    // 3. Check Shift Time & Late Status
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const [currentHour, currentMin] = [now.getHours(), now.getMinutes()];
    
    // Shift Start parsing
    const [shiftHour, shiftMin] = (emp.shiftStart || store.workStartTime).split(':').map(Number);
    const shiftTotalMinutes = shiftHour * 60 + shiftMin;
    const currentTotalMinutes = currentHour * 60 + currentMin;
    const diffMinutes = currentTotalMinutes - shiftTotalMinutes;

    let clockInStatus: AttendanceRecord['clockInStatus'] = 'ON_TIME';
    if (!isInsideRadius) {
      clockInStatus = 'OUTSIDE_RADIUS';
    } else if (diffMinutes > store.lateToleranceMinutes) {
      clockInStatus = 'LATE';
    }

    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}_${emp.id}`,
      employeeId: emp.id,
      employeeName: emp.name,
      employeeNip: emp.nip,
      position: emp.position,
      date: todayStr,
      clockInTime: timeStr,
      clockInIso: now.toISOString(),
      clockInLat: lat,
      clockInLng: lng,
      clockInDistanceMeters: distanceMeters,
      clockInStatus,
      clockInQrTokenUsed: qrValidation.payload.token,
      clockInNotes: notes || '',
      isVerifiedGps: isInsideRadius,
    };

    // Add token to used list to prevent instant sharing
    setUsedTokens((prev) => new Set([...prev, qrValidation.payload!.token]));
    setAttendanceRecords((prev) => [newRecord, ...prev]);

    // Handle Feedback & Push Notification
    if (clockInStatus === 'ON_TIME') {
      if (soundEnabled) soundFx.playOnTimeChime();
      fireOnTimeCelebration(emp.name);
      addAppNotification(
        '🎉 Absen Tepat Waktu!',
        `${emp.name} berhasil melakukan Clock-In tepat waktu pada ${timeStr} (Jarak: ${distanceMeters}m).`,
        'SUCCESS',
        emp.name,
        true
      );
    } else if (clockInStatus === 'LATE') {
      if (soundEnabled) soundFx.playWarningTone();
      fireLateNotification(emp.name, diffMinutes);
      addAppNotification(
        '⚠️ Absen Terlambat',
        `${emp.name} Clock-In terlambat ${diffMinutes} menit pada ${timeStr} (Jarak: ${distanceMeters}m).`,
        'WARNING',
        emp.name,
        false
      );
    } else {
      if (soundEnabled) soundFx.playWarningTone();
      addAppNotification(
        '⚠️ Absen di Luar Radius Toko',
        `${emp.name} Clock-In berjarak ${distanceMeters}m dari toko.`,
        'WARNING',
        emp.name,
        false
      );
    }

    return {
      success: true,
      message: `Clock-In berhasil! Status: ${clockInStatus === 'ON_TIME' ? 'Tepat Waktu' : 'Terlambat'} (${distanceMeters}m dari toko).`,
      record: newRecord,
    };
  }, [employees, todayAttendance, store, usedTokens, soundEnabled, currentGps, todayStr, addAppNotification]);

  // Clock Out Flow
  const clockOutEmployee = useCallback(async (
    employeeId: string, 
    notes?: string,
    simulatedCoords?: { lat: number; lng: number }
  ) => {
    const currentTodayRecord = todayAttendance.find((r) => r.employeeId === employeeId);
    if (!currentTodayRecord) {
      return { success: false, message: 'Anda belum melakukan Clock-In hari ini!' };
    }

    if (currentTodayRecord.clockOutTime) {
      return { success: false, message: `Anda sudah melakukan Clock-Out hari ini pada pukul ${currentTodayRecord.clockOutTime}!` };
    }

    let lat = simulatedCoords?.lat || currentGps.lat;
    let lng = simulatedCoords?.lng || currentGps.lng;

    if (!simulatedCoords) {
      const pos = await getCurrentPosition();
      lat = pos.latitude;
      lng = pos.longitude;
    }

    const distanceMeters = calculateDistanceMeters(
      store.latitude,
      store.longitude,
      lat,
      lng
    );

    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Calculate work duration
    const clockInDate = new Date(currentTodayRecord.clockInIso);
    const durationMinutes = Math.max(0, Math.round((now.getTime() - clockInDate.getTime()) / (1000 * 60)));

    const updatedRecord: AttendanceRecord = {
      ...currentTodayRecord,
      clockOutTime: timeStr,
      clockOutIso: now.toISOString(),
      clockOutLat: lat,
      clockOutLng: lng,
      clockOutDistanceMeters: distanceMeters,
      clockOutNotes: notes || currentTodayRecord.clockOutNotes,
      workDurationMinutes: durationMinutes,
    };

    setAttendanceRecords((prev) =>
      prev.map((rec) => (rec.id === currentTodayRecord.id ? updatedRecord : rec))
    );

    if (soundEnabled) soundFx.playClockOutTone();
    sendBrowserPushNotification(
      '👋 Clock-Out Berhasil',
      `Terima kasih atas kerja keras Anda hari ini, ${currentTodayRecord.employeeName}! Total kerja: ${Math.floor(durationMinutes / 60)}j ${durationMinutes % 60}m.`
    );

    addAppNotification(
      'Clock-Out Karyawan',
      `${currentTodayRecord.employeeName} telah pulang pada ${timeStr} (Durasi: ${Math.floor(durationMinutes / 60)}j ${durationMinutes % 60}m).`,
      'INFO',
      currentTodayRecord.employeeName
    );

    return {
      success: true,
      message: `Clock-Out berhasil dicatat pada ${timeStr}. Total kerja: ${Math.floor(durationMinutes / 60)} jam ${durationMinutes % 60} menit.`,
      record: updatedRecord,
    };
  }, [todayAttendance, currentGps, store, soundEnabled, addAppNotification]);

  // Refresh QR manually
  const refreshQrNow = useCallback(() => {
    const payload = generateDynamicQrPayload(store);
    setCurrentQrPayload(payload);
    setQrCountdownSec(store.qrRefreshIntervalSec);
    if (soundEnabled) soundFx.playBeep();
  }, [store, soundEnabled]);

  // Notification methods
  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const enablePushNotifications = useCallback(async () => {
    return await requestNotificationPermission();
  }, []);

  return (
    <AppContext.Provider
      value={{
        store,
        updateStoreSettings,
        role,
        setRole,
        currentEmployee,
        setCurrentEmployee,
        loginAsEmployee,
        logout,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        toggleEmployeeStatus,
        attendanceRecords,
        todayAttendance,
        clockInEmployee,
        clockOutEmployee,
        currentQrPayload,
        qrCountdownSec,
        refreshQrNow,
        currentGps,
        updateGpsLocation,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        clearAllNotifications,
        enablePushNotifications,
        soundEnabled,
        setSoundEnabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
