import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CartService } from 'src/cart/cart.service';
import { CartDocument } from 'src/schemas/cart.schema';
import { Order, OrderDocument, OrderStatuses } from 'src/schemas/order.schema';
import { responseHandler } from 'src/utils/responseHandling.util';
import { UpdateOrderDto } from './dto/updateOrder.dto';

@Injectable()
export class OrdersService {

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private cartService: CartService,
  ) { }

  public async create(userId: string) {
    try {
      let userOrder = null;
      const foundUserOrder = await this.orderModel.findOne({ userId, status: OrderStatuses.Partial });

      if(!foundUserOrder) {
        userOrder = await this.createPartialUserOrder(userId);
      } else {
        userOrder = foundUserOrder;
      }

      const parsedOrder = this.parseOrders(userOrder)
      return responseHandler(true, { items: parsedOrder });
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  public async findAll(userId: string) {
    try {
      const foundUserOrders = await this.orderModel.find({ userId });
      
      if(foundUserOrders.length < 1){
        throw new HttpException({
          status: HttpStatus.NOT_FOUND,
          error: "No order found.",
        }, HttpStatus.NOT_FOUND);
      }

      const parsedOrders = this.parseOrders(foundUserOrders);
      return responseHandler(true, { items: parsedOrders });
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  public async findOne(userId: string, id: string) {
    try {
      const foundUserOrder = await this.orderModel.findOne({ id, userId });
      
      if(!foundUserOrder){
        throw new HttpException({
          status: HttpStatus.NOT_FOUND,
          error: "No order found.",
        }, HttpStatus.NOT_FOUND);
      }

      const parsedOrder = this.parseOrders(foundUserOrder);
      return responseHandler(true, { items: parsedOrder });
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  public async update(userId: string, id: string, updateOrderDto: UpdateOrderDto) {
    try {
      const foundUserOrder = await this.orderModel.findOne({ id, userId });
      
      if(!foundUserOrder) {
        const status = HttpStatus.NOT_FOUND;
        throw new HttpException({ status, error: "No order found." }, status);
      }

      await this.orderModel.findOneAndUpdate(foundUserOrder.id, {
        $set: {
          ...updateOrderDto,
          dateUpdated: new Date()
        }
      });
      const updatedUserOrder = await this.findOne(userId, id);

      if(!updatedUserOrder.success) {
        const { statusCode, message } = updatedUserOrder.error;
        throw new HttpException({ status: statusCode, error: message }, statusCode);
      }

      const { items } = updatedUserOrder.data
      return responseHandler(true, { items });
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  public async remove(id: string) {
    return `This action removes a #${id} order`;
  }

  private async createPartialUserOrder(userId: string) {
    const { data } = await this.cartService.getUserCart(userId);
    const [userCart]: CartDocument[] = data.items;
    const createdOrder = await this.orderModel.create({
      userId,
      status: OrderStatuses.Partial,
      cartId: userCart.id,
      dateCreated: new Date(),
      dateUpdated: new Date(),
    })
    return createdOrder;
  }

  private parseOrders(rawOrders: OrderDocument | OrderDocument[]) {
    const rawOrdersArray = Array.isArray(rawOrders) ? rawOrders : [rawOrders];
    const parsedOrders = rawOrdersArray.map((order) => {
      const { userId, _id, ...rest } = order.toObject();
      return { ...rest, id: _id } as CartDocument;
    })
    return parsedOrders
  }
}
