import { IsString } from "class-validator"

export class AddItemToCartDto {
    @IsString()
    userId: string;
    
    @IsString()
    productId: string;
};
