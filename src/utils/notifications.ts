import confetti from 'canvas-confetti';

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }
  return false;
}

export function sendBrowserPushNotification(title: string, body: string, icon = '🎉') {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'absensi-notif',
      });
    } catch {
      // Ignore if web notification fails
    }
  }
}

export function fireOnTimeCelebration(employeeName: string) {
  // Fire confetti
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'],
    });
  } catch {}

  // Send browser notification
  sendBrowserPushNotification(
    '🎉 Absensi Tepat Waktu!',
    `Hebat, ${employeeName}! Anda telah berhasil absen tepat waktu hari ini. Selamat bekerja!`
  );
}

export function fireLateNotification(employeeName: string, lateMinutes: number) {
  sendBrowserPushNotification(
    '⚠️ Absensi Terlambat Terdeteksi',
    `${employeeName} absen terlambat ${lateMinutes} menit dari jadwal shift.`
  );
}
