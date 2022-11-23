import { IsPhoneNumber, IsString } from "class-validator";

export class GetDeliveryQuote {
  @IsString()
  pickupAddress: string;
  
  @IsString()
  pickupBusinessName: string;
  
  @IsPhoneNumber("US")
  pickupPhoneNumber: string;
  
  @IsString()
  pickupInstructions: string;
  
  @IsString()
  dropoffAddress: string;
  
  @IsString()
  dropoffBusinessName: string;
  
  @IsPhoneNumber("US")
  dropoffPhoneNumber: string;
  
  @IsString()
  dropoffInstructions: string;
}