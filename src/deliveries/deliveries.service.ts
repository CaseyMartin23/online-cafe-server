import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Delivery, DeliveryDocument } from 'src/schemas/delivery.schema';
import { CreateDeliveryDto } from './dto/createDelivery.dto';
import { UpdateDeliveryDto } from './dto/updateDelivery.dto';

@Injectable()
export class DeliveriesService {
  constructor(@InjectModel(Delivery.name) private deliverModel: Model<DeliveryDocument>) {}

  async addUserDelivery(userId: string, createDeliveryDto: CreateDeliveryDto) {
    return 'This action adds a new delivery';
  }

  async getUserDeliveries(userId: string) {
    return `This action returns all deliveries`;
  }

  async getUserDelivery(userId: string, id: string) {
    return `This action returns a #${id} delivery`;
  }

  async updateUserDelivery(userId: string, id: string, updateDeliveryDto: UpdateDeliveryDto) {
    return `This action updates a #${id} delivery`;
  }

  async removeUserDelivery(userId: string, id: string) {
    return `This action removes a #${id} delivery`;
  }
}
