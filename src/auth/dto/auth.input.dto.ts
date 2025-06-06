import { InputType, Field, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsEmail, MinLength } from 'class-validator';

@InputType()
export class Enable2FAInput {
    @Field(() => ID)
    @IsNotEmpty()
    userId: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    secret: string;
};

@InputType()
export class LoginInput {
    @Field()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    password: string;
}

@InputType()
export class LogoutInput {
    @Field(() => ID)
    @IsNotEmpty()
    userId: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}

@InputType()
export class RefreshTokenInput {
    @Field(() => ID)
    @IsNotEmpty()
    userId: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}

@InputType()
export class RegisterInput {
    @Field()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @Field()
    @IsString()
    @MinLength(6)
    password: string;
}

@InputType()
export class Verify2FALoginInput {
    @Field(() => ID)
    @IsNotEmpty()
    userId: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    code: string;
}

@InputType()
export class Verify2FAInput {
    @Field(() => ID)
    @IsNotEmpty()
    userId: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    code: string;
} 