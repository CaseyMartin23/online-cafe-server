import { Injectable } from '@nestjs/common';
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
      const foundUserOrder = await this.orderModel.findOne({ userId });
      
      if(!foundUserOrder) {
        userOrder = await this.createUserOrder(userId);
      } else {
        userOrder = foundUserOrder;
      }

      const parsedOrder = this.parseOrders(userOrder)
      return responseHandler(true, { items: parsedOrder });
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  public async findAll() {
    return `This action returns all orders`;
  }

  public async findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  public async update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  public async remove(id: number) {
    return `This action removes a #${id} order`;
  }

  private async createUserOrder(userId: string) {
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
      const { userId, ...rest } = order.toObject();
      return rest as CartDocument;
    })
    return parsedOrders
  }
}
