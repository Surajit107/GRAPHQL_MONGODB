import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './services/auth.service';
import { AuthResolver } from './resolvers/auth.resolver';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Jwt2faStrategy } from './strategies/jwt-2fa.strategy';
import { UserServiceClient } from './clients/user-service.client';
import { CommonServiceClient } from './clients/common-service.client';
import { Token, TokenSchema } from './schemas/token.schema';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION', '15m'),
        },
      }),
    }),
    HttpModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        timeout: configService.get<number>('HTTP_TIMEOUT', 5000),
        maxRedirects: configService.get<number>('HTTP_MAX_REDIRECTS', 5),
      }),
    }),
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
    CommonModule,
  ],
  providers: [
    AuthService,
    AuthResolver,
    JwtStrategy,
    Jwt2faStrategy,
    UserServiceClient,
    CommonServiceClient,
  ],
  exports: [AuthService],
})
export class AuthModule {}