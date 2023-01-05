import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { DefaultSchema } from './default.shema';

export type AddressDocument = Address & Document;
export type PartialAddress = Partial<AddressDocument>;

@Schema()
export class Address extends DefaultSchema {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
  userId: string;

  @Prop(String)
  firstName: string;

  @Prop(String)
  lastName: string;

  @Prop(String)
  streetAddress: string;

  @Prop(String)
  aptAddress?: string;

  @Prop(String)
  city: string;

  @Prop(String)
  state: string;

  @Prop(String)
  zip: string;

  @Prop(String)
  phoneNumber: string;

  @Prop(Boolean)
  isSelected: boolean = false;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
