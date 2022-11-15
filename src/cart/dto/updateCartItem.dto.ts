import { IsNumber, IsString } from 'class-validator'

export class UpdateCartItemDto {
    @IsString()
    cartItemId: string;

    @IsNumber()
    quantity: number;
}
