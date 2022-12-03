import { IsEnum, IsMongoId } from "class-validator";
import { PaymentType } from "src/schemas/payment.schema";

export class CreatePaymentDto {
  @IsEnum(PaymentType)
  type: PaymentType;

  @IsMongoId()
  orderId: string;
}