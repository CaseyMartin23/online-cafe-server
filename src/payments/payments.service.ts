import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CartService } from 'src/cart/cart.service';
import { Payment, PaymentDocument } from 'src/schemas/payment.schema';
import { responseHandler } from 'src/utils/responseHandling.util';
import Stripe from 'stripe';
import { UpdatePaymentDto } from './dto/updatePayment.dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private configService: ConfigService,
    private cartService: CartService,
  ) {
    this.stripe = new Stripe(this.configService.get("STRIPE_API_SECRET_KEY"), { apiVersion: "2022-11-15" });
  }

  public async createStripeIntent(userId: string) {
    try {
      // get user cart and calc total price
      const userCartResponse = await this.cartService.getUserCart(userId);
      const noUserCart = userCartResponse.data.items.length === 0;
      const noCartItems = userCartResponse.data.items[0].cartItems.length === 0;
      if(!userCartResponse.success || noUserCart) {
        throw new HttpException({
          status: HttpStatus.NOT_FOUND,
          error: "No cart found."
        }, HttpStatus.NOT_FOUND)
      }

      if(noCartItems) {
        throw new HttpException({
          status: HttpStatus.BAD_REQUEST,
          error: "No items in cart.",
        }, HttpStatus.BAD_REQUEST)
      }

      const [userCart] = userCartResponse.data.items;
      const cartItemsTotal = parseFloat(userCart.totalPrice);
      console.log({ userCartResponse, userCart, cartItemsTotal });
      
      // get delivery price
      const deliveryPrice = 5.00;
      const totalPrice = cartItemsTotal + deliveryPrice;
      // create stripe payment intent
      // const createdStripeIntent = await this.createStripePaymentIntent(totalPrice);
      // create incomplete payment in DB
      // send back client secret
      return 'This action adds a new payment';
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  public async findAll(userId: string) {
    try {
      
    } catch (err) {
      return responseHandler(false, err);
    }
    return `This action returns all payments`;
  }

  public async findOne(userId: string, id: string) {
    try {
      
    } catch (err) {
      return responseHandler(false, err);
    }
    return `This action returns a #${id} payment`;
  }

  public async update(userId: string, id: string, updatePaymentDto: UpdatePaymentDto) {
    try {
      
    } catch (err) {
      return responseHandler(false, err);
    }
    return `This action updates a #${id} payment`;
  }

  public async remove(userId: string, id: string) {
    try {
      
    } catch (err) {
      return responseHandler(false, err);
    }
    return `This action removes a #${id} payment`;
  }

  private async createStripePaymentIntent(totalAmount: number) {
    const amount = totalAmount * 100;
    const createdPaymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    })

    console.log({ createdPaymentIntent });
  }
}
