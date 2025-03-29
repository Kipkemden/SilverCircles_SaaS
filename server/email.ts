import nodemailer from 'nodemailer';
import { randomBytes } from 'crypto';
import cryptoRandomString from 'crypto-random-string';

// Create a test SMTP service for development (using Ethereal Email)
// In production, you would use a real email service like SendGrid, Mailgun, etc.
let transporter: nodemailer.Transporter;

async function createTestAccount() {
  const testAccount = await nodemailer.createTestAccount();
  
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  
  console.log('Test email account created: ', testAccount.user);
  console.log('Preview URL: https://ethereal.email/login');
  console.log('Username: ', testAccount.user);
  console.log('Password: ', testAccount.pass);
}

// Initialize transporter
createTestAccount().catch(console.error);

// Generate a verification token
export function generateToken(length: number = 32): string {
  return cryptoRandomString({ length, type: 'url-safe' });
}

// Send verification email
export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  if (!transporter) {
    await createTestAccount();
  }
  
  const verificationUrl = `http://${process.env.HOST || 'localhost:3000'}/verify-email?token=${token}`;
  
  const info = await transporter.sendMail({
    from: '"Silver Circles" <verification@silvercircles.com>',
    to: email,
    subject: 'Verify Your Email Address',
    text: `Welcome to Silver Circles! Please verify your email address by clicking the following link: ${verificationUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Welcome to Silver Circles!</h1>
        <p>Thank you for joining our community. To complete your registration, please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #4a5568; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Verify Email Address</a>
        </div>
        <p>If the button doesn't work, you can also click on the link below or copy and paste it into your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>If you didn't create an account with us, you can safely ignore this email.</p>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
          <p>Silver Circles - A community platform for adults 45-70</p>
        </div>
      </div>
    `,
  });
  
  console.log('Verification email sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  
  return;
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  if (!transporter) {
    await createTestAccount();
  }
  
  const resetUrl = `http://${process.env.HOST || 'localhost:3000'}/reset-password?token=${token}`;
  
  const info = await transporter.sendMail({
    from: '"Silver Circles" <noreply@silvercircles.com>',
    to: email,
    subject: 'Reset Your Password',
    text: `You requested a password reset. Please click the following link to reset your password: ${resetUrl}. This link will expire in 1 hour.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Reset Your Password</h1>
        <p>You requested a password reset for your Silver Circles account. Please click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #4a5568; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </div>
        <p>If the button doesn't work, you can also click on the link below or copy and paste it into your browser:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
          <p>Silver Circles - A community platform for adults 45-70</p>
        </div>
      </div>
    `,
  });
  
  console.log('Password reset email sent: %s', info.messageId);
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  
  return;
}