import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class EmailResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}