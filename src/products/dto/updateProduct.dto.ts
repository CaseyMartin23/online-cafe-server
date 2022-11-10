import { PartialType } from '@nestjs/mapped-types';
import { IsString, MaxLength } from 'class-validator';
import { CreateProductDto } from './createProduct.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
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
