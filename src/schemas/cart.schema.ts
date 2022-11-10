import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

export type CartDocument = Cart & Document;

@Schema()
export class Cart {
    @Prop({ type: SchemaTypes.ObjectId, ref: 'User' })
    userId: string;

    @Prop({ type: [{ type: SchemaTypes.ObjectId, ref: 'CartItem' }] })
    cartItems: string[];
  
    @Prop(String)
    totalPrice: string;
}

export const CartSchema = SchemaFactory.createForClass(Cart);