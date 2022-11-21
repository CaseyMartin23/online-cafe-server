import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { DefaultSchema } from './default.shema';

export type DeliveryDocument = Delivery & Document;
export enum DeliveryType { 
  InHouse = "in-house",
  DoorDash = "door-dash",
}
export enum DeliveryStatus {
  Pending = "pending",
  OnTheWay = "on-the-way",
  Delivered = "delivered",
  Cancelled = "cancelled",
  Exception = "exception",
}

@Schema()
export class Delivery extends DefaultSchema {
  @Prop({ type: String, enum: DeliveryType })
  type: DeliveryType;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Address' })
  addressId: string;

  @Prop({ type: String, enum: DeliveryStatus })
  status: DeliveryStatus = DeliveryStatus.Pending;
}

export const DeliverySchema = SchemaFactory.createForClass(Delivery);