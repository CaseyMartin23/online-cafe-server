import { Controller, Get, Post, Body, Patch, UseGuards, Req } from '@nestjs/common';
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
    return await this.cartService.addItemToCart(req.user.sub, addToCartData);
  }

  @Get()
  async getCart(@Req() req) {
    return await this.cartService.getCartDetails(req.user.sub);
  }

  @Patch('edit')
  async updateCart(@Req() req, @Body() updateCartDto: UpdateCartDto) {
    return await this.cartService.editCart(req.user.sub, updateCartDto);
  }

  @Patch('clear')
  async clearCart(@Req() req) {
    return await this.cartService.clearCart(req.user.sub);
  }
}
