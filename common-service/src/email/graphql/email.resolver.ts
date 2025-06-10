import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { EmailService } from '../services/email.service';
import { LoggerService } from '../../common/services/logger.service';
import { SendEmailInput } from './email.input.dto';
import { EmailResponse } from './email.types';

@Resolver()
export class EmailResolver {
  constructor(
    private readonly emailService: EmailService,
    private readonly logger: LoggerService,
  ) {}

  @Mutation(() => EmailResponse)
  async sendEmail(@Args('input') input: SendEmailInput): Promise<EmailResponse> {
    this.logger.log(`GraphQL: Received request to send email to: ${input.to}`, 'EmailResolver');
    
    try {
      const result = await this.emailService.sendEmail({
        to: input.to,
        subject: input.subject,
        text: input.text,
        html: input.html,
        from: input.from,
        attachments: input.attachments,
      });
      
      return {
        success: result,
        message: result ? 'Email sent successfully' : 'Failed to send email',
      };
    } catch (error) {
      this.logger.error(`GraphQL: Error sending email: ${error.message}`, error.stack, 'EmailResolver');
      return {
        success: false,
        message: 'Error sending email',
      };
    }
  }

  @Mutation(() => EmailResponse)
  async sendVerificationEmail(
    @Args('email') email: string,
    @Args('token') token: string,
  ): Promise<EmailResponse> {
    this.logger.log(`GraphQL: Received request to send verification email to: ${email}`, 'EmailResolver');
    
    try {
      const result = await this.emailService.sendVerificationEmail(email, token);
      
      return {
        success: result,
        message: result ? 'Verification email sent successfully' : 'Failed to send verification email',
      };
    } catch (error) {
      this.logger.error(`GraphQL: Error sending verification email: ${error.message}`, error.stack, 'EmailResolver');
      return {
        success: false,
        message: 'Error sending verification email',
      };
    }
  }

  @Mutation(() => EmailResponse)
  async sendPasswordResetEmail(
    @Args('email') email: string,
    @Args('token') token: string,
  ): Promise<EmailResponse> {
    this.logger.log(`GraphQL: Received request to send password reset email to: ${email}`, 'EmailResolver');
    
    try {
      const result = await this.emailService.sendPasswordResetEmail(email, token);
      
      return {
        success: result,
        message: result ? 'Password reset email sent successfully' : 'Failed to send password reset email',
      };
    } catch (error) {
      this.logger.error(`GraphQL: Error sending password reset email: ${error.message}`, error.stack, 'EmailResolver');
      return {
        success: false,
        message: 'Error sending password reset email',
      };
    }
  }

  @Mutation(() => EmailResponse)
  async sendWelcomeEmail(
    @Args('email') email: string,
    @Args('firstName') firstName: string,
  ): Promise<EmailResponse> {
    this.logger.log(`GraphQL: Received request to send welcome email to: ${email}`, 'EmailResolver');
    
    try {
      const result = await this.emailService.sendWelcomeEmail(email, firstName);
      
      return {
        success: result,
        message: result ? 'Welcome email sent successfully' : 'Failed to send welcome email',
      };
    } catch (error) {
      this.logger.error(`GraphQL: Error sending welcome email: ${error.message}`, error.stack, 'EmailResolver');
      return {
        success: false,
        message: 'Error sending welcome email',
      };
    }
  }
}