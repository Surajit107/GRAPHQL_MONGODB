import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { UserServiceClient } from '../clients/user-service.client';
import { EmailService } from '../../common/services/email.service';
import { LoggerService } from '../../common/services/logger.service';
import { Token, TokenDocument } from '../schemas/token.schema';
import {
  LoginInput,
  RegisterInput,
  RefreshTokenInput,
  LogoutInput,
  Enable2FAInput,
  Verify2FAInput,
  Verify2FALoginInput,
  RequestPasswordResetInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from '../dto/auth.input.dto';
import {
  AuthResponse,
  TwoFactorAuthResponse,
  VerifyTwoFactorAuthResponse,
  LogoutResponse,
  PasswordResetResponse,
  EmailVerificationResponse,
} from '../dto/auth.types';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private userServiceClient: UserServiceClient,
    private emailService: EmailService,
    private logger: LoggerService,
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
  ) {}

  async register(registerInput: RegisterInput): Promise<AuthResponse> {
    try {
      // Create user in user service
      const user = await this.userServiceClient.create(registerInput);

      // Generate verification token
      const verificationToken = await this.generateToken(user.id, 'verification', '1d');

      // Send verification email
      await this.emailService.sendMail({
        to: user.email,
        subject: 'Verify Your Email',
        html: `
          <h1>Email Verification</h1>
          <p>Hello ${user.username},</p>
          <p>Please verify your email by clicking the link below:</p>
          <p><a href="${this.configService.get('FRONTEND_URL')}/verify-email?token=${verificationToken.token}">Verify Email</a></p>
          <p>This link will expire in 24 hours.</p>
        `,
      });

      // Send welcome email
      await this.emailService.sendMail({
        to: user.email,
        subject: 'Welcome to Our Platform',
        html: `
          <h1>Welcome to Our Platform</h1>
          <p>Hello ${user.username},</p>
          <p>Thank you for registering with us. We're excited to have you on board!</p>
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        `,
      });

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateAuthTokens(user.id, false);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          is2FAEnabled: user.is2FAEnabled,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      this.logger.error(`Registration error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    try {
      const { email, password } = loginInput;

      // Find user by email
      const user = await this.userServiceClient.findByEmail(email);

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('User account is inactive');
      }

      // Validate password
      const isPasswordValid = await this.userServiceClient.validatePassword(user.id, password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Check if 2FA is enabled
      if (user.is2FAEnabled) {
        const { accessToken, refreshToken } = await this.generateAuthTokens(user.id, false);

        return {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            is2FAEnabled: user.is2FAEnabled,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          requires2FA: true,
        };
      }

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateAuthTokens(user.id, false);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          is2FAEnabled: user.is2FAEnabled,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      this.logger.error(`Login error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async loginWith2FA(loginInput: Verify2FALoginInput): Promise<AuthResponse> {
    try {
      const { email, password, token } = loginInput;

      // Find user by email
      const user = await this.userServiceClient.findByEmail(email);

      if (!user) {
        throw new UnauthorizedException('Invalid email or password');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('User account is inactive');
      }

      // Validate password
      const isPasswordValid = await this.userServiceClient.validatePassword(user.id, password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Verify 2FA token
      const isValid = authenticator.verify({
        token,
        secret: user.twoFactorAuthSecret,
      });

      if (!isValid) {
        throw new UnauthorizedException('Invalid 2FA token');
      }

      // Generate tokens with 2FA verified
      const { accessToken, refreshToken } = await this.generateAuthTokens(user.id, true);

      return {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          is2FAEnabled: user.is2FAEnabled,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      this.logger.error(`2FA login error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async refreshToken(refreshTokenInput: RefreshTokenInput): Promise<AuthResponse> {
    try {
      const { refreshToken } = refreshTokenInput;

      // Verify refresh token
      const tokenDoc = await this.tokenModel.findOne({
        token: refreshToken,
        type: 'refresh',
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      });

      if (!tokenDoc) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Get user
      const user = await this.userServiceClient.findOne(tokenDoc.userId);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Revoke old refresh token
      await this.tokenModel.findByIdAndUpdate(tokenDoc._id, { isRevoked: true });

      // Generate new tokens
      const newTokens = await this.generateAuthTokens(
        user.id,
        user.is2FAEnabled ? false : true,
      );

      return {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePicture: user.profilePicture,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          is2FAEnabled: user.is2FAEnabled,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      this.logger.error(`Refresh token error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async logout(logoutInput: LogoutInput): Promise<LogoutResponse> {
    try {
      const { refreshToken } = logoutInput;

      // Find and revoke refresh token
      const result = await this.tokenModel.updateOne(
        { token: refreshToken, type: 'refresh', isRevoked: false },
        { isRevoked: true },
      );

      if (result.modifiedCount === 0) {
        return { success: false, message: 'Invalid or already revoked token' };
      }

      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      this.logger.error(`Logout error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async generate2FA(enable2FAInput: Enable2FAInput): Promise<TwoFactorAuthResponse> {
    try {
      const { userId } = enable2FAInput;

      // Get user
      const user = await this.userServiceClient.findOne(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Generate 2FA secret
      const secret = authenticator.generateSecret();

      // Generate OTP auth URL
      const appName = this.configService.get<string>(
        'TWO_FACTOR_AUTHENTICATION_APP_NAME',
        'AuthApp',
      );
      const otpauthUrl = authenticator.keyuri(user.email, appName, secret);

      // Generate QR code
      const qrCodeUrl = await toDataURL(otpauthUrl);

      // Store secret temporarily (will be saved after verification)
      await this.userServiceClient.update(userId, {
        twoFactorAuthSecret: secret,
        is2FAEnabled: false,
      });

      // Import the QR code email template
      const { qrCodeEmailTemplate } = await import('../../common/templates/qr-code-email.template');

      // Send email with QR code
      await this.emailService.sendMail({
        to: user.email,
        subject: 'Two-Factor Authentication Setup',
        html: qrCodeEmailTemplate({
          username: user.username,
          qrCodeUrl,
          secret,
        }),
      });

      return {
        secret,
        otpauthUrl,
        qrCodeUrl,
      };
    } catch (error) {
      this.logger.error(`Generate 2FA error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async verify2FA(verify2FAInput: Verify2FAInput): Promise<VerifyTwoFactorAuthResponse> {
    try {
      const { userId, token } = verify2FAInput;

      // Get user
      const user = await this.userServiceClient.findOne(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.twoFactorAuthSecret) {
        throw new BadRequestException('2FA not initialized');
      }

      // Verify token
      const isValid = authenticator.verify({
        token,
        secret: user.twoFactorAuthSecret,
      });

      if (!isValid) {
        return { success: false, message: 'Invalid 2FA token' };
      }

      // Enable 2FA
      await this.userServiceClient.update(userId, { is2FAEnabled: true });

      return { success: true, message: '2FA enabled successfully' };
    } catch (error) {
      this.logger.error(`Verify 2FA error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async disable2FA(userId: string): Promise<VerifyTwoFactorAuthResponse> {
    try {
      // Get user
      const user = await this.userServiceClient.findOne(userId);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Disable 2FA
      await this.userServiceClient.update(userId, {
        is2FAEnabled: false,
        twoFactorAuthSecret: null,
      });

      return { success: true, message: '2FA disabled successfully' };
    } catch (error) {
      this.logger.error(`Disable 2FA error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async requestPasswordReset(
    requestPasswordResetInput: RequestPasswordResetInput,
  ): Promise<PasswordResetResponse> {
    try {
      const { email } = requestPasswordResetInput;

      // Find user by email
      const user = await this.userServiceClient.findByEmail(email);

      if (!user) {
        // Don't reveal that the email doesn't exist
        return {
          success: true,
          message: 'If your email is registered, you will receive a password reset link',
        };
      }

      // Generate reset token
      const resetToken = await this.generateToken(user.id, 'reset', '1h');

      // Send password reset email
      await this.emailService.sendMail({
        to: user.email,
        subject: 'Reset Your Password',
        html: `
          <h1>Password Reset</h1>
          <p>Hello ${user.username},</p>
          <p>You requested a password reset. Please click the link below to reset your password:</p>
          <p><a href="${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken.token}">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this password reset, please ignore this email.</p>
        `,
      });

      return {
        success: true,
        message: 'If your email is registered, you will receive a password reset link',
      };
    } catch (error) {
      this.logger.error(`Request password reset error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async resetPassword(resetPasswordInput: ResetPasswordInput): Promise<PasswordResetResponse> {
    try {
      const { token, password } = resetPasswordInput;

      // Find token
      const tokenDoc = await this.tokenModel.findOne({
        token,
        type: 'reset',
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      });

      if (!tokenDoc) {
        throw new BadRequestException('Invalid or expired token');
      }

      // Update password
      await this.userServiceClient.update(tokenDoc.userId, { password });

      // Revoke token
      await this.tokenModel.findByIdAndUpdate(tokenDoc._id, { isRevoked: true });

      // Revoke all refresh tokens for this user
      await this.tokenModel.updateMany(
        { userId: tokenDoc.userId, type: 'refresh', isRevoked: false },
        { isRevoked: true },
      );

      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      this.logger.error(`Reset password error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async verifyEmail(verifyEmailInput: VerifyEmailInput): Promise<EmailVerificationResponse> {
    try {
      const { token } = verifyEmailInput;

      // Find token
      const tokenDoc = await this.tokenModel.findOne({
        token,
        type: 'verification',
        isRevoked: false,
        expiresAt: { $gt: new Date() },
      });

      if (!tokenDoc) {
        throw new BadRequestException('Invalid or expired token');
      }

      // Update user
      await this.userServiceClient.update(tokenDoc.userId, { isEmailVerified: true });

      // Revoke token
      await this.tokenModel.findByIdAndUpdate(tokenDoc._id, { isRevoked: true });

      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      this.logger.error(`Verify email error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async resendVerificationEmail(email: string): Promise<EmailVerificationResponse> {
    try {
      // Find user by email
      const user = await this.userServiceClient.findByEmail(email);

      if (!user) {
        // Don't reveal that the email doesn't exist
        return {
          success: true,
          message: 'If your email is registered, you will receive a verification email',
        };
      }

      if (user.isEmailVerified) {
        return { success: false, message: 'Email is already verified' };
      }

      // Generate verification token
      const verificationToken = await this.generateToken(user.id, 'verification', '1d');

      // Send verification email
      await this.emailService.sendMail({
        to: user.email,
        subject: 'Verify Your Email',
        html: `
          <h1>Email Verification</h1>
          <p>Hello ${user.username},</p>
          <p>Please verify your email by clicking the link below:</p>
          <p><a href="${this.configService.get('FRONTEND_URL')}/verify-email?token=${verificationToken.token}">Verify Email</a></p>
          <p>This link will expire in 24 hours.</p>
        `,
      });

      return {
        success: true,
        message: 'If your email is registered, you will receive a verification email',
      };
    } catch (error) {
      this.logger.error(`Resend verification email error: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async generateAuthTokens(
    userId: string,
    is2FAVerified: boolean,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Generate access token
    const accessTokenExpiration = this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m');
    const accessToken = this.jwtService.sign(
      { sub: userId, is2FAVerified },
      { expiresIn: accessTokenExpiration },
    );

    // Generate refresh token
    const refreshTokenExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');
    const refreshTokenDoc = await this.generateToken(userId, 'refresh', refreshTokenExpiration);

    return { accessToken, refreshToken: refreshTokenDoc.token };
  }

  private async generateToken(
    userId: string,
    type: 'refresh' | 'reset' | 'verification',
    expiration: string,
  ): Promise<TokenDocument> {
    // Generate random token
    const tokenString = crypto.randomBytes(40).toString('hex');

    // Calculate expiration date
    const expiresAt = this.calculateExpirationDate(expiration);

    // Create token document
    const token = new this.tokenModel({
      userId,
      token: tokenString,
      type,
      expiresAt,
    });

    await token.save();
    return token;
  }

  private calculateExpirationDate(expiration: string): Date {
    const expiresIn = expiration.match(/^(\d+)([smhd])$/);
    if (!expiresIn) {
      throw new Error(`Invalid expiration format: ${expiration}`);
    }

    const value = parseInt(expiresIn[1], 10);
    const unit = expiresIn[2];

    const expiresAt = new Date();
    switch (unit) {
      case 's':
        expiresAt.setSeconds(expiresAt.getSeconds() + value);
        break;
      case 'm':
        expiresAt.setMinutes(expiresAt.getMinutes() + value);
        break;
      case 'h':
        expiresAt.setHours(expiresAt.getHours() + value);
        break;
      case 'd':
        expiresAt.setDate(expiresAt.getDate() + value);
        break;
    }

    return expiresAt;
  }
}