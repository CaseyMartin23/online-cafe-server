import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentMethodDto } from './createPaymentMethod.dto';

export class UpdatePaymentMethodDto extends PartialType(CreatePaymentMethodDto) {}
