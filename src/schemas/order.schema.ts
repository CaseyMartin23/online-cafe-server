import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { DefaultSchema } from './default.shema';

export type OrderDocument = Order & Document;

@Schema()
export class Order extends DefaultSchema {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  userId: string;
  
  @Prop(String)
  status: string;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'CartItem' }] })
  cartItems: string[];

  @Prop({ type: SchemaTypes.ObjectId, ref: 'PaymentMethod' })
  paymentId: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Delivery' })
  deliveryId: string;

  @Prop(Date)
  dateOrdered: Date;

  @Prop(Date)
  datePaid: Date;

  @Prop(Date)
  dateFulfilled: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
