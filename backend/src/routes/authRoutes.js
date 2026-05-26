import express from 'express';
import passport from 'passport';
import {
  register,
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
  getMe,
  logout
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Generate tokens for OAuth user
    const accessToken = generateAccessToken(req.user._id, req.user.tenantId._id, req.user.role);
    const refreshToken = generateRefreshToken(req.user._id);
    res.redirect(`${process.env.FRONTEND_URL}/oauth-redirect?accessToken=${accessToken}&refreshToken=${refreshToken}`);
  }
);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

export default router;