import crypto from 'crypto';

export const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove any non-digit characters
  let cleaned = phoneNumber.toString().replace(/\D/g, '');
  
  // Remove leading zero or 254 if present
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('254')) {
    cleaned = cleaned; // Already has 254
  } else if (cleaned.startsWith('+254')) {
    cleaned = cleaned.substring(1);
  } else if (!cleaned.startsWith('254') && cleaned.length === 9) {
    cleaned = '254' + cleaned;
  } else if (cleaned.length === 10 && cleaned.startsWith('7')) {
    cleaned = '254' + cleaned;
  }
  
  return cleaned;
};

export const getTimestamp = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

export const calculateExpiryDate = (days) => {
  return new Date(+new Date() + days * 24 * 60 * 60 * 1000);
};

export const sanitizeMpesaPhone = (phone) => {
  let cleaned = phone.toString().replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  if (!cleaned.startsWith('254')) {
    cleaned = '254' + cleaned;
  }
  return cleaned;
};

export const generateMpesaPassword = (shortCode, passkey, timestamp) => {
  const str = `${shortCode}${passkey}${timestamp}`;
  return Buffer.from(str).toString('base64');
};

export default {
  generateRandomString,
  formatPhoneNumber,
  getTimestamp,
  calculateExpiryDate,
  sanitizeMpesaPhone,
  generateMpesaPassword
};