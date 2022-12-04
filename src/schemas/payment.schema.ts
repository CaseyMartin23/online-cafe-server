import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { DefaultSchema } from './default.shema';

export type PaymentDocument = Payment & Document;
export enum PaymentType {
  Card = "card",
  Paypal = "paypal",
}
export enum PaymentStatus {
  Incomplete = "incomplete",
  Complete = "complete",
  Exception = "exception",
}

@Schema()
export class Payment extends DefaultSchema {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ type: String, enum: PaymentType })
  type: PaymentType;

  @Prop({ type: String, enum: PaymentStatus })
  status: PaymentStatus;

  @Prop(String)
  stripeId?: string;
  
  @Prop(String)
  amount?: string;
  
  @Prop(Date)
  createdOnStripe?: Date;
  
  @Prop(String)
  currency?: string;
  
  @Prop(String)
  stripeStatus?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
