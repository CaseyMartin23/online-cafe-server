import { Module } from '@nestjs/common';
import { DeliveryAddressesService } from './deliveryAddresses.service';
import { DeliveryAddressesController } from './deliveryAddresses.controller';

@Module({
  controllers: [DeliveryAddressesController],
  providers: [DeliveryAddressesService]
})
export class DeliveryAddressesModule { }
