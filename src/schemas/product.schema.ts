import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
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
}

export const ProductSchema = SchemaFactory.createForClass(Product);
