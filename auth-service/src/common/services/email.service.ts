import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from './logger.service';
import * as nodemailer from 'nodemailer';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    // Initialize the transporter with configuration from environment variables
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: this.configService.get<boolean>('EMAIL_SECURE', false),
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  /**
   * Send an email
   * @param to Recipient email address
   * @param subject Email subject
   * @param html HTML content of the email
   * @param from Sender email address (optional, uses default from config if not provided)
   * @param text Plain text version of the email (optional)
   * @param attachments Email attachments (optional)
   * @returns Promise with the send result
   */
  async sendMail({
    to,
    subject,
    html,
    from,
    text,
    attachments,
  }: {
    to: string;
    subject: string;
    html: string;
    from?: string;
    text?: string;
    attachments?: any[];
  }): Promise<any> {
    try {
      const messageId = uuidv4();
      const defaultFrom = this.configService.get<string>('EMAIL_FROM', 'noreply@example.com');

      const mailOptions = {
        from: from || defaultFrom,
        to,
        subject,
        text,
        html,
        attachments,
        messageId: `<${messageId}@${this.configService.get<string>('EMAIL_DOMAIN', 'example.com')}>`,
      };

      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent: ${info.messageId}`, 'EmailService');
      return info;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}`, error.stack, 'EmailService');
      throw error;
    }
  }
}