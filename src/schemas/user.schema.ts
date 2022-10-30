import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop(String)
  firstName: string;

  @Prop(String)
  lastName: string;

  @Prop(String)
  email: string;

  @Prop(Boolean)
  isAdmin: boolean = false;

  @Prop(String)
  password: string;

  @Prop(String)
  refreshToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
