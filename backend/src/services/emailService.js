import nodemailer from 'nodemailer';
import createTransporter from '../config/email.js';

export const sendResetEmail = async (email, resetToken) => {
  const transporter = createTransporter();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const mailOptions = {
    from: `"InsightFlow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request - InsightFlow',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #3B82F6;">
            <h1 style="color: #3B82F6; margin: 0;">InsightFlow</h1>
            <p style="color: #666; margin: 5px 0 0;">Analytics for Growing Businesses</p>
          </div>
          
          <div style="padding: 20px 0;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password for your InsightFlow account. Click the button below to create a new password:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; padding: 12px 30px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Reset Password
              </a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
              ${resetUrl}
            </p>
            
            <p style="color: #e74c3c; font-size: 14px;"><strong>⚠️ This link will expire in 1 hour.</strong></p>
            
            <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">
            
            <p style="color: #999; font-size: 12px;">
              InsightFlow - Helping businesses grow with data<br>
              <a href="${process.env.FRONTEND_URL}" style="color: #3B82F6;">${process.env.FRONTEND_URL}</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

export const sendWelcomeEmail = async (email, name, companyName) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"InsightFlow" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Welcome to InsightFlow, ${name}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #10B981;">
            <h1 style="color: #10B981; margin: 0;">Welcome to InsightFlow!</h1>
          </div>
          
          <div style="padding: 20px 0;">
            <h2 style="color: #333;">Hello ${name},</h2>
            <p>Thank you for choosing InsightFlow! Your company <strong>"${companyName}"</strong> has been successfully registered.</p>
            
            <div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10B981;">
              <p style="margin: 0;"><strong>📊 Your 14-Day Free Trial</strong><br>
              You're currently on a <strong>Free Trial</strong> plan. Upgrade anytime to unlock:</p>
              <ul style="margin: 10px 0 0 20px;">
                <li>Real-time analytics dashboard</li>
                <li>Data export to CSV/PDF</li>
                <li>Team collaboration features</li>
                <li>API access for custom integrations</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard" 
                 style="display: inline-block; padding: 12px 30px; background-color: #10B981; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Go to Your Dashboard
              </a>
            </div>
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">
            
            <p style="color: #999; font-size: 12px;">
              Need help? Contact us at <a href="mailto:support@insightflow.com" style="color: #10B981;">support@insightflow.com</a><br>
              InsightFlow - Turn data into growth
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

export const sendPaymentReceipt = async (email, name, amount, plan, mpesaReceipt) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"InsightFlow Billing" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Payment Receipt - ${plan.toUpperCase()} Plan`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #3B82F6;">
            <h1 style="color: #3B82F6; margin: 0;">Payment Receipt</h1>
          </div>
          
          <div style="padding: 20px 0;">
            <p>Dear <strong>${name}</strong>,</p>
            <p>Thank you for your payment! Your InsightFlow subscription is now active.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">Payment Details</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 5px 0;"><strong>Plan:</strong></td><td>${plan.toUpperCase()}</td></tr>
                <tr><td style="padding: 5px 0;"><strong>Amount:</strong></td><td>Ksh ${amount.toLocaleString()}</td></tr>
                <tr><td style="padding: 5px 0;"><strong>M-Pesa Receipt:</strong></td><td>${mpesaReceipt}</td></tr>
                <tr><td style="padding: 5px 0;"><strong>Date:</strong></td><td>${new Date().toLocaleString()}</td></tr>
              </table>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/subscription" 
                 style="display: inline-block; padding: 12px 30px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                View Subscription
              </a>
            </div>
            
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e0e0e0;">
            
            <p style="color: #999; font-size: 12px;">
              This is a system generated receipt. For any issues, contact support@insightflow.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

export default { sendResetEmail, sendWelcomeEmail, sendPaymentReceipt };