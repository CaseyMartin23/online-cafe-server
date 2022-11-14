import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DefaultSchema } from './default.shema';

export type ImageDocument = Image & Document;

@Schema()
export class Image extends DefaultSchema {
  @Prop(String)
  name: string;

  @Prop(String)
  url: string;

}

export const ImageSchema = SchemaFactory.createForClass(Image);
