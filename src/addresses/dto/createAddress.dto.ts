import { IsString, IsPhoneNumber, IsOptional } from "class-validator";

export class CreateAddressDto {
  @IsString()
  firstName: string;
  
  @IsString()
  lastName: string;
  
  @IsString()
  streetAddress: string;
  
  @IsOptional()
  @IsString()
  aptAddress?: string | undefined;
  
  @IsString()
  city: string;
  
  @IsString()
  state: string;
  
  @IsString()
  zip: string;
  
  @IsPhoneNumber("US")
  phoneNumber: string;
}
