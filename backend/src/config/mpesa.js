import dotenv from 'dotenv';
dotenv.config();

export const mpesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY,
  consumerSecret: process.env.MPESA_CONSUMER_SECRET,
  passkey: process.env.MPESA_PASSKEY,
  shortCode: process.env.MPESA_SHORTCODE || '174379',
  environment: process.env.MPESA_ENV || 'sandbox',
  baseUrl: process.env.MPESA_ENV === 'production' 
    ? 'https://api.safaricom.co.ke' 
    : 'https://sandbox.safaricom.co.ke',
  callbackUrl: process.env.CALLBACK_URL || 'https://your-domain.com',
  // For Lipa Na M-Pesa Online
  lipaNaMpesaShortcode: process.env.MPESA_SHORTCODE,
  lipaNaMpesaPasskey: process.env.MPESA_PASSKEY,
  // For C2B (optional)
  c2bShortcode: process.env.MPESA_C2B_SHORTCODE,
  c2bPasskey: process.env.MPESA_C2B_PASSKEY
};

// Validation function
export const validateMpesaConfig = () => {
  const required = ['consumerKey', 'consumerSecret', 'passkey', 'shortCode'];
  const missing = required.filter(key => !mpesaConfig[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️ Missing M-Pesa configuration: ${missing.join(', ')}`);
    console.warn('M-Pesa features will not work in production');
    return false;
  }
  
  console.log('✅ M-Pesa configuration loaded');
  return true;
};

export default mpesaConfig;