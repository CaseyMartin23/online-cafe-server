import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongoSchema } from 'mongoose';
import { DeliveryAddress } from './deliveryAddress.schema';
import { PaymentMethod } from './payment-method.schema';
import { Product } from './product.schema';

export type OrderDocument = Order & Document;

@Schema()
export class Order {
  @Prop(Date)
  dateOrdered: Date;

  @Prop(Date)
  datePaid: Date;

  @Prop(String)
  status: string;

  @Prop(Date)
  dateFulfilled: Date;

  @Prop(String)
  signedBy: string;

  @Prop(String)
  deliveryMethod: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
