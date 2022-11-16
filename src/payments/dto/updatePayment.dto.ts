import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './createPayment.dto';

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}
