import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddressesService } from 'src/addresses/addresses.service';
import { Delivery, DeliveryDocument, DeliveryStatus, DeliveryType } from 'src/schemas/delivery.schema';
import { DoordashClient } from './doordash.client';
import { responseHandler, ResponseHandlerType } from 'src/utils/responseHandling.util';
import { CreateDeliveryDto } from './dto/createDelivery.dto';
import { UpdateDeliveryDto } from './dto/updateDelivery.dto';
import { GetDeliveryQuote } from './dto/getDeliveryQuote.dto';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from 'src/orders/orders.service';
import { CreateDeliveryQuoteDto } from './dto/createDeliveryQuote.dto';

@Injectable()
export class DeliveriesService {
  private deliveryType = null;  
  private doordashClient = null;

  constructor(
    @InjectModel(Delivery.name) private deliverModel: Model<DeliveryDocument>,
    private addressService: AddressesService,
    private configService: ConfigService,
    private orderService: OrdersService,
  ) {
    const deliveryMethodType = this.configService.get("DELIVERY_TYPE");
    this.deliveryType = deliveryMethodType;
    
    if(deliveryMethodType === DeliveryType.DoorDash) {
      this.doordashClient = new DoordashClient();
    }
  }

  public async createPartialDelivery(userId: string, { orderId }: CreateDeliveryDto) {
    try {
      const userAddressResponse = await this.addressService.getSelectedUserAddress(userId);
      const selectedAddressId = userAddressResponse.data.items[0]._id.toString();
      const selectedUserAddress = await this.addressService.validateAddress(selectedAddressId)
      const newDelivery = await this.deliverModel.create({
        type: this.deliveryType,
        userId,
        addressId: selectedUserAddress.id,
        status: DeliveryStatus.Partial,
      })
      const parsedDelivery = this.parseDelivery(newDelivery);
      await this.orderService.update(userId, orderId, { deliveryId: newDelivery.id });
      return responseHandler(true, { items: parsedDelivery });
    } catch (err) {
      console.error(err);
      return responseHandler(false, err)
    }
  }

  public async getUserDeliveries(userId: string) {
    try {
      const userDeliveries = await this.deliverModel.find({ userId });
      const parsedUserDeliveries = this.parseDelivery(userDeliveries);
      return responseHandler(true, parsedUserDeliveries);
    } catch (err) {
      return responseHandler(false, err)
    }
  }

  public async getUserDelivery(userId: string, id: string) {
    try {
      const foundDelivery = await this.validUserDelivery(id);
      const foundUserAddress = await this.addressService.validateAddress(foundDelivery.addressId);
      this.validatedUserDeliveryAuth(userId, foundUserAddress.userId.toString());
      const parsedUserDelivery = this.parseDelivery(foundDelivery);
      return responseHandler(true, { items: parsedUserDelivery });
    } catch (err) {
      return responseHandler(false, err)
    }
  }

  public async createQuote(userId: string, id: string) {
    if (this.deliveryType === DeliveryType.DoorDash) {
      return this.createDoordashDeliveryQuote(userId, id);
    }
    return this.createInHouseDeliveryQuote(userId, id);
  }

  private async createInHouseDeliveryQuote(userId: string, id: string) {
    // calculate in-house delivery cost
  }

  private async createDoordashDeliveryQuote(userId: string, id: string) {
    try {
      const userAddress = await this.getUserSelectedAddress(userId);
      const deliveryQuote = {
        pickupAddress: this.configService.get("DOORDASH_PICKUP_ADDRESS"),
        pickupBusinessName: this.configService.get("DOORDASH_PICKUP_BUSINESS_NAME"),
        pickupPhoneNumber: this.configService.get("DOORDASH_PICKUP_PHONENUMBER"),
        pickupInstructions: this.configService.get("DOORDASH_PICKUP_INSTRUCTIONS"),
        dropoffAddress: this.addressService.getUserAddressString(userAddress),
        dropoffPhoneNumber: userAddress.phoneNumber,
        dropoffInstructions: "Test instructions",
        dropoffContactGivenName: userAddress.firstName,
        dropoffContactFamilyName: userAddress.lastName,
      }
      const doordashQuote: ResponseHandlerType = await this.doordashClient.getDeliveryQuote(deliveryQuote);
      const {
        external_delivery_id,
        currency,
        delivery_status,
        fee,
        pickup_external_store_id,
        dropoff_instructions,
        pickup_time_estimated,
        dropoff_time_estimated,
        support_reference,
        tracking_url,
        action_if_undeliverable,
      } = doordashQuote.data.items[0];
      
      const { id: updatedDeliveryId } = await this.deliverModel.findByIdAndUpdate(id, {
        $set: {
            externalDeliveryId: external_delivery_id,
            currency,
            status: delivery_status,
            fee: parseFloat(`${fee / 100}`).toFixed(2),
            pickupExternalStoreId: pickup_external_store_id,
            dropoffInstructions: dropoff_instructions,
            pickupTimeEstimated: pickup_time_estimated,
            dropoffTimeEstimated: dropoff_time_estimated,
            supportReference: support_reference,
            trackingUrl: tracking_url,
            actionIfUndeliverable: action_if_undeliverable,
        }
      });

      return await this.getUserDelivery(userId, updatedDeliveryId);
    } catch (err) {
      responseHandler(false, err);
    }
  }

  public async updateUserDelivery(id: string, updateDeliveryDto: UpdateDeliveryDto) {
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

  public async removeUserDelivery(id: string) {
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
    if (!deliveryId) {
      throw new HttpException({
        status: HttpStatus.NOT_ACCEPTABLE,
        error: "No delivery ID provided.",
      }, HttpStatus.NOT_ACCEPTABLE)
    }

    const foundDelivery = await this.deliverModel.findById(deliveryId);

    if (!foundDelivery) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: "No delivery found."
      }, HttpStatus.NOT_FOUND)
    }

    return foundDelivery;
  }

  private validatedUserDeliveryAuth(userId: string, deliveryUserId: string) {
    if (userId !== deliveryUserId) {
      throw new HttpException({
        status: HttpStatus.UNAUTHORIZED,
        error: "Unauthorized",
      }, HttpStatus.UNAUTHORIZED)
    }
  }

  private async getUserSelectedAddress(userId: string) {
    const userAddressResponse = await this.addressService.getSelectedUserAddress(userId);
    if (!userAddressResponse.success) {
      throw new HttpException({
        status: userAddressResponse.error.statusCode,
        error: userAddressResponse.error.message,
      }, userAddressResponse.error.statusCode);
    }

    const selectedAddress = userAddressResponse.data.items[0];
    if (!selectedAddress) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: "No selected address found.",
      }, HttpStatus.NOT_FOUND)
    }

    return await this.addressService.validateAddress(selectedAddress._id.toString());
  }

  private async createDoordashDelivery() {
    // const createdDoordashDelivery = await this.doordashClient.createDelivery({
    //   external_delivery_id: 'D-12345',
    //   pickup_address: '1000 4th Ave, Seattle, WA, 98104',
    //   pickup_phone_number: '+1(650)5555555',
    //   dropoff_address: '1201 3rd Ave, Seattle, WA, 98101',
    //   dropoff_phone_number: '+1(650)5555555',
    // })

    // console.log({ createdDoordashDelivery })
  }
}
