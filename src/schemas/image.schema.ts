import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ImageDocument = Image & Document;

@Schema()
export class Image {
  @Prop(String)
  name: string;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
