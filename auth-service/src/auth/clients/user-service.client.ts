import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../../common/services/logger.service';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';

@Injectable()
export class UserServiceClient {
  private baseUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    this.baseUrl = this.configService.get<string>('USER_SERVICE_URL', 'http://localhost:3002');
  }

  async findOne(id: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/users/${id}`).pipe(
          map((res) => res.data),
          catchError((error) => {
            this.logger.error(`Error finding user with ID ${id}`, error.stack);
            return throwError(() => error);
          }),
        ),
      );
      return response;
    } catch (error) {
      this.logger.error(`Error finding user with ID ${id}`, error.stack);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/users/email/${email}`).pipe(
          map((res) => res.data),
          catchError((error) => {
            this.logger.error(`Error finding user with email ${email}`, error.stack);
            return throwError(() => error);
          }),
        ),
      );
      return response;
    } catch (error) {
      this.logger.error(`Error finding user with email ${email}`, error.stack);
      throw error;
    }
  }

  async create(userData: any): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/users`, userData).pipe(
          map((res) => res.data),
          catchError((error) => {
            this.logger.error('Error creating user', error.stack);
            return throwError(() => error);
          }),
        ),
      );
      return response;
    } catch (error) {
      this.logger.error('Error creating user', error.stack);
      throw error;
    }
  }

  async update(id: string, updateData: any): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.patch(`${this.baseUrl}/users/${id}`, updateData).pipe(
          map((res) => res.data),
          catchError((error) => {
            this.logger.error(`Error updating user with ID ${id}`, error.stack);
            return throwError(() => error);
          }),
        ),
      );
      return response;
    } catch (error) {
      this.logger.error(`Error updating user with ID ${id}`, error.stack);
      throw error;
    }
  }

  async validatePassword(userId: string, password: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService
          .post(`${this.baseUrl}/users/${userId}/validate-password`, { password })
          .pipe(
            map((res) => res.data),
            catchError((error) => {
              this.logger.error(`Error validating password for user ${userId}`, error.stack);
              return throwError(() => error);
            }),
          ),
      );
      return response.valid;
    } catch (error) {
      this.logger.error(`Error validating password for user ${userId}`, error.stack);
      throw error;
    }
  }
}