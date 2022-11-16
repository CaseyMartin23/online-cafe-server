import { IsString, IsPhoneNumber } from "class-validator";

export class CreateAddressDto {
  @IsString()
  firstName: string;
  
  @IsString()
  lastName: string;
  
  @IsString()
  streetAddress: string;
  
  @IsString()
  aptAddress: string;
  
  @IsString()
  city: string;
  
  @IsString()
  state: string;
  
  @IsString()
  country: string;
  
  @IsString()
  zip: string;
  
  @IsPhoneNumber()
  phoneNumber: string;
}
