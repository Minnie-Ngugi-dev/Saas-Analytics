import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import ResetToken from '../models/ResetToken.js';
import { hashPassword, comparePassword } from '../utils/hashPassword.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/generateToken.js';
import { sendResetEmail } from '../services/emailService.js';
import { generateRandomString } from '../utils/helpers.js';
import crypto from 'crypto';

// @desc    Register new user with tenant
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, companyName } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        error: 'User already exists with this email' 
      });
    }
    
    // Create tenant (company)
    const tenant = await Tenant.create({
      companyName,
      companyEmail: email
    });
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user (owner role)
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'owner',
      tenantId: tenant._id,
      isVerified: true
    });
    
    // Generate tokens
    const accessToken = generateAccessToken(user._id, tenant._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: tenant._id,
          companyName: tenant.companyName,
          subscriptionTier: tenant.subscriptionTier
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).populate('tenantId');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }
    
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    const accessToken = generateAccessToken(user._id, user.tenantId._id, user.role);
    const refreshToken = generateRefreshToken(user._id);
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId._id,
          companyName: user.tenantId.companyName,
          subscriptionTier: user.tenantId.subscriptionTier
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// @desc    Refresh access token
// @route   POST /api/auth/refresh
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ 
        success: false, 
        error: 'Refresh token required' 
      });
    }
    
    const decoded = verifyRefreshToken(refreshToken);
    
    const user = await User.findById(decoded.id).populate('tenantId');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found' 
      });
    }
    
    const newAccessToken = generateAccessToken(user._id, user.tenantId._id, user.role);
    
    res.json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      error: 'Invalid or expired refresh token' 
    });
  }
};

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    // Security: Always return same response even if email doesn't exist
    if (!user) {
      return res.json({ 
        success: true, 
        message: 'If your email is registered, you will receive a reset link' 
      });
    }
    
    // Generate reset token
    const resetToken = generateRandomString(32);
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    await ResetToken.create({
      userId: user._id,
      token: hashedToken,
      expiresAt: new Date(+new Date() + 60 * 60 * 1000) // 1 hour
    });
    
    // Send email
    await sendResetEmail(user.email, resetToken);
    
    res.json({ 
      success: true, 
      message: 'Password reset link sent to your email' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const resetEntry = await ResetToken.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() },
      used: false
    });
    
    if (!resetEntry) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid or expired reset token' 
      });
    }
    
    const hashedPassword = await hashPassword(newPassword);
    await User.findByIdAndUpdate(resetEntry.userId, { password: hashedPassword });
    
    // Mark token as used
    resetEntry.used = true;
    await resetEntry.save();
    
    res.json({ 
      success: true, 
      message: 'Password reset successful. You can now login with your new password.' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('tenantId');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
export const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};