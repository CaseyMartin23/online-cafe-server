import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from 'src/schemas/payment.schema';
import { CreatePaymentDto } from './dto/createPayment.dto';
import { UpdatePaymentDto } from './dto/updatePayment.dto';

@Injectable()
export class PaymentsService {
  constructor(@InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>){}

  async create(userId: string, createPaymentDto: CreatePaymentDto) {
    return 'This action adds a new payment';
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
