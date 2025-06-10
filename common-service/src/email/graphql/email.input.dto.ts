import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class AttachmentInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  filename: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  content: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  contentType?: string;
}

@InputType()
export class SendEmailInput {
  @Field(() => [String])
  @IsArray()
  @IsEmail({}, { each: true })
  to: string[];

  @Field()
  @IsString()
  @IsNotEmpty()
  subject: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  text?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  html?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  from?: string;

  @Field(() => [AttachmentInput], { nullable: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AttachmentInput)
  attachments?: AttachmentInput[];
}