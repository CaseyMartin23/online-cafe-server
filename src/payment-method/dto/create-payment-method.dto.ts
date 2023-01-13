import { IsEnum, IsMongoId } from "class-validator";
import { PaymentMethods } from "src/schemas/paymentMethod.schema";

export class CreatePaymentMethodDto {
  @IsMongoId()
  orderId: string;

  @IsEnum(PaymentMethods)
  type: string;
}
