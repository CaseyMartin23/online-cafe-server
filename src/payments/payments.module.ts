import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { CaslModule } from 'src/auth/casl/casl.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from 'src/schemas/payment.schema';

@Module({
  imports: [
    CaslModule, 
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }]),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService]
})
export class PaymentsModule {}
