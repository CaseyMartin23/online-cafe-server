import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

export type DeliveryAddressDocument = DeliveryAddress & Document;

@Schema()
export class DeliveryAddress {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  userId: string;

  @Prop(String)
  firstName: string;

  @Prop(String)
  lastName: string;

  @Prop(String)
  streetAddress: string;

  @Prop(String)
  aptAddress: string;

  @Prop(String)
  city: string;

  @Prop(String)
  state: string;

  @Prop(String)
  country: string;

  @Prop(String)
  zip: string;

  @Prop(String)
  phoneNumber: string;

  @Prop(String)
  isSelected: boolean = false;
}

export const DeliveryAddressSchema = SchemaFactory.createForClass(DeliveryAddress);
