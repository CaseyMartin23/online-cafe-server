import { Controller, Get, Post, Body, Patch, UseGuards, Delete, Request, Query } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { CartService } from './cart.service';
import { AddItemToCartDto } from './dto/addToCart.dto';
import { UpdateCartItemDto } from './dto/updateCartItem.dto';

@UseGuards(AccessTokenGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  public async addToCart(@Request() req, @Body() addToCartData: AddItemToCartDto) {
    return await this.cartService.addCartItem(req.user.sub, addToCartData);
  }

  @Get()
  public async getCart(@Request() req) {
    return await this.cartService.getUserCart(req.user.sub);
  }

  @Patch('update')
  public async updateCart(@Request() req, @Body() updateCartDto: UpdateCartItemDto) {
    return await this.cartService.updateCartItem(req.user.sub, updateCartDto);
  }

  @Delete('remove-item')
  public async removeCartItem(@Request() req, @Query('cartItemId') cartItemId: string) {
    return await this.cartService.removeCartItem(req.user.sub, cartItemId);
  }

  @Delete('clear')
  public async clearCart(@Request() req) {
    return await this.cartService.clearCart(req.user.sub);
  }
}
