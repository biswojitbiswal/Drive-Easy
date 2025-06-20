import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  async sendVerificationEmail(to: string, otp: string, fullName: string) {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject: 'DriveEasy Email Verification',
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #2563eb, #1d4ed8); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🚗 DriveEasy</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Your Ride, Your Rules</p>
  </div>
  
  <!-- Content -->
  <div style="padding: 30px;">
    <h2 style="color: #1e293b; margin: 0 0 15px 0;">Welcome to DriveEasy, ${fullName}! 🎉</h2>
    <p style="color: #64748b; line-height: 1.6;">Thanks for joining our community. Please verify your email address to get started.</p>
    
    <!-- Verification Code -->
    <div style="background-color: #f8fafc; padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0; border: 2px solid #e2e8f0;">
      <h3 style="margin: 0 0 15px 0; color: #374151;">🔐 Your Verification Code</h3>
      <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 4px; background-color: white; padding: 15px; border-radius: 8px; border: 2px dashed #2563eb; font-family: monospace;">
        ${otp}
      </div>
      <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 14px;">⏰ Expires in 10 minutes</p>
    </div>
    
    <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; border-left: 4px solid #ef4444;">
      <p style="margin: 0; color: #dc2626; font-size: 14px;">🛡️ If you didn't create a DriveEasy account, please ignore this email.</p>
    </div>
  </div>
  
  <!-- Footer -->
  <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
    <p style="margin: 0; color: #6b7280; font-size: 14px;">Best regards,<br><strong>The DriveEasy Team</strong></p>
    <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 12px;">© 2024 DriveEsy - Drive Your Way</p>
  </div>
</div>`
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent successfully');
      return { success: true, message: 'Verification email sent successfully' };
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(to: string, fullName: string) {
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject: '🎉 Welcome to DriveEasy - Let\'s Begin A New Journey',
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
  <!-- Header -->
  <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎉 DriveEasy</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Your Adventurous Journey Begins Now!</p>
  </div>
  
  <!-- Content -->
  <div style="padding: 30px;">
    <h2 style="color: #1e293b; margin: 0 0 15px 0;">Welcome aboard, ${fullName}! ✨</h2>
    <p style="color: #64748b; line-height: 1.6;">Your email has been verified successfully! You're now part of the DriveEasy community where You Can Unlock Your Next Journey.</p>
    
    <!-- Getting Started -->
    <div style="background-color: #f0fdf4; padding: 25px; border-radius: 12px; margin: 25px 0; border: 2px solid #bbf7d0;">
      <h3 style="margin: 0 0 15px 0; color: #2563eb;">🚀 Getting Started</h3>
      <div style="color: #2563eb; line-height: 1.8;">
        <p style="margin: 8px 0;">📝 <strong>Complete your profile</strong> - Choose Your Dream Car And Drive Your Way</p>
        <p style="margin: 8px 0;">🔍 <strong>Find Dream Cars</strong> - Join groups for your subjects</p>
        <p style="margin: 8px 0;">👥 <strong>rom Daily Drives to Weekend Escapes.</p>
        <p style="margin: 8px 0;">🎥 <strong>Schedule Your Journey</strong> - Plan A Adventorous Trip</p>
      </div>
    </div>
    
    <!-- Features Highlight -->
    <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
      <h4 style="margin: 0 0 10px 0; color: #92400e;">✨ What you can do:</h4>
      <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
        Join Our Premium Plan • Take Your Car Without Delivery Charge • Advance Booking • Easy Return From Any Where • Claim Your Insurance
      </p>
    </div>
    
    <!-- CTA Button -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="/dashboard" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
        🏠 Go to Dashboard
      </a>
    </div>
  </div>
  
  <!-- Footer -->
  <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
    <p style="margin: 0; color: #6b7280; font-size: 14px;">Happy Journey!<br><strong>The DriveEasy Team</strong></p>
    <p style="margin: 10px 0 0 0; color: #94a3b8; font-size: 12px;">© 2024 DriveEasy - Collaborative Learning Platform</p>
  </div>
</div>`
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully');
      return { success: true, message: 'Welcome email sent successfully' };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }
}
