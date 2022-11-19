import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
      const userDeliveries = await this.deliverModel.find({ userId });
      const parsedUserDeliveries = this.parseDelivery(userDeliveries);
      return responseHandler(true, parsedUserDeliveries);
    } catch (err) {
      return responseHandler(false, err)
    }
  }

  async getUserDelivery(userId: string, id: string) {
    try {
      const foundDelivery = await this.validUserDelivery(id);
      this.validatedUserDeliveryAuth(userId, foundDelivery.userId.toString());
      const parsedUserDelivery = this.parseDelivery(foundDelivery);
      return responseHandler(true, parsedUserDelivery);
    } catch (err) {
      return responseHandler(false, err)
    }
  }

  async updateUserDelivery(id: string, updateDeliveryDto: UpdateDeliveryDto) {
    try {
      const foundDelivery = await this.validUserDelivery(id);
      await this.deliverModel.findByIdAndUpdate(foundDelivery.id, {
        $set: {
          type: updateDeliveryDto.type ? updateDeliveryDto.type : foundDelivery.type,
          addressId: updateDeliveryDto.addressId ? updateDeliveryDto.addressId : foundDelivery.addressId,
          status: updateDeliveryDto.status ? updateDeliveryDto.status : foundDelivery.status,
        }
      })
      return responseHandler(true, "Successfully updated delivery");
    } catch (err) {
      return responseHandler(false, err)
    }
  }

  async removeUserDelivery(id: string) {
    try {
      const foundDelivery = await this.validUserDelivery(id);
      await this.deliverModel.findByIdAndDelete(foundDelivery.id);
      return responseHandler(true, "Successfully removed delivery");
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

  private async validUserDelivery(deliveryId: string) {
    if(!deliveryId) {
      throw new HttpException({
        status: HttpStatus.NOT_ACCEPTABLE,
        error: "No deliveryId provided.",
      }, HttpStatus.NOT_ACCEPTABLE)
    }

    const foundDelivery = await this.deliverModel.findById(deliveryId);

    if(foundDelivery) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: "No delivery found."
      }, HttpStatus.NOT_FOUND)
    }
    
    return foundDelivery;
  }

  private validatedUserDeliveryAuth(userId: string, deliveryUserId: string) {
    if(userId !== deliveryUserId) {
      throw new HttpException({
        status: HttpStatus.UNAUTHORIZED,
        error: "Unauthorized",
      }, HttpStatus.UNAUTHORIZED)
    }
  }
}
