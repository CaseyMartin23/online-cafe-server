import { IsBoolean, IsObject, IsString } from "class-validator";

export class User {
  @IsObject()
  id: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  email: string;

  @IsBoolean()
  isAdmin: boolean = false;

  @IsString()
  password: string;
}