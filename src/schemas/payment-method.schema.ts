import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongoSchema } from 'mongoose';
import { User } from './user.schema';

export type PaymentMethodDocument = PaymentMethod & Document;

@Schema()
export class PaymentMethod {
  @Prop(String)
  type: string;

  @Prop(String)
  holderName?: string;

  @Prop(String)
  cardNumber?: string;

  @Prop(String)
  fractalCardNumber?: string;

  @Prop(String)
  username?: string;

  @Prop(String)
  email?: string;
}

export const PaymentMethodSchema = SchemaFactory.createForClass(PaymentMethod);
