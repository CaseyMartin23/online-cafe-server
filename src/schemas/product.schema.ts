import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';
import { DefaultSchema } from './default.shema';

export type ProductDocument = Product & Document;

@Schema()
export class Product extends DefaultSchema {
  @Prop(String)
  name: string;

  @Prop(String)
  description: string;

  @Prop(String)
  price: string;

  @Prop([String])
  categories: string[];

  @Prop([String])
  images: string[];

  @Prop([String])
  tags: string[];

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  createdBy: string;

  @Prop(Boolean)
  isPublished: boolean = false;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
