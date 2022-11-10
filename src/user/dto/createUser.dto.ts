import { IsString, IsEmail } from "class-validator";
import { UserTypes } from "src/schemas/user.schema";

export class CreateUserDto {
  @IsString()
  type: UserTypes;

  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;

  @IsEmail()
  email?: string;

  @IsString()
  password?: string;

  @IsString()
  refreshToken: string;
}
