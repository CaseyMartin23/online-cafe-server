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
  @Prop(String)
  type: string = DeliveryType.DoorDash;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Address' })
  addressId: string;

  @Prop(String)
  status: string = DeliveryStatus.Pending;
}

export const DeliverySchema = SchemaFactory.createForClass(Delivery);