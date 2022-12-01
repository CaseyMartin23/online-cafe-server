import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { DefaultSchema } from './default.shema';

export type DeliveryDocument = Delivery & Document;
export enum DeliveryType {
  InHouse = "in-house",
  DoorDash = "door-dash",
}
export enum DeliveryStatus {
  Created = "created",
  Confirmed = "confirmed",
  EnrouteToPickup = "enroute_to_pickup",
  ArrivedAtPickup = "arrived_at_pickup",
  PickedUp = "picked_up",
  EnrouteToDropoff = "enroute_to_dropoff",
  ArrivedAtDropoff = "arrived_at_dropoff",
  Delivered = "delivered",
  Cancelled = "cancelled",
  Exception = "exception",
}

@Schema()
export class Delivery extends DefaultSchema {
  @Prop({ type: String, enum: DeliveryType })
  type: DeliveryType;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Order' })
  orderId: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Address' })
  addressId: string;

  @Prop({ type: String, enum: DeliveryStatus })
  status: DeliveryStatus = DeliveryStatus.Created;
}

export const DeliverySchema = SchemaFactory.createForClass(Delivery);