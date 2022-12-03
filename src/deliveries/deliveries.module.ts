import { Module } from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import { DeliveriesController } from './deliveries.controller';
import { CaslModule } from 'src/auth/casl/casl.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Delivery, DeliverySchema } from 'src/schemas/delivery.schema';
import { AddressesModule } from 'src/addresses/addresses.module';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [
    CaslModule, 
    MongooseModule.forFeature([{ name: Delivery.name, schema: DeliverySchema }]),
    AddressesModule,
    OrdersModule,
  ],
  controllers: [DeliveriesController],
  providers: [DeliveriesService]
})
export class DeliveriesModule {}
