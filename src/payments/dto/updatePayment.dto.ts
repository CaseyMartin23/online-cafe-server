import { Type } from "class-transformer";
import { IsString, IsDate, IsOptional } from "class-validator";

export class UpdatePaymentDto  {
  @IsString()
  stripeId?: string;
  
  @IsString()
  @IsOptional()
  amount?: string;
  
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  createdOnStripe?: Date;

  @IsString()
  @IsOptional()
  stripeStatus?: string;
}
