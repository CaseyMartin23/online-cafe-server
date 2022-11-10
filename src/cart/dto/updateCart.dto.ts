import { PartialType } from '@nestjs/mapped-types';
import { AddItemToCartDto } from './addToCart.dto';

export class UpdateCartDto extends PartialType(AddItemToCartDto) {}
