import { PartialType } from '@nestjs/mapped-types';
import { CreateDeliveryAddressDto } from './createDeliveryAddress.dto';

export class UpdateDeliveryDto extends PartialType(CreateDeliveryAddressDto) { }
