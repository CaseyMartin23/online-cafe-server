import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OrdersService } from 'src/orders/orders.service';
import { PaymentsService } from 'src/payments/payments.service';
import { PaymentStatus } from 'src/schemas/payment.schema';
import { PaymentMethod, PaymentMethodDocument, PaymentMethods } from 'src/schemas/paymentMethod.schema';
import { responseHandler } from 'src/utils/responseHandling.util';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';

@Injectable()
export class PaymentMethodService {

  constructor(
    @InjectModel(PaymentMethod.name) private paymentMethodModel: Model<PaymentMethodDocument>,
    private paymentService: PaymentsService,
    private orderService: OrdersService,
  ) { }

  public async createInitial(userId: string, { type, orderId }: CreatePaymentMethodDto) {
    try {
      // check for another partial method on payment and order
      const { data: currentOrderData } = await this.orderService.findOne(userId, orderId);
      const currentOrder = currentOrderData.items[0];
      const currentPaymentId = currentOrder.paymentId;
      if(currentOrder && currentPaymentId) {
        // const { data: currentPaymentData } = await this.paymentService.findOne(userId, currentPaymentId);
        // create a partial method
        // if() {
        //   const createdDate = new Date();
        // const newMethod = await this.paymentMethodModel.create({
        //   $set: {
        //     userId,
        //     type,
        //     status: PaymentStatus.Partial,
        //     default: true,
        //     dateCreated: createdDate,
        //     dateUpdated: createdDate,
        //   }
        // });
        // }
      }

      // create partial payment
      // update order with payment ID
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
