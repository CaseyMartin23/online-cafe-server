import { PartialType } from '@nestjs/mapped-types';
import { CreateDeliveryAddressDto } from './create-deliveryAddress.dto';

export class UpdateDeliveryDto extends PartialType(CreateDeliveryAddressDto) { }
