import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from 'src/schemas/payment.schema';
import Stripe from 'stripe';
import { CreatePaymentDto } from './dto/createPayment.dto';
import { UpdatePaymentDto } from './dto/updatePayment.dto';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.get("STRIPE_API_SECRET_KEY"), { apiVersion: "2022-11-15" });
  }

  async create(userId: string, createPaymentDto: CreatePaymentDto) {
    return 'This action adds a new payment';
  }

  async createPaymentIntent() {
    const createdPaymentIntent = await this.stripe.paymentIntents.create({
      amount: 700,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    })

    console.log({ createdPaymentIntent });
  }

  async findAll(userId: string) {
    return `This action returns all payments`;
  }

  async findOne(userId: string, id: string) {
    return `This action returns a #${id} payment`;
  }

  async update(userId: string, id: string, updatePaymentDto: UpdatePaymentDto) {
    return `This action updates a #${id} payment`;
  }

  async remove(userId: string, id: string) {
    return `This action removes a #${id} payment`;
  }
}
