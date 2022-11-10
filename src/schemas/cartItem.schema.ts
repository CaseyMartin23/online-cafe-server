import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

export type CartItemDocument = CartItem & Document;

@Schema()
export class CartItem {
    @Prop({ type: SchemaTypes.ObjectId, ref: 'Product' })
    productId: string;
  
    @Prop(String)
    name: string;
  
    @Prop(Number)
    quantity: number;
  
    @Prop(String)
    price: string;
  
    @Prop(String)
    subTotalPrice: string;
}

export const CartItemSchema = SchemaFactory.createForClass(CartItem);