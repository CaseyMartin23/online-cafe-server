import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { DefaultSchema } from './default.shema';

export type DeliveryDocument = Delivery & Document;

@Schema()
export class Delivery extends DefaultSchema {
  @Prop(String)
  type: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Address' })
  addressId: string;

  @Prop(String)
  status: string;
}

export const DeliverySchema = SchemaFactory.createForClass(Delivery);