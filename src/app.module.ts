import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";

import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { CaslModule } from './auth/casl/casl.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { DeliveryAddressesModule } from './delivery-addresses/deliveryAddresses.module';
import { PaymentMethodsModule } from './payment-methods/paymentMethods.module';
import { CartModule } from './cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.DATABASE_URL, { useNewUrlParser: true, dbName: 'online-cafe' }),
    UserModule,
    AuthModule,
    CaslModule,
    ProductsModule,
    OrdersModule,
    DeliveryAddressesModule,
    PaymentMethodsModule,
    CartModule
  ],
})
export class AppModule { }
