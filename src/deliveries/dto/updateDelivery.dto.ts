import { IsString, IsMongoId, IsEnum } from 'class-validator';
import { DeliveryStatus } from 'src/schemas/delivery.schema';

export class UpdateDeliveryDto {
  @IsString()
  type: string;

  @IsEnum(DeliveryStatus)
  status: DeliveryStatus;
  
  @IsMongoId()
  addressId: string;
}
