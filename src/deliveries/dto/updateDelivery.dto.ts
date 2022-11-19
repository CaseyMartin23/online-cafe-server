import { PartialType } from '@nestjs/mapped-types';
import { IsString } from 'class-validator';
import { CreateDeliveryDto } from './createDelivery.dto';

export class UpdateDeliveryDto extends PartialType(CreateDeliveryDto) {
  @IsString()
  status: string;
}
