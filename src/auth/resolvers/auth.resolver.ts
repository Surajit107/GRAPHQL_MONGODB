import { Resolver, Mutation, Args, ObjectType, Field } from '@nestjs/graphql';
import { AuthService } from '../services/auth.service';
import { LoginInput } from '../dto/login.input';
import { RegisterInput } from '../dto/register.input';
import { RefreshTokenInput } from '../dto/refresh-token.input';
import { LogoutInput } from '../dto/logout.input';
import { AuthResponse } from '../types/auth.types';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { User } from '../../users/schemas/user.schema';
import { Enable2FAInput } from '../dto/enable-2fa.input';
import { Verify2FAInput } from '../dto/verify-2fa.input';
import { Verify2FALoginInput } from '../dto/verify-2fa-login.input';

@ObjectType()
class TwoFASecretResponse {
  @Field()
  secret: string;

  @Field()
  qr: string;
}

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }

  @Mutation(() => AuthResponse)
  async login(@Args('loginInput') loginInput: LoginInput) {
    return this.authService.login(loginInput);
  }

  @Mutation(() => AuthResponse)
  async register(@Args('registerInput') registerInput: RegisterInput) {
    return this.authService.register(registerInput);
  }

  @Mutation(() => AuthResponse)
  async refreshToken(@Args('refreshTokenInput') input: RefreshTokenInput) {
    return this.authService.refreshToken(input.userId, input.refreshToken);
  }

  @Mutation(() => Boolean)
  async logout(@Args('logoutInput') input: LogoutInput) {
    return this.authService.logout(input.userId, input.refreshToken);
  }

  @Mutation(() => AuthResponse)
  @UseGuards(JwtAuthGuard)
  async refreshTokenWithAuth(@CurrentUser() user: User) {
    // Optionally allow refresh by current user context
    return this.authService.refreshToken(user._id, '');
  }

  @Mutation(() => TwoFASecretResponse)
  async generate2FASecret(@Args('userId', { type: () => String }) userId: string) {
    const user = await this.authService['usersService'].findOne(userId);
    return this.authService.generate2FASecret(user);
  }

  @Mutation(() => Boolean)
  async enable2FA(@Args('enable2FAInput') input: Enable2FAInput) {
    await this.authService.enable2FA(input.userId, input.secret);
    return true;
  }

  @Mutation(() => Boolean)
  async verify2FACode(@Args('verify2FAInput') input: Verify2FAInput) {
    const user = await this.authService['usersService'].findOne(input.userId);
    return this.authService.verify2FACode(user, input.code);
  }

  @Mutation(() => Boolean)
  async disable2FA(@Args('userId', { type: () => String }) userId: string) {
    await this.authService.disable2FA(userId);
    return true;
  }

  @Mutation(() => AuthResponse)
  async verify2FALogin(@Args('verify2FALoginInput') input: Verify2FALoginInput) {
    return this.authService.verify2FALogin(input.userId, input.code);
  }
} 