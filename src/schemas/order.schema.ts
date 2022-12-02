import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { DefaultSchema } from './default.shema';

export type OrderDocument = Order & Document;
export enum OrderStatuses {
  Partial = "partial",
  Complete = "complete",
  Pending = "pending",
  Cancelled = "cancelled",
  Fulfilled = "fulfilled",
}

@Schema()
export class Order extends DefaultSchema {
  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  userId: string;

  @Prop({ type: String, enum: OrderStatuses })
  status: OrderStatuses = OrderStatuses.Partial;

  @Prop({ type: SchemaTypes.ObjectId, ref: "Cart" })
  cartId: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: "Delivery" })
  deliveryId: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: "Payment" })
  paymentId: string;

  @Prop(Date)
  dateOrdered: Date;

  @Prop(Date)
  datePaid: Date;

  @Prop(Date)
  dateFulfilled: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
