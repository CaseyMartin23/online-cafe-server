import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongoSchema } from 'mongoose';

export type UserPaymentMethodDocument = UserPaymentMethod & Document;

@Schema()
export class UserPaymentMethod {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: "User" })
  userId: MongoSchema.Types.ObjectId;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: "PaymentMethod" })
  paymentMethodId: MongoSchema.Types.ObjectId;
}

export const UserPaymentMethodSchema = SchemaFactory.createForClass(UserPaymentMethod);
