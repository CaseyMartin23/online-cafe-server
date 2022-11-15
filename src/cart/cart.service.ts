import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductsService } from 'src/products/products.service';
import { responseHandler, ResponseHandlerType } from 'src/utils/responseHandling.util';
import { Cart, CartDocument } from '../schemas/cart.schema'
import { CartItem, CartItemDocument } from '../schemas/cartItem.schema'
import { AddItemToCartDto } from './dto/addToCart.dto';
import { UpdateCartItemDto } from './dto/updateCartItem.dto';

type UpdateCartDataType = {
  cartItemId: string;
  productId: string;
  quantity: number;
}

type RawCartDataType = Cart | CartItem | Cart[] | CartItem[];

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(CartItem.name) private cartItemModel: Model<CartItemDocument>,
    private productService: ProductsService,
  ) { }

  async addCartItem(userId: string, itemToAddData: AddItemToCartDto) {
    try {
      let response: ResponseHandlerType | { message: string } = { message: "Successfully added item to cart" }
      const { productId, quantity } = itemToAddData;
      const foundProduct = await this.productService.findOne(productId)

      if (!foundProduct.success) {
        return foundProduct;
      }

      if (quantity < 1) {
        throw new HttpException({
          status: HttpStatus.NOT_ACCEPTABLE,
          error: "Quantity cannot be less than 1. Try remove item instead.",
        }, HttpStatus.NOT_ACCEPTABLE)
      }

      const foundCart = await this.getUserCart(userId);
      if (!foundCart.success && foundCart.error.statusCode === 404) {
        response = await this.createCartAndAddItem(userId, itemToAddData);
      } else {
        response = await this.addCartItemToCart(userId, itemToAddData);
      }

      return !response.success ? response : responseHandler(true, response);
    } catch (err) {
      console.error(err);
      return responseHandler(false, err);
    }
  }

  async getUserCart(userId: string) {
    try {
      const foundCart = await this.cartModel.findOne({ userId });

      if (!foundCart) {
        throw new HttpException({
          status: HttpStatus.NOT_FOUND,
          error: "No cart found",
        }, HttpStatus.NOT_FOUND);
      }

      const detailedCart = await this.getCartDetails(foundCart.toObject());
      return responseHandler(true, { items: detailedCart });
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  async updateCartItem(userId: string, newCartItemData: UpdateCartItemDto) {
    try {
      // update cart quantity
      return `This action updates users cart item quantity`;
    } catch (err) {
      console.error(err);
    }
  }

  async removeCartItem(userId: string, cartItemId: string) {
    // remove cartItem
  }

  async clearCart(userId: string) {
    try {
      return `This action removes a #${userId} cart`;
    } catch (err) {
      console.error(err);
    }
  }

  private async getCartDetails(userCart: Partial<Cart>) {
    const { cartItems } = userCart;
    const userCartItems = await this.cartItemModel.find({ id: { $in: cartItems } });
    const detailedCartItems = userCartItems.map((cartItem) => cartItem.toObject());
    const detailedCart = { ...userCart, cartItems: detailedCartItems };
    return this.parseCartAndCartItems(detailedCart);
  }

  private parseRawCartData(rawItem: any) {
    let parsedResult = rawItem;
    if (parsedResult.userId) {
      const { userId, ...rest } = parsedResult;
      parsedResult = rest
    }
    return parsedResult;
  }

  private parseCartAndCartItems(rawItems: any | any[]) {
    const rawItemsArray = Array.isArray(rawItems) ? rawItems : [rawItems];
    const parsedItemData = rawItemsArray.map((item) => {
      let result = item;
      result = this.parseRawCartData(result);

      if (result.cartItems) {
        const parsedCartItems = result.cartItems.map((cartItem) => this.parseRawCartData(cartItem))
        result = { ...result, cartItems: parsedCartItems }
      }

      return result;
    })

    return parsedItemData;
  }

  private async addCartItemToCart(userId: string, itemToAddData: AddItemToCartDto) {
    const { quantity, productId } = itemToAddData;
    const dateCreated = new Date();

    await this.cartItemModel.create({
      userId,
      productId,
      quantity,
      dateCreated,
      dateUpdated: new Date(),
    });

    const { id: cartItemId } = await this.cartItemModel.findOne({ userId, dateCreated });
    return await this.updateCart(userId, { cartItemId, productId, quantity })
  }

  private async createCartAndAddItem(userId: string, itemToAddData: AddItemToCartDto) {
    await this.cartModel.create({
      userId,
      cartItems: [],
      totalPrice: "00.0",
      dateCreated: new Date(),
      dateUpdated: new Date(),
    })
    return await this.addCartItemToCart(userId, itemToAddData)
  }

  private async updateCart(userId: string, newCartData: UpdateCartDataType) {
    try {
      const { productId, quantity, cartItemId } = newCartData;
      const productResponse = await this.productService.findOne(productId)
      const foundCart = await this.cartModel.findOne({ userId });
      const [foundProduct] = productResponse.data.items;
      const { _id, name, price } = foundProduct;
      const validProductId = _id.toString();
      const { totalPrice, cartItems } = foundCart;
      const allCartItems = await this.cartItemModel.find({ id: { $in: cartItems } });
      const cartItemsProductIds = allCartItems.filter(({ id }) => id !== cartItemId).map(({ productId }) => productId.toString())

      if (cartItemsProductIds.includes(validProductId)) {
        await this.cartItemModel.findByIdAndDelete(cartItemId);

        throw new HttpException({
          status: HttpStatus.CONFLICT,
          error: "Cart already has this product. Try updating quantity instead.",
        }, HttpStatus.CONFLICT);
      }

      const subTotalPrice = parseFloat(price) * quantity;
      const newCartTotal = (parseFloat(totalPrice) + subTotalPrice).toFixed(2);

      await this.cartItemModel.findByIdAndUpdate(cartItemId, {
        $set: {
          name,
          price,
          subTotalPrice: subTotalPrice.toFixed(2),
          dateUpdated: new Date(),
        }
      })
      await this.cartModel.findByIdAndUpdate(foundCart.id, {
        $set: {
          cartItems: [...cartItems, cartItemId],
          totalPrice: newCartTotal,
          dateUpdated: new Date(),
        }
      })

      return responseHandler(true, { message: "Successfully updated cart" })
    } catch (err) {
      return responseHandler(false, err)
    }
  }

}


/** 
 * Add cartItem:
 *    cart exists:
 *      - create a cartItem
 *      - add new item and calc new total
 * 
 *    cart doesn't exist:
 *      - create a cart
 *      - create a cartItem
 *      - add new item and calc new total
 * 
 * Update cartItem:
 *    quantity is less than 1:
 *      - throw error to remove item instead
 *    
 *    quantity is equal to or more than 1:
 *      - update cartItem quantity and subtotal
 *      - update cart total
 * 
 * Remove cartItem:
 *    cartItem doesn't exists:
 *      - throw error
 * 
 *    cartItem exist:
 *      - remove it from cart and recalc total
 *      - remove from db
 * 
 * Clear cart:
 *    cartItems are less then 1:
 *      - throw error
 * 
 *    cartItems are equal or more than 1:
 *      - remove all cartItems with userId
 */