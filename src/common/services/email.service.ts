import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    const host = this.configService.get('SMTP_HOST');
    const port = Number(this.configService.get('SMTP_PORT'));
    const user = this.configService.get('SMTP_USER');
    const pass = this.configService.get('SMTP_PASSWORD');
    const from = this.configService.get('SMTP_FROM');
    console.log('[EmailService] SMTP config:', { host, port, user, pass, from });
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: {
        user,
        pass,
      },
    });
  }

  async sendMail({
    to,
    subject,
    html,
    text,
    from,
    attachments,
  }: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    from?: string;
    attachments?: any[];
  }) {
    return this.transporter.sendMail({
      from: from || this.configService.get('SMTP_FROM'),
      to,
      subject,
      html,
      text,
      attachments,
    });
  }
} 