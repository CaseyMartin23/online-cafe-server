import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

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

  @Prop({ type: SchemaTypes.ObjectId, ref: "User" })
  createdBy: string;

  @Prop(Boolean)
  isPublished: boolean = false;

  @Prop(Date)
  dateCreated: Date = new Date();

  @Prop(Date)
  dateUpdated: Date = new Date();
}

export const ProductSchema = SchemaFactory.createForClass(Product);
