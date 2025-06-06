import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../../users/services/users.service';
import { LoginInput, RegisterInput } from '../dto/auth.input.dto';
import { User } from '../../users/schemas/user.schema';
import { LoggerService } from '../../common/services/logger.service';
import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from '../../common/services/email.service';
import { qrCodeEmailTemplate } from '../../common/email-templates/qr-code-email.template';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly logger: LoggerService,
    private readonly emailService: EmailService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (user && (await bcrypt.compare(password, user.password))) {
        const { password, ...result } = user.toObject();
        return result;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error validating user: ${email}`, error.stack);
      throw error;
    }
  }

  private generateRefreshToken(): string {
    return uuidv4() + '.' + uuidv4();
  }

  private async issueTokens(user: User) {
    const payload = { email: user.email, sub: user._id };
    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.generateRefreshToken();
    await this.usersService.update(user._id, {
      refreshTokens: [...(user.refreshTokens || []), refresh_token],
    });
    return { access_token, refresh_token, user };
  }

  async login(loginInput: LoginInput) {
    try {
      const user = await this.usersService.findByEmail(loginInput.email);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const valid = await bcrypt.compare(loginInput.password, user.password);
      if (!valid) {
        throw new UnauthorizedException('Invalid credentials');
      }
      if (user.isTwoFactorEnabled) {
        return {
          requires2FA: true,
          user: { _id: user._id, email: user.email, isTwoFactorEnabled: user.isTwoFactorEnabled },
        };
      }
      return this.issueTokens(user);
    } catch (error) {
      this.logger.error('Error during login', error.stack);
      throw error;
    }
  }

  async verify2FALogin(userId: string, code: string) {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.isTwoFactorEnabled) {
      throw new BadRequestException('2FA not enabled');
    }
    const isValid = await this.verify2FACode(user, code);
    if (!isValid) {
      throw new UnauthorizedException('Invalid 2FA code');
    }
    return this.issueTokens(user);
  }

  async register(registerInput: RegisterInput) {
    try {
      const existingUser = await this.usersService.findByEmail(registerInput.email);
      if (existingUser) {
        throw new UnauthorizedException('Email already exists');
      }
      const user = await this.usersService.create(registerInput);
      return this.issueTokens(user);
    } catch (error) {
      this.logger.error('Error during registration', error.stack);
      throw error;
    }
  }

  async verifyToken(token: string): Promise<User> {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return user;
    } catch (error) {
      this.logger.error('Error verifying token', error.stack);
      throw new UnauthorizedException('Invalid token');
    }
  }

  async generate2FASecret(user: User) {
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(user.email, 'YourAppName', secret);
    const qr = await qrcode.toDataURL(otpauth);
    await this.emailService.sendMail({
      to: user.email,
      subject: 'Your 2FA QR Code',
      html: qrCodeEmailTemplate({ userName: user.firstName, qrCodeUrl: 'cid:qrcodeimg', secret }),
      attachments: [
        {
          filename: 'qrcode.png',
          content: qr.split(',')[1],
          encoding: 'base64',
          cid: 'qrcodeimg',
        },
      ],
    });
    return { secret, otpauth, qr };
  }

  async enable2FA(userId: string, secret: string) {
    return this.usersService.update(userId, { twoFactorSecret: secret, isTwoFactorEnabled: true });
  }

  async verify2FACode(user: User, code: string) {
    if (!user.twoFactorSecret) throw new BadRequestException('2FA not setup');
    return authenticator.verify({ token: code, secret: user.twoFactorSecret });
  }

  async disable2FA(userId: string) {
    return this.usersService.update(userId, { twoFactorSecret: undefined, isTwoFactorEnabled: false });
  }

  async refreshToken(userId: string, refreshToken: string) {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.refreshTokens?.includes(refreshToken)) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    const newRefreshToken = this.generateRefreshToken();
    await this.usersService.update(userId, {
      refreshTokens: [
        ...(user.refreshTokens?.filter(t => t !== refreshToken) || []),
        newRefreshToken,
      ],
    });
    const payload = { email: user.email, sub: user._id };
    const access_token = this.jwtService.sign(payload);
    return { access_token, refresh_token: newRefreshToken, user };
  }

  async logout(userId: string, refreshToken: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) return false;
    await this.usersService.update(userId, {
      refreshTokens: user.refreshTokens?.filter(t => t !== refreshToken) || [],
    });
    return true;
  }
} 