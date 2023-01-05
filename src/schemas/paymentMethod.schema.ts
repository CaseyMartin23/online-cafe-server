import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { DefaultSchema } from './default.shema';

export type PaymentMethodDocument = PaymentMethod & Document;
export enum PaymentMethods {
  Card = "card",
  Paypal = "paypal",
}

@Schema()
export class PaymentMethod extends DefaultSchema {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ type: String, enum: PaymentMethods })
  type: PaymentMethods;

  @Prop(Boolean)
  default: boolean = false;

  @Prop(String)
  customerId?: string;

  @Prop(String)
  sourceId?: string;

  // Add paypal method options
}

export const PaymentMethodSchema = SchemaFactory.createForClass(PaymentMethod);
