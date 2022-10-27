import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongoSchema } from 'mongoose';

export type OrderPaymentMethodDocument = OrderPaymentMethod & Document;

@Schema()
export class OrderPaymentMethod {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: "Order" })
  orderId: MongoSchema.Types.ObjectId;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: "PaymentMethod" })
  paymentMethodId: MongoSchema.Types.ObjectId;
}

export const OrderPaymentMethodSchema = SchemaFactory.createForClass(OrderPaymentMethod);
