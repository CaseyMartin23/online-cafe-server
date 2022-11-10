import { IsEmail, IsString } from "class-validator"

export class LoginUserDto {
  @IsString()
  id?: string;
  
  @IsEmail()
  email?: string;

  @IsString()
  password?: string;
}