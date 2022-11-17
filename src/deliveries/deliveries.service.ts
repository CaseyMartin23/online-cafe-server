import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddressesService } from 'src/addresses/addresses.service';
import { Delivery, DeliveryDocument, DeliveryStatus, DeliveryType } from 'src/schemas/delivery.schema';
import { responseHandler } from 'src/utils/responseHandling.util';
import { CreateDeliveryDto } from './dto/createDelivery.dto';
import { UpdateDeliveryDto } from './dto/updateDelivery.dto';

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectModel(Delivery.name) private deliverModel: Model<DeliveryDocument>,
    private addressService: AddressesService,
  ) {}

  async addUserDelivery(userId: string, createDeliveryDto: CreateDeliveryDto) {
    try {
      const userAddressResponse = await this.addressService.getSelectedUserAddress(userId);
      const selectedAddressId = userAddressResponse.data.items[0].id;
      const selectedUserAddress = await this.addressService.validateAddress(selectedAddressId)
      const newDelivery = await this.deliverModel.create({
        type: DeliveryType.DoorDash,
        userId,
        addressId: selectedUserAddress.id,
        status: DeliveryStatus.Pending,
      })
      const parsedDeliveries = this.parseDelivery(newDelivery);
      return responseHandler(true, { items: parsedDeliveries });
    } catch (err) {
      return responseHandler(false, err)
    }
  }

  async getUserDeliveries(userId: string) {
    try {
      return `This action returns all deliveries`;
    } catch (err) {
      return responseHandler(false, err)
    }
  }

  async getUserDelivery(userId: string, id: string) {
    try {
      return `This action returns a #${id} delivery`;
    } catch (err) {
      return responseHandler(false, err)
    }
  }

  async updateUserDelivery(userId: string, id: string, updateDeliveryDto: UpdateDeliveryDto) {
    try {
      return `This action updates a #${id} delivery`;
    } catch (err) {
      return responseHandler(false, err)
    }
  }

  async removeUserDelivery(userId: string, id: string) {
    try {
      return `This action removes a #${id} delivery`;
    } catch (err) {
      return responseHandler(false, err)
    }
  }

  private parseDelivery(deliveries: DeliveryDocument | DeliveryDocument[]) {
    const deliveriesArray = Array.isArray(deliveries) ? deliveries : [deliveries];
    const parsedDeliveries = deliveriesArray.map((delivery) => {
      const { userId, ...rest } = delivery.toObject();
      return rest;
    });
    return parsedDeliveries;
  }
}
