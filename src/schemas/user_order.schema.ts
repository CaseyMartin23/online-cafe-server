import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongoSchema } from 'mongoose';

export type UserOrderDocument = UserOrder & Document;

@Schema()
export class UserOrder {
  @Prop({ type: MongoSchema.Types.ObjectId, ref: "User" })
  userId: MongoSchema.Types.ObjectId;

  @Prop({ type: MongoSchema.Types.ObjectId, ref: "Order" })
  orderId: MongoSchema.Types.ObjectId;
}

export const UserOrderSchema = SchemaFactory.createForClass(UserOrder);
