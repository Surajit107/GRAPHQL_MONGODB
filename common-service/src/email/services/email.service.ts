import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { LoggerService } from '../../common/services/logger.service';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private defaultFrom: string;

  constructor(
    private configService: ConfigService,
    private logger: LoggerService,
  ) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const secure = this.configService.get<boolean>('SMTP_SECURE', false);
    this.defaultFrom = this.configService.get<string>('SMTP_FROM', 'noreply@example.com');

    // Only create transporter if SMTP credentials are provided
    if (host && port && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
          user,
          pass,
        },
      });
      this.logger.log('Email service initialized', 'EmailService');
    } else {
      this.logger.warn('Email service not configured - missing SMTP credentials', 'EmailService');
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn('Email service not configured - email not sent', 'EmailService');
      return false;
    }

    try {
      const mailOptions = {
        from: options.from || this.defaultFrom,
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent: ${info.messageId}`, 'EmailService');
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack, 'EmailService');
      return false;
    }
  }

  async sendVerificationEmail(to: string, token: string): Promise<boolean> {
    const verificationUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/verify-email?token=${token}`;
    
    return this.sendEmail({
      to,
      subject: 'Verify Your Email Address',
      html: `
        <h1>Email Verification</h1>
        <p>Thank you for registering. Please verify your email address by clicking the link below:</p>
        <p><a href="${verificationUrl}">Verify Email</a></p>
        <p>If you did not request this verification, please ignore this email.</p>
      `,
    });
  }

  async sendPasswordResetEmail(to: string, token: string): Promise<boolean> {
    const resetUrl = `${this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000')}/reset-password?token=${token}`;
    
    return this.sendEmail({
      to,
      subject: 'Reset Your Password',
      html: `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Please click the link below to reset your password:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>If you did not request this reset, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `,
    });
  }

  async sendWelcomeEmail(to: string, firstName: string): Promise<boolean> {
    return this.sendEmail({
      to,
      subject: 'Welcome to Our Platform',
      html: `
        <h1>Welcome, ${firstName}!</h1>
        <p>Thank you for joining our platform. We're excited to have you on board!</p>
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
      `,
    });
  }
}