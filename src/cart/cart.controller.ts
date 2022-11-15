import { Controller, Get, Post, Body, Patch, UseGuards, Req, Delete, Param } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { CartService } from './cart.service';
import { AddItemToCartDto } from './dto/addToCart.dto';
import { UpdateCartItemDto } from './dto/updateCartItem.dto';

@UseGuards(AccessTokenGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  async addToCart(@Req() req, @Body() addToCartData: AddItemToCartDto) {
    return await this.cartService.addCartItem(req.user.sub, addToCartData);
  }

  @Get()
  async getCart(@Req() req) {
    return await this.cartService.getUserCart(req.user.sub);
  }

  @Patch('update')
  async updateCart(@Req() req, @Body() updateCartDto: UpdateCartItemDto) {
    return await this.cartService.updateCartItem(req.user.sub, updateCartDto);
  }

  @Delete('remove-item')
  async removeCartItem(@Req() req, @Param('cartItemId') cartItemId: string) {
    return await this.cartService.removeCartItem(req.user.sub, cartItemId);
  }

  @Delete('clear')
  async clearCart(@Req() req) {
    return await this.cartService.clearCart(req.user.sub);
  }
}
