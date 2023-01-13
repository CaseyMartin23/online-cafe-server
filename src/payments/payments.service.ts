import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CartService } from 'src/cart/cart.service';
import { DeliveriesService } from 'src/deliveries/deliveries.service';
import { OrdersService } from 'src/orders/orders.service';
import { Payment, PaymentDocument, PaymentStatus } from 'src/schemas/payment.schema';
import { makeAnArray } from 'src/utils/common.utils';
import { responseHandler } from 'src/utils/responseHandling.util';
import Stripe from 'stripe';
import { CreatePaymentDto } from './dto/createPayment.dto';
import { CreatePaymentIntentDto } from './dto/createPaymentIntent.dto';
import { UpdatePaymentDto } from './dto/updatePayment.dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private configService: ConfigService,
    private cartService: CartService,
    private orderService: OrdersService,
    private deliveryService: DeliveriesService,
  ) {
    this.stripe = new Stripe(this.configService.get("STRIPE_API_SECRET_KEY"), { apiVersion: "2022-11-15" });
  }

  public async createPayment(userId: string, paymentData: CreatePaymentDto) {
    try {
      const { orderId } = paymentData;
      const orderResponse = await this.orderService.findOne(userId, orderId);

      if (!orderResponse.success) {
        const { statusCode, message } = orderResponse.error;
        throw new HttpException({ status: statusCode, error: message }, statusCode);
      }

      const creationDate = new Date();
      const paymentCreated = await this.paymentModel.create({
        userId,
        status: PaymentStatus.Partial,
        currency: "USD",
        dateCreated: creationDate,
        dateUpdated: creationDate,
      });

      await this.orderService.update(userId, orderId, { paymentId: paymentCreated.id });
      return responseHandler(true, { message: "Successfully created payment." });
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  public async createStripeIntent(userId: string, { orderId }: CreatePaymentIntentDto) {
    try {
      const cartItemsTotal = await this.getUserCartTotal(userId);
      const deliveryPrice = await this.getUserDeliveryTotal(userId, orderId);
      const totalPrice = cartItemsTotal + deliveryPrice;
      const {
        id,
        amount,
        client_secret,
        created,
        currency,
        status,
      } = await this.createStripePaymentIntent(totalPrice);
      const paymentId = await this.getUserOrderPaymentId(userId, orderId);

      await this.paymentModel.findByIdAndUpdate(paymentId
        , {
          $set: {
            stripeId: id,
            amount: parseFloat(`${amount / 100}`).toFixed(2),
            createdOnStripe: new Date(created),
            currency,
            stripeStatus: status,
            dateUpdated: new Date(),
          }
        });

      return responseHandler(true, { secret: client_secret });
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  public async findAll(userId: string) {
    try {
      const foundPayments = await this.paymentModel.find({ userId });
      this.validateUserPayment(foundPayments, userId);
      const parsedPayments = this.parsePayments(foundPayments);
      return responseHandler(true, { items: parsedPayments });
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  public async findOne(userId: string, id: string) {
    try {
      const foundPayment = await this.paymentModel.findById(id);
      this.validateUserPayment(foundPayment, userId);
      const parsedPayments = this.parsePayments(foundPayment);
      return responseHandler(true, { items: parsedPayments });
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  public async update(userId: string, id: string, updatePaymentDto: UpdatePaymentDto) {
    try {
      const foundPayment = await this.paymentModel.findById(id);
      this.validateUserPayment(foundPayment, userId);
      const { stripeId, amount, createdOnStripe, stripeStatus } = updatePaymentDto;
      await this.paymentModel.findByIdAndUpdate(id, {
        $set: {
          status: PaymentStatus.Incomplete,
          stripeId: stripeId ? stripeId : undefined,
          amount: amount ? amount : undefined,
          createdOnStripe: createdOnStripe ? createdOnStripe : undefined,
          stripeStatus: stripeStatus ? stripeStatus : undefined,
          dateUpdated: new Date(),
        }
      })
      return responseHandler(true, { message: "Payment updated successfully." });
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  public async remove(userId: string, id: string) {
    try {
      const foundPayment = await this.paymentModel.findById(id);
      this.validateUserPayment(foundPayment, userId);
      await this.paymentModel.findByIdAndRemove(id);
      return responseHandler(true, { message: "Payment removed successfully." });
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  private parsePayments(paymentData: PaymentDocument | PaymentDocument[]) {
    const payments = Array.isArray(paymentData) ? paymentData : [paymentData];
    return payments.map((payment) => {
      const { userId, ...rest } = payment.toObject();
      return rest;
    });
  }

  private validateUserPayment(payment: PaymentDocument | PaymentDocument[], userId: string) {
    const payments = makeAnArray(payment) as PaymentDocument[];

    if (!payments || payments.length < 1) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: "No payment found.",
      }, HttpStatus.NOT_FOUND);
    }

    payments.forEach((payment) => {
      if (payment.userId === userId) {
        throw new HttpException({
          status: HttpStatus.UNAUTHORIZED,
          error: "Unauthorized",
        }, HttpStatus.UNAUTHORIZED);
      }
    })
  }

  private async createStripePaymentIntent(totalAmount: number) {
    const amount = totalAmount * 100;
    const createdPaymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency: "usd",
      description: `Payment request from ${process.env.DOORDASH_PICKUP_BUSINESS_NAME}`,
      automatic_payment_methods: {
        enabled: true,
      },
    })
    return createdPaymentIntent;
  }

  private async getUserCartTotal(userId: string) {
    const userCartResponse = await this.cartService.getUserCart(userId);
    const noUserCart = userCartResponse.data.items.length === 0;
    const noCartItems = userCartResponse.data.items[0].cartItems.length === 0;
    if (!userCartResponse.success || noUserCart) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: "No cart found."
      }, HttpStatus.NOT_FOUND)
    }

    if (noCartItems) {
      throw new HttpException({
        status: HttpStatus.BAD_REQUEST,
        error: "No items in cart.",
      }, HttpStatus.BAD_REQUEST)
    }

    const [userCart] = userCartResponse.data.items;
    return parseFloat(userCart.totalPrice);
  }

  private async getUserDeliveryTotal(userId: string, orderId: string) {
    const userOrderResponse = await this.orderService.findOne(userId, orderId);
    const { deliveryId } = userOrderResponse.data.items[0];
    const { data } = await this.deliveryService.getUserDelivery(userId, deliveryId);
    const [userDelivery] = data.items;
    return parseFloat(userDelivery.fee);
  }

  private async getUserOrderPaymentId(userId: string, orderId: string) {
    const userOrderResponse = await this.orderService.findOne(userId, orderId);
    const { paymentId } = userOrderResponse.data.items[0];
    return paymentId;
  }
}
