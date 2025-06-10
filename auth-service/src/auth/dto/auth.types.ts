import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field()
  id: string;

  @Field()
  username: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  profilePicture?: string;

  @Field()
  isActive: boolean;

  @Field()
  isEmailVerified: boolean;

  @Field()
  is2FAEnabled: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => UserType)
  user: UserType;

  @Field({ nullable: true })
  requires2FA?: boolean;
}

@ObjectType()
export class TwoFactorAuthResponse {
  @Field()
  secret: string;

  @Field()
  otpauthUrl: string;

  @Field()
  qrCodeUrl: string;
}

@ObjectType()
export class VerifyTwoFactorAuthResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}

@ObjectType()
export class LogoutResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}

@ObjectType()
export class PasswordResetResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}

@ObjectType()
export class EmailVerificationResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}