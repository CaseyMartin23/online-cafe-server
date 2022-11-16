import { PartialType } from '@nestjs/mapped-types';
import { CreateDeliveryDto } from './createDelivery.dto';

export class UpdateDeliveryDto extends PartialType(CreateDeliveryDto) {}
