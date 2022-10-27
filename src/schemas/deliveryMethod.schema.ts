import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DeliveryMethodDocument = DeliveryMethod & Document;

@Schema()
export class DeliveryMethod {
  @Prop(String)
  type: string;

  // Add Delivery Method Details
}

export const DeliveryMethodSchema = SchemaFactory.createForClass(DeliveryMethod);