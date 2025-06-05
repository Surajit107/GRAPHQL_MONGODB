import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../../users/services/users.service';
import { LoginInput } from '../dto/login.input';
import { RegisterInput } from '../dto/register.input';
import { User } from '../../users/schemas/user.schema';
import { LoggerService } from '../../common/services/logger.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private readonly logger: LoggerService,
  ) {}

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

  async login(loginInput: LoginInput) {
    try {
      const user = await this.validateUser(loginInput.email, loginInput.password);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { email: user.email, sub: user._id };
      return {
        access_token: this.jwtService.sign(payload),
        user,
      };
    } catch (error) {
      this.logger.error('Error during login', error.stack);
      throw error;
    }
  }

  async register(registerInput: RegisterInput) {
    try {
      const existingUser = await this.usersService.findByEmail(registerInput.email);
      if (existingUser) {
        throw new UnauthorizedException('Email already exists');
      }

      const user = await this.usersService.create(registerInput);
      const { password, ...result } = user.toObject();

      const payload = { email: user.email, sub: user._id };
      return {
        access_token: this.jwtService.sign(payload),
        user: result,
      };
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
} 