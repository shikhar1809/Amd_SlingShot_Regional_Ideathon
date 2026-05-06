import CryptoJS from 'crypto-js';

const SECRET_KEY = (import.meta as any).env.VITE_ENCRYPTION_KEY || 'default-fallback-key-for-dev-only';

export function encryptData(data: string): string {
  try {
    return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
  } catch (error) {
    console.error('Encryption failed', error);
    return data; // Fallback to raw if encryption fails (not ideal but safe for app flow)
  }
}

export function decryptData(encryptedData: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || encryptedData;
  } catch (error) {
    console.error('Decryption failed', error);
    return encryptedData;
  }
}
