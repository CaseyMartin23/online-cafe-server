import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongoSchema } from 'mongoose';

export type OrderDeliveryMethodDocument = OrderDeliveryMethod & Document;

@Schema()
export class OrderDeliveryMethod {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: "Order" })
  orderId: MongoSchema.Types.ObjectId;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: "DeliveryAddress" })
  deliveryAddressId: MongoSchema.Types.ObjectId;
}

export const OrderDeliveryMethodSchema = SchemaFactory.createForClass(OrderDeliveryMethod);
