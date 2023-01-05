import { IsEnum, IsMongoId } from "class-validator";
import { PaymentMethods } from "src/schemas/paymentMethod.schema";

export class CreatePaymentDto {
  @IsEnum(PaymentMethods)
  type: PaymentMethods;

  @IsMongoId()
  orderId: string;
}