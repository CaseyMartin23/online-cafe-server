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

  public async addCartItem(userId: string, itemToAddData: AddItemToCartDto) {
    try {
      let response: ResponseHandlerType = null;
      const { productId, quantity } = itemToAddData;
      const foundProduct = await this.productService.findOne(productId)
      const foundCart = await this.getUserCart(userId);

      if (!foundProduct.success) {
        return foundProduct;
      }
      this.checkQuantity(quantity)

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

  public async getUserCart(userId: string) {
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

  public async updateCartItem(userId: string, newCartItemData: UpdateCartItemDto) {
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
        (prev, curr) => prev + parseFloat(curr.subTotalPrice),
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

  public async removeCartItem(userId: string, cartItemId: string) {
    try {
      const foundCartItem = await this.cartItemModel.findById(cartItemId);

      this.checkIfCartItemExists(foundCartItem);
      this.checkUserCartItemAuth(foundCartItem.userId.toString(), userId)

      await this.cartItemModel.findByIdAndDelete(foundCartItem.id);

      const allCartItems = await this.cartItemModel.find({ userId });
      const cartItems = allCartItems.map(({ id }) => id)
      const newTotal = allCartItems.reduce((prev, curr) => prev + parseFloat(curr.subTotalPrice), parseFloat("0.00")).toFixed(2);
      const dateUpdated = new Date();

      await this.cartModel.findOneAndUpdate({ userId }, {
        $set: {
          cartItems,
          totalPrice: newTotal,
          dateUpdated,
        }
      })

      return await this.getUserCart(userId);
    } catch (err) {
      return responseHandler(false, err)
    }
  }

  public async clearCart(userId: string) {
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
    const detailedCartItems = await this.getCartItemDetails(userCartItems);
    const detailedCart = { ...userCart, cartItems: detailedCartItems };
    return this.parseCartAndCartItems(detailedCart);
  }

  private async getCartItemDetails(userCartItems: CartItemDocument[]) {
    const detailedCartItems = await Promise.all(userCartItems.map(async (cartItem) => {
      const { productId, ...rest } = cartItem.toObject();
      const productResponse = await this.productService.findOne(productId);
      const product = productResponse.data.items[0];
      const detailedItem = {
        ...rest,
        product,
      }
      return detailedItem;
    }));

    return detailedCartItems;
  }

  private parseRawCartData(rawItem: any) {
    let parsedResult = rawItem;
    if (parsedResult.userId) {
      const { userId, ...rest } = parsedResult;
      if (rest.cartItems) {
        parsedResult = {
          id: rest._id.toString(),
          cartItems: rest.cartItems,
          totalPrice: rest.totalPrice,
        }
      } else {
        parsedResult = {
          id: rest._id.toString(),
          product: rest.product,
          name: rest.name,
          quantity: rest.quantity,
          price: rest.price,
          subTotalPrice: rest.subTotalPrice,
        }
      }
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
      const { id, name, price } = foundProduct;
      const validProductId = id.toString();
      const { id: cartId, totalPrice, cartItems } = foundCart;
      const allCartItems = cartItems.length === 0 ? [] : await this.cartItemModel.find({ userId });
      const userCartItemsExcludingCurrent = allCartItems.filter(({ id }) => id !== cartItemId);
      const cartItemsProductIds = userCartItemsExcludingCurrent.map(({ productId }) => productId.toString())
      const subTotalPrice = parseFloat(price) * quantity;

      if (cartItemsProductIds.includes(validProductId)) {
        const updatedTotal = userCartItemsExcludingCurrent.reduce((prev, curr) => prev + parseFloat(curr.subTotalPrice), parseFloat("00.0"));
        await this.cartModel.findByIdAndUpdate(cartId, {
          $set: {
            cartItems: userCartItemsExcludingCurrent.map(({ id }) => id),
            totalPrice: updatedTotal.toFixed(2),
            dateUpdated: new Date()
          }
        });
        await this.cartItemModel.findByIdAndDelete(cartItemId);

        throw new HttpException({
          status: HttpStatus.CONFLICT,
          error: "Cart already has this product. Try updating quantity instead.",
        }, HttpStatus.CONFLICT);
      }

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

      return await this.getUserCart(userId);
    } catch (err) {
      return responseHandler(false, err)
    }
  }

}