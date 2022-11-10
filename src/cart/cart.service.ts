import { Injectable } from '@nestjs/common';
import { AddItemToCartDto } from './dto/addToCart.dto';
import { UpdateCartDto } from './dto/updateCart.dto';

@Injectable()
export class CartService {
  async addItemToCart(userId: string, itemToAddData: AddItemToCartDto) {
    // add item to user cart
    // create cart if none found
    return 'This action adds a new cart';
  }

  async getCartDetails(userId: string) {
    // return user cart details
    return `This action returns all cart`;
  }

  async editCart(userId: string, newCartData: UpdateCartDto) {
    // remove/update user cart
    return `This action updates a #${userId} cart`;
  }

  async clearCart(userId: string) {
    return `This action removes a #${userId} cart`;
  }
}
