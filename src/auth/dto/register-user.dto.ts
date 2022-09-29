import { IsString, IsEmail, IsBoolean } from "class-validator"

export class RegisterUserDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsBoolean()
  isAdmin: boolean = false;

  @IsString()
  password: string;
}