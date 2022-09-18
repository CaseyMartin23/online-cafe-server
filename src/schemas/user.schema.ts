import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop(String)
  firstname: string;

  @Prop(String)
  lastname: string;

  @Prop(String)
  email: string;

  @Prop(Boolean)
  isAdmin: boolean = false;

  @Prop(String)
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
