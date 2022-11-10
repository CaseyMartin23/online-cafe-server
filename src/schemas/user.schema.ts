import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserTypes {
  anonymous = "anonymous",
  identified = "identified"
}

@Schema()
export class User {
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

  @Prop(Date)
  dateCreated: Date = new Date();

  @Prop(Date)
  dateUpdated: Date = new Date();
}

export const UserSchema = SchemaFactory.createForClass(User);
