import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongoSchema } from 'mongoose';
import { User } from './user.schema';

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

  @Prop({ type: MongoSchema.Types.ObjectId, ref: "User" })
  createdBy: User;

  @Prop(Date)
  dateCreated: Date = new Date();

  @Prop(Date)
  dateUpdated: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
