import { Injectable } from '@nestjs/common';
import { PaymentMethods } from 'src/schemas/paymentMethod.schema';
import { responseHandler } from 'src/utils/responseHandling.util';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Injectable()
export class PaymentMethodService {
  public async create(userId: string, createPaymentMethodDto: CreatePaymentMethodDto) {
    try {
      // add method
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  public async getPaymentMethods() {
    const items = Object.keys(PaymentMethods).map((method) => PaymentMethods[method]);
    return responseHandler(true, { items });
  }

  public async findAll(userId: string) {
    return `This action returns all paymentMethod`;
  }

  public async findOne(userId: string, id: string) {
    return `This action returns a #${id} paymentMethod`;
  }

  public async update(userId: string, id: string, updatePaymentMethodDto: UpdatePaymentMethodDto) {
    try {
      // get user payment methods
      // check if method exists
      // update selected method
    } catch (err) {
      return responseHandler(false, err);
    }
    return `This action updates a #${id} paymentMethod`;
  }

  public async remove(userId: string, id: string) {
    return `This action removes a #${id} paymentMethod`;
  }
}
