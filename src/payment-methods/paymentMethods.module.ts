import { Module } from '@nestjs/common';
import { PaymentMethodsService } from './paymentMethods.service';
import { PaymentMethodsController } from './paymentMethods.controller';

@Module({
  controllers: [PaymentMethodsController],
  providers: [PaymentMethodsService]
})
export class PaymentMethodsModule {}
