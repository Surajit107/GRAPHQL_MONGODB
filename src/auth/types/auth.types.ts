import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/schemas/user.schema';

@ObjectType()
export class AuthResponse {
  @Field({ nullable: true })
  access_token?: string;

  @Field({ nullable: true })
  refresh_token?: string;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field({ nullable: true })
  requires2FA?: boolean;
} 