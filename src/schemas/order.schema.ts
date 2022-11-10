import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema()
export class Order {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  userId: string;
  
  @Prop(String)
  status: string;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'CartItem' }] })
  orderItems: string[];

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'PaymentMethod' }] })
  paymentMethod: string;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'DeliveryMethod' }] })
  deliveryMethod: string;

  @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'DeliveryAddress' }] })
  deliveryAddress: string;

  @Prop(Date)
  dateOrdered: Date;

  @Prop(Date)
  datePaid: Date;

  @Prop(Date)
  dateFulfilled: Date;

  @Prop(String)
  signedBy: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
