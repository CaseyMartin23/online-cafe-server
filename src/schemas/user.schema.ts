import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DefaultSchema } from './default.shema';

export type UserDocument = User & Document;

export enum UserTypes {
  anonymous = "anonymous",
  identified = "identified"
}

@Schema()
export class User extends DefaultSchema {
  @Prop(String)
  type: UserTypes;

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
