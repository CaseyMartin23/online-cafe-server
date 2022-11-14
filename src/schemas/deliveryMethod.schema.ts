import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { DefaultSchema } from './default.shema';

export type DeliveryMethodDocument = DeliveryMethod & Document;

@Schema()
export class DeliveryMethod extends DefaultSchema {
  @Prop(String)
  type: string;

  // Add Delivery Method Details
}

export const DeliveryMethodSchema = SchemaFactory.createForClass(DeliveryMethod);