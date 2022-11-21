import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { CaslModule } from 'src/auth/casl/casl.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from 'src/schemas/payment.schema';
import { CartModule } from 'src/cart/cart.module';

@Module({
  imports: [
    CaslModule, 
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
    CartModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService]
})
export class PaymentsModule {}
