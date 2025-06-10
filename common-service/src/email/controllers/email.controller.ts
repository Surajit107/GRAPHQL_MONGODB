import { Body, Controller, Post } from '@nestjs/common';
import { EmailService, EmailOptions } from '../services/email.service';
import { LoggerService } from '../../common/services/logger.service';

@Controller('email')
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    private readonly logger: LoggerService,
  ) {}

  @Post('send')
  async sendEmail(@Body() emailOptions: EmailOptions): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Received request to send email to: ${emailOptions.to}`, 'EmailController');
    
    try {
      const result = await this.emailService.sendEmail(emailOptions);
      
      if (result) {
        return { success: true, message: 'Email sent successfully' };
      } else {
        return { success: false, message: 'Failed to send email' };
      }
    } catch (error) {
      this.logger.error(`Error sending email: ${error.message}`, error.stack, 'EmailController');
      return { success: false, message: 'Error sending email' };
    }
  }

  @Post('verification')
  async sendVerificationEmail(
    @Body() payload: { email: string; token: string },
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Received request to send verification email to: ${payload.email}`, 'EmailController');
    
    try {
      const result = await this.emailService.sendVerificationEmail(payload.email, payload.token);
      
      if (result) {
        return { success: true, message: 'Verification email sent successfully' };
      } else {
        return { success: false, message: 'Failed to send verification email' };
      }
    } catch (error) {
      this.logger.error(`Error sending verification email: ${error.message}`, error.stack, 'EmailController');
      return { success: false, message: 'Error sending verification email' };
    }
  }

  @Post('password-reset')
  async sendPasswordResetEmail(
    @Body() payload: { email: string; token: string },
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Received request to send password reset email to: ${payload.email}`, 'EmailController');
    
    try {
      const result = await this.emailService.sendPasswordResetEmail(payload.email, payload.token);
      
      if (result) {
        return { success: true, message: 'Password reset email sent successfully' };
      } else {
        return { success: false, message: 'Failed to send password reset email' };
      }
    } catch (error) {
      this.logger.error(`Error sending password reset email: ${error.message}`, error.stack, 'EmailController');
      return { success: false, message: 'Error sending password reset email' };
    }
  }

  @Post('welcome')
  async sendWelcomeEmail(
    @Body() payload: { email: string; firstName: string },
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Received request to send welcome email to: ${payload.email}`, 'EmailController');
    
    try {
      const result = await this.emailService.sendWelcomeEmail(payload.email, payload.firstName);
      
      if (result) {
        return { success: true, message: 'Welcome email sent successfully' };
      } else {
        return { success: false, message: 'Failed to send welcome email' };
      }
    } catch (error) {
      this.logger.error(`Error sending welcome email: ${error.message}`, error.stack, 'EmailController');
      return { success: false, message: 'Error sending welcome email' };
    }
  }
}