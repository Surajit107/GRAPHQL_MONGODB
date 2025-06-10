import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TokenDocument = Token & Document;

@Schema({ timestamps: true })
export class Token {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, unique: true, index: true })
  token: string;

  @Prop({ required: true, enum: ['refresh', 'reset', 'verification'] })
  type: string;

  @Prop({ required: true, default: false })
  isRevoked: boolean;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);

// Create indexes
TokenSchema.index({ token: 1 }, { unique: true });
TokenSchema.index({ userId: 1, type: 1 });
TokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });