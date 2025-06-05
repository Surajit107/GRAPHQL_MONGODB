import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Document } from 'mongoose';

@ObjectType()
@Schema({ timestamps: true })
export class User extends Document {
  @Field(() => ID)
  _id: string;

  @Field()
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Field()
  @Prop({ required: true })
  firstName: string;

  @Field()
  @Prop({ required: true })
  lastName: string;

  @Field({ nullable: true })
  @Prop()
  twoFactorSecret?: string;

  @Field()
  @Prop({ default: false })
  isTwoFactorEnabled: boolean;

  @Field()
  @Prop({ default: false })
  isEmailVerified: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User); 