import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../../common/services/logger.service';
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
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Jwt2faAuthGuard } from '../guards/jwt-2fa-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService, private logger: LoggerService) {}

  @Query(() => String)
  authHealthCheck() {
    return 'Auth service is healthy';
  }

  @Mutation(() => AuthResponse)
  async register(@Args('input') registerInput: RegisterInput): Promise<AuthResponse> {
    this.logger.log(`Registration attempt for email: ${registerInput.email}`, 'AuthResolver');
    return this.authService.register(registerInput);
  }

  @Mutation(() => AuthResponse)
  async login(@Args('input') loginInput: LoginInput): Promise<AuthResponse> {
    this.logger.log(`Login attempt for email: ${loginInput.email}`, 'AuthResolver');
    return this.authService.login(loginInput);
  }

  @Mutation(() => AuthResponse)
  async loginWith2FA(@Args('input') loginInput: Verify2FALoginInput): Promise<AuthResponse> {
    this.logger.log(`2FA login attempt for email: ${loginInput.email}`, 'AuthResolver');
    return this.authService.loginWith2FA(loginInput);
  }

  @Mutation(() => AuthResponse)
  async refreshToken(
    @Args('input') refreshTokenInput: RefreshTokenInput,
  ): Promise<AuthResponse> {
    this.logger.log('Token refresh attempt', 'AuthResolver');
    return this.authService.refreshToken(refreshTokenInput);
  }

  @Mutation(() => LogoutResponse)
  async logout(@Args('input') logoutInput: LogoutInput): Promise<LogoutResponse> {
    this.logger.log('Logout attempt', 'AuthResolver');
    return this.authService.logout(logoutInput);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => TwoFactorAuthResponse)
  async generate2FA(
    @Args('input') enable2FAInput: Enable2FAInput,
    @CurrentUser() user: any,
  ): Promise<TwoFactorAuthResponse> {
    this.logger.log(`2FA generation attempt for user: ${user.id}`, 'AuthResolver');
    return this.authService.generate2FA(enable2FAInput);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => VerifyTwoFactorAuthResponse)
  async verify2FA(
    @Args('input') verify2FAInput: Verify2FAInput,
    @CurrentUser() user: any,
  ): Promise<VerifyTwoFactorAuthResponse> {
    this.logger.log(`2FA verification attempt for user: ${user.id}`, 'AuthResolver');
    return this.authService.verify2FA(verify2FAInput);
  }

  @UseGuards(Jwt2faAuthGuard)
  @Mutation(() => VerifyTwoFactorAuthResponse)
  async disable2FA(@CurrentUser() user: any): Promise<VerifyTwoFactorAuthResponse> {
    this.logger.log(`2FA disable attempt for user: ${user.id}`, 'AuthResolver');
    return this.authService.disable2FA(user.id);
  }

  @Mutation(() => PasswordResetResponse)
  async requestPasswordReset(
    @Args('input') requestPasswordResetInput: RequestPasswordResetInput,
  ): Promise<PasswordResetResponse> {
    this.logger.log(
      `Password reset request for email: ${requestPasswordResetInput.email}`,
      'AuthResolver',
    );
    return this.authService.requestPasswordReset(requestPasswordResetInput);
  }

  @Mutation(() => PasswordResetResponse)
  async resetPassword(
    @Args('input') resetPasswordInput: ResetPasswordInput,
  ): Promise<PasswordResetResponse> {
    this.logger.log('Password reset attempt', 'AuthResolver');
    return this.authService.resetPassword(resetPasswordInput);
  }

  @Mutation(() => EmailVerificationResponse)
  async verifyEmail(
    @Args('input') verifyEmailInput: VerifyEmailInput,
  ): Promise<EmailVerificationResponse> {
    this.logger.log('Email verification attempt', 'AuthResolver');
    return this.authService.verifyEmail(verifyEmailInput);
  }

  @Mutation(() => EmailVerificationResponse)
  async resendVerificationEmail(
    @Args('email') email: string,
  ): Promise<EmailVerificationResponse> {
    this.logger.log(`Verification email resend request for: ${email}`, 'AuthResolver');
    return this.authService.resendVerificationEmail(email);
  }
}