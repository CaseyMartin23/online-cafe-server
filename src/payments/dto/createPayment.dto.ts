import { IsString, IsCreditCard } from "class-validator"

export class CreatePaymentDto {
  @IsString()
  type: string;

  @IsString()
  holderName?: string;

  @IsCreditCard()
  cardNumber?: string;

  @IsString()
  fractalCardNumber?: string;

  @IsString()
  username?: string;

  @IsString()
  email?: string;
}
