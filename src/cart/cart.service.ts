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

      this.checkQuantity(quantity)
      const foundCart = await this.getUserCart(userId);
      if (!foundCart.success && foundCart.error.statusCode === 404) {
        response = await this.createCartAndAddItem(userId, itemToAddData);
      } else {
        response = await this.addCartItemToCart(userId, itemToAddData);
      }

      return response;
    } catch (err) {
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
      const { cartItemId, quantity } = newCartItemData;
      const foundCartItem = await this.cartItemModel.findById(cartItemId);
      const SUCCESSFUL_RESPONSE = responseHandler(true, { message: "Successfully updated cartItem" });

      this.checkUserCartItemAuth(foundCartItem.userId.toString(), userId)
      this.checkQuantity(quantity);
      if (foundCartItem.quantity === quantity) return SUCCESSFUL_RESPONSE;

      const productResponse = await this.productService.findOne(foundCartItem.productId);
      const [foundProduct] = productResponse.data.items;
      const allCartItems = await this.cartItemModel.find({ userId });
      const totalExcludingUpdateCartItem = allCartItems.filter(({ id }) => id !== foundCartItem.id).reduce(
        (prev, curr) => prev + parseFloat(curr.price),
        parseFloat("0.00")
      );
      const newSubTotal = parseFloat(foundProduct.price) * quantity;
      const newTotal = (totalExcludingUpdateCartItem + newSubTotal).toFixed(2);
      const dateUpdated = new Date();

      await this.cartItemModel.findByIdAndUpdate(foundCartItem.id, {
        $set: {
          quantity,
          subTotalPrice: newSubTotal.toFixed(2),
          dateUpdated,
        }
      })
      await this.cartModel.findOneAndUpdate({ userId }, {
        $set: {
          totalPrice: newTotal,
          dateUpdated,
        }
      })

      return SUCCESSFUL_RESPONSE;
    } catch (err) {
      return responseHandler(false, err)
    }
  }

  async removeCartItem(userId: string, cartItemId: string) {
    try {
      const foundCartItem = await this.cartItemModel.findById(cartItemId);

      this.checkIfCartItemExists(foundCartItem);
      this.checkUserCartItemAuth(foundCartItem.userId.toString(), userId)

      await this.cartItemModel.findByIdAndDelete(foundCartItem.id);

      const allCartItems = await this.cartItemModel.find({ userId });
      const cartItems = allCartItems.map(({ id }) => id)
      const newTotal = allCartItems.reduce((prev, curr) => prev + parseFloat(curr.price), parseFloat("0.00"));
      const dateUpdated = new Date();

      await this.cartModel.findOneAndUpdate({ userId }, {
        $set: {
          cartItems,
          totalPrice: newTotal.toFixed(2),
          dateUpdated,
        }
      })

      return responseHandler(true, { message: "Successfully remove cartItem" })
    } catch (err) {
      return responseHandler(false, err)
    }
  }

  async clearCart(userId: string) {
    try {
      await this.cartItemModel.deleteMany({ userId });
      await this.cartModel.findOneAndUpdate({ userId }, {
        $set: {
          cartItems: [],
          totalPrice: "00.0",
          dateUpdated: new Date(),
        }
      })
      return responseHandler(true, { message: "Successfully cleared cart" });
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  private checkIfCartItemExists(cartItem: CartItem) {
    if (!cartItem) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: "No cartItem found.",
      }, HttpStatus.NOT_FOUND)
    }
  }

  private checkQuantity(quantity: number) {
    if (quantity < 1) {
      throw new HttpException({
        status: HttpStatus.NOT_ACCEPTABLE,
        error: "Quantity cannot be less than 1. Try remove item instead.",
      }, HttpStatus.NOT_ACCEPTABLE)
    }
  }

  private checkUserCartItemAuth(cartItemUserId: string, userId: string) {
    if (cartItemUserId !== userId) {
      throw new HttpException({
        status: HttpStatus.UNAUTHORIZED,
        error: "Unauthorized",
      }, HttpStatus.UNAUTHORIZED)
    }
  }

  private async getCartDetails(userCart: Partial<Cart>) {
    const { userId } = userCart;
    const userCartItems = await this.cartItemModel.find({ userId });
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

    if (rawItemsArray.length < 1) return [];

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
      dateUpdated: dateCreated,
    });

    const { id: cartItemId } = await this.cartItemModel.findOne({ userId, dateCreated });
    return await this.updateAdditionToCart(userId, { cartItemId, productId, quantity })
  }

  private async createCartAndAddItem(userId: string, itemToAddData: AddItemToCartDto) {
    const dateCreated = new Date()
    await this.cartModel.create({
      userId,
      cartItems: [],
      totalPrice: "00.0",
      dateCreated: dateCreated,
      dateUpdated: dateCreated,
    })
    return await this.addCartItemToCart(userId, itemToAddData)
  }

  private async updateAdditionToCart(userId: string, newCartData: UpdateCartDataType) {
    try {
      const { productId, quantity, cartItemId } = newCartData;
      const productResponse = await this.productService.findOne(productId)
      const foundCart = await this.cartModel.findOne({ userId });
      const [foundProduct] = productResponse.data.items;
      const { _id, name, price } = foundProduct;
      const validProductId = _id.toString();
      const { totalPrice, cartItems } = foundCart;
      const allCartItems = cartItems.length < 1 ? [] : await this.cartItemModel.find({ userId });
      const cartItemsProductIds = allCartItems.filter(({ id }) => {
        if (id !== cartItemId) return true;
        return false;
      }).map(({ productId }) => productId.toString())

      if (cartItemsProductIds.includes(validProductId)) {
        await this.cartItemModel.findByIdAndDelete(cartItemId);
        await this.cartModel.findOneAndDelete({ userId });

        throw new HttpException({
          status: HttpStatus.CONFLICT,
          error: "Cart already has this product. Try updating quantity instead.",
        }, HttpStatus.CONFLICT);
      }

      const subTotalPrice = parseFloat(price) * quantity;
      const newCartTotal = (parseFloat(totalPrice) + subTotalPrice).toFixed(2);
      const dateUpdated = new Date()

      await this.cartItemModel.findByIdAndUpdate(cartItemId, {
        $set: {
          name,
          price,
          subTotalPrice: subTotalPrice.toFixed(2),
          dateUpdated,
        }
      })
      await this.cartModel.findByIdAndUpdate(foundCart.id, {
        $set: {
          cartItems: [...cartItems, cartItemId],
          totalPrice: newCartTotal,
          dateUpdated,
        }
      })

      return responseHandler(true, { message: "Successfully updated cart" })
    } catch (err) {
      return responseHandler(false, err)
    }
  }

}