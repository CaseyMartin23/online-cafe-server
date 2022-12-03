import { IsMongoId } from "class-validator";

export class CreateDeliveryQuoteDto {
  @IsMongoId()
  orderId: string;
}