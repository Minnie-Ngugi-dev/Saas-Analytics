import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const generateApiKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateWebhookSecret = () => {
  return crypto.randomBytes(24).toString('hex');
};

export const validateApiKey = (apiKey, storedKey) => {
  return crypto.timingSafeEqual(
    Buffer.from(apiKey),
    Buffer.from(storedKey)
  );
};

export const createAPIToken = (tenantId, scopes = ['read']) => {
  return jwt.sign(
    {
      tenantId,
      scopes,
      type: 'api_key',
      iat: Math.floor(Date.now() / 1000)
    },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: '365d' }
  );
};

export const verifyAPIToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

export default {
  generateApiKey,
  generateWebhookSecret,
  validateApiKey,
  createAPIToken,
  verifyAPIToken
};