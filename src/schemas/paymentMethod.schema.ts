import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { DefaultSchema } from './default.shema';

export type PaymentMethodDocument = PaymentMethod & Document;

@Schema()
export class PaymentMethod extends DefaultSchema {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  userId: string;

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
