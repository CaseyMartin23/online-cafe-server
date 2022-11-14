import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CaslModule } from 'src/auth/casl/casl.module';
import { Cart, CartSchema } from 'src/schemas/cart.schema';
import { CartItem, CartItemSchema } from 'src/schemas/cartItem.schema';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ProductsModule } from 'src/products/products.module';

@Module({
  imports: [
    CaslModule, 
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }, { name: CartItem.name, schema: CartItemSchema }]),
    ProductsModule
  ],
  controllers: [CartController],
  providers: [CartService]
})
export class CartModule {}
