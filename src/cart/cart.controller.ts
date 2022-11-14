import { Controller, Get, Post, Body, Patch, UseGuards, Req, Delete } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { CartService } from './cart.service';
import { AddItemToCartDto } from './dto/addToCart.dto';
import { UpdateCartDto } from './dto/updateCart.dto';

@UseGuards(AccessTokenGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  async addToCart(@Req() req, @Body() addToCartData: AddItemToCartDto) {
    return await this.cartService.addToCart(req.user.sub, addToCartData);
  }

  @Get()
  async getCart(@Req() req) {
    return await this.cartService.getCartDetails(req.user.sub);
  }

  @Patch('update')
  async updateCart(@Req() req, @Body() updateCartDto: UpdateCartDto) {
    return await this.cartService.updateCart(req.user.sub, updateCartDto);
  }

  @Delete('remove-item')
  async removeCartItem(@Req() req) {
    return await this.cartService.clearCart(req.user.sub);
  }

  @Delete('clear')
  async clearCart(@Req() req) {
    return await this.cartService.clearCart(req.user.sub);
  }
}
