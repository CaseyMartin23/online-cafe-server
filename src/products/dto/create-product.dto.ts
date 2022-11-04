import { IsBoolean, IsDate, IsString, MaxLength } from "class-validator";

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  price: string;

  @MaxLength(15, {
    each: true,
  })
  categories: string[];

  @MaxLength(5, {
    each: true,
  })
  images: string[];

  @MaxLength(15, {
    each: true,
  })
  tags: string[];
}
