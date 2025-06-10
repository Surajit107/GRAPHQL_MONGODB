import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../common/services/logger.service';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';

@Injectable()
export class CommonServiceClient {
  private baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.baseUrl = this.configService.get<string>('COMMON_SERVICE_URL', 'http://localhost:3001');
  }

  async sendVerificationEmail(email: string, token: string, username: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .post(`${this.baseUrl}/email/verification`, {
            email,
            token,
            username,
          })
          .pipe(
            map((res) => res.data),
            catchError((error) => {
              this.logger.error(`Error sending verification email to ${email}`, error.stack);
              return throwError(() => error);
            }),
          ),
      );
      return response;
    } catch (error) {
      this.logger.error(`Error sending verification email to ${email}`, error.stack);
      throw error;
    }
  }

  async sendPasswordResetEmail(email: string, token: string, username: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .post(`${this.baseUrl}/email/password-reset`, {
            email,
            token,
            username,
          })
          .pipe(
            map((res) => res.data),
            catchError((error) => {
              this.logger.error(`Error sending password reset email to ${email}`, error.stack);
              return throwError(() => error);
            }),
          ),
      );
      return response;
    } catch (error) {
      this.logger.error(`Error sending password reset email to ${email}`, error.stack);
      throw error;
    }
  }

  async sendWelcomeEmail(email: string, username: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .post(`${this.baseUrl}/email/welcome`, {
            email,
            username,
          })
          .pipe(
            map((res) => res.data),
            catchError((error) => {
              this.logger.error(`Error sending welcome email to ${email}`, error.stack);
              return throwError(() => error);
            }),
          ),
      );
      return response;
    } catch (error) {
      this.logger.error(`Error sending welcome email to ${email}`, error.stack);
      throw error;
    }
  }
}