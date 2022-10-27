import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongoSchema } from 'mongoose';

export type OrderProductDocument = OrderProduct & Document;

@Schema()
export class OrderProduct {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: "Order" })
  orderId: MongoSchema.Types.ObjectId;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: "Product" })
  productId: MongoSchema.Types.ObjectId;
}

export const UserProductSchema = SchemaFactory.createForClass(OrderProduct);
