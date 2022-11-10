import { IsString, IsEmail, IsBoolean } from "class-validator"
import { UserTypes } from "src/schemas/user.schema";

export class RegisterUserDto {
  @IsString()
  type: UserTypes = UserTypes.anonymous;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsBoolean()
  isAdmin: boolean = false;
}