import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { DefaultSchema } from './default.shema';

export enum PaymentStatus {
  Incomplete = "incomplete",
  Complete = "complete",
  Exception = "exception",
}

export type PaymentDocument = Payment & Document;

@Schema()
export class Payment extends DefaultSchema {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'PaymentMethod' })
  methodId: string;

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
