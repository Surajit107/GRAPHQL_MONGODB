import { Field, InputType, PartialType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {
    @Field()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @Field()
    @IsString()
    @IsNotEmpty()
    lastName: string;
}

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {
    @Field(() => String, { nullable: true })
    twoFactorSecret?: string;

    @Field(() => Boolean, { nullable: true })
    isTwoFactorEnabled?: boolean;

    @Field(() => Boolean, { nullable: true })
    isEmailVerified?: boolean;
}