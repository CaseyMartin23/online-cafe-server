import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductsService } from 'src/products/products.service';
import { responseHandler, ResponseHandlerType } from 'src/utils/responseHandling.util';
import { Cart, CartDocument } from '../schemas/cart.schema'
import { CartItem, CartItemDocument } from '../schemas/cartItem.schema'
import { AddItemToCartDto } from './dto/addToCart.dto';
import { UpdateCartDto } from './dto/updateCart.dto';

type CartItemType = {
  productId: string;
  name: string;
  quantity: number;
  price: string;
  subTotalPrice: string;
}

type CartType = {
  userId: string;
  cartItems: string[];
  totalPrice: string;
}

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(CartItem.name) private cartItemModel: Model<CartItemDocument>,
    private productService: ProductsService,
  ) { }

  async addToCart(userId: string, itemToAddData: AddItemToCartDto) {
    try {
      const foundCart = await this.getCartDetails(userId);
      
      if(!foundCart.success){
        await this.createCartAndAddItem(userId, itemToAddData)
      } else {
        const [userCart] = foundCart?.data.items;
        await this.addCartItemToCart(userId, userCart.id, itemToAddData);
      }
      
      return responseHandler(true, {});
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  async getCartDetails(userId: string) {
    try {
      const foundCart = await this.cartModel.findOne({ userId });
      console.log({ foundCart });

      if (!foundCart) {
        throw new HttpException({
          status: HttpStatus.BAD_REQUEST,
          error: "No cart found",
        }, HttpStatus.BAD_REQUEST);
      }

      // get CartItems
      return responseHandler(true, { items: [foundCart] });
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  async updateCart(userId: string, newCartData: UpdateCartDto) {
    try {
      // remove/update user cart
      return `This action updates a #${userId} cart`;
    } catch (err) {
      console.error(err);
    }
  } 

  async clearCart(userId: string) {
    try {
      return `This action removes a #${userId} cart`;
    } catch (err) {
      console.error(err);
    }
  }

  private async createCart() {
    // userId: string;
    // cartItems: string[];
    // totalPrice: string;

    await this.cartModel.create({
      // userId,
      
    })
  }
  
  private async createCartItem(newCartItem: Partial<CartItem>) {
    const { cartId, dateCreated } = newCartItem;
    await this.cartItemModel.create(newCartItem)
    return await this.cartItemModel.find({ cartId, dateCreated })
  }

  private async addCartItemToCart(userId: string, cartId: string, itemToAddData: AddItemToCartDto) {
    const { productId, quantity } = itemToAddData;
    const productResponse = await this.productService.findOne(productId)

    if(!productResponse.success) {
      return productResponse;
    }
    
    const [foundProduct] = productResponse.data.items;
    const { id, name, price } = foundProduct;
    const subTotalPrice = Number(price) * quantity;
    const dateCreated = new Date();
    
    await this.createCartItem({
      cartId,
      name,
      price,
      productId: id,
      subTotalPrice: subTotalPrice.toString(),          
      dateCreated,
      dateUpdated: new Date(),
    })

    await this.updateCart(userId, { productId: id })
  }

  private async createCartAndAddItem(userId: string, itemToAddData: AddItemToCartDto) {
    
  }

}
