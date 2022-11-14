import { IsNumber, IsString } from "class-validator"

export class AddItemToCartDto {
    @IsString()
    productId: string;

    @IsNumber()
    quantity: number;
};
