import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongoSchema } from 'mongoose';

export type OrderDeliveryAddressDocument = OrderDeliveryAddress & Document;

@Schema()
export class OrderDeliveryAddress {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: "Order" })
  orderId: MongoSchema.Types.ObjectId;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: "DeliveryAddress" })
  deliveryAddressId: MongoSchema.Types.ObjectId;
}

export const OrderDeliveryAddressSchema = SchemaFactory.createForClass(OrderDeliveryAddress);
