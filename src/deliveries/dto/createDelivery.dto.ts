import { IsMongoId } from "class-validator"

export class CreateDeliveryDto {
  @IsMongoId()
  orderId: string;
}