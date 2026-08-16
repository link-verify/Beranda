/**
 * Geolocation & Geofencing helper utilities
 */

// Calculate Haversine distance between two coordinates in meters
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

export interface GpsResult {
  latitude: number;
  longitude: number;
  accuracy: number;
  error?: string;
}

export async function getCurrentPosition(): Promise<GpsResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        latitude: -6.2088,
        longitude: 106.8456,
        accuracy: 50,
        error: 'Geolokasi tidak didukung oleh browser ini.',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
        });
      },
      (err) => {
        // Fallback default coordinates (Jakarta Pusat) if permission denied in iframe
        resolve({
          latitude: -6.2088,
          longitude: 106.8456,
          accuracy: 50,
          error: `Gagal membaca GPS: ${err.message}. Menggunakan simulasi koordinat toko.`,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}
