import { DynamicQrPayload, StoreSettings } from '../types';

// Simple lightweight hash function for dynamic rolling token
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// Generate dynamic payload that changes every N seconds
export function generateDynamicQrPayload(store: StoreSettings): DynamicQrPayload {
  const now = Date.now();
  const intervalMs = (store.qrRefreshIntervalSec || 20) * 1000;
  // Floor to current time block
  const timeBlock = Math.floor(now / intervalMs);
  const expiresAt = (timeBlock + 1) * intervalMs;
  
  // Calculate dynamic 6-digit OTP based on store code and current time block
  const rawSeed = `${store.id}_${store.code}_${timeBlock}_ABSEN_SALT`;
  const tokenHash = simpleHash(rawSeed);
  
  // Deterministic 6 digit OTP for this time window
  let numHash = 0;
  for (let i = 0; i < rawSeed.length; i++) {
    numHash = (numHash * 31 + rawSeed.charCodeAt(i)) % 1000000;
  }
  const otpCode = String(numHash).padStart(6, '0');

  const payload: DynamicQrPayload = {
    token: `ABS-${store.code}-${timeBlock}-${tokenHash}`,
    storeId: store.id,
    storeCode: store.code,
    timestamp: now,
    expiresAt,
    otpCode,
    salt: tokenHash,
  };

  return payload;
}

export function stringifyQrPayload(payload: DynamicQrPayload): string {
  return JSON.stringify(payload);
}

export function parseQrPayload(raw: string): DynamicQrPayload | null {
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.token && parsed.storeId && parsed.expiresAt) {
      return parsed as DynamicQrPayload;
    }
  } catch {
    // Might be direct token string or OTP code
  }
  return null;
}

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  payload?: DynamicQrPayload;
}

export function validateQrScan(
  scannedData: string,
  store: StoreSettings,
  usedTokens: Set<string>
): ValidationResult {
  const now = Date.now();
  const payload = parseQrPayload(scannedData);

  // If parsed as JSON payload
  if (payload) {
    if (payload.storeId !== store.id && payload.storeCode !== store.code) {
      return {
        isValid: false,
        reason: 'Barcode ini bukan milik toko Anda! Pastikan scan di toko yang benar.',
      };
    }

    // Check if token expired (with grace period of 10 seconds for camera lag)
    const gracePeriodMs = 10000;
    if (now > payload.expiresAt + gracePeriodMs) {
      return {
        isValid: false,
        reason: 'Barcode sudah kadaluwarsa (berputar berkala). Silakan scan barcode terbaru di layar toko!',
      };
    }

    // Check if already used by someone else in the same instant (anti-sharing)
    if (usedTokens.has(payload.token)) {
      return {
        isValid: false,
        reason: 'Barcode ini sudah baru saja digunakan oleh karyawan lain. Tunggu barcode berputar 15 detik!',
      };
    }

    return {
      isValid: true,
      payload,
    };
  }

  // Check if manual OTP match
  const cleanInput = scannedData.trim();
  const currentExpected = generateDynamicQrPayload(store);
  if (cleanInput === currentExpected.otpCode) {
    if (usedTokens.has(currentExpected.token)) {
      return {
        isValid: false,
        reason: 'Kode OTP ini sudah terpakai. Mohon gunakan kode baru yang tampil di layar toko.',
      };
    }
    return {
      isValid: true,
      payload: currentExpected,
    };
  }

  return {
    isValid: false,
    reason: 'Format barcode tidak valid atau tidak terbaca dengan benar.',
  };
}
