import { IsString } from "class-validator"

export class CreateDeliveryDto {
  @IsString()
  type: string;
  
  @IsString()
  addressId: string;
}
