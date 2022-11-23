import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddressesService } from 'src/addresses/addresses.service';
import { Delivery, DeliveryDocument, DeliveryStatus, DeliveryType } from 'src/schemas/delivery.schema';
import { DoordashClient } from './doordash.client';
import { responseHandler } from 'src/utils/responseHandling.util';
import { CreateDeliveryDto } from './dto/createDelivery.dto';
import { UpdateDeliveryDto } from './dto/updateDelivery.dto';
import { GetDeliveryQuote } from './dto/getDeliveryQuote.dto';

@Injectable()
export class DeliveriesService {
  private doordashClient = new DoordashClient()

  constructor(
    @InjectModel(Delivery.name) private deliverModel: Model<DeliveryDocument>,
    private addressService: AddressesService,
    private configService: ConfigService,
  ) {
    const developer_id = this.configService.get('DOORDASH_DEVELOPER_ID');
    const key_id = this.configService.get('DOORDASH_KEY_ID');
    const signing_secret = this.configService.get('DOORDASH_SIGNING_SECRET');

    if (developer_id && key_id && signing_secret) {
      // this.doordashClient = new DoorDashClient({ developer_id, key_id, signing_secret });
    }
  }

  async addUserDelivery(userId: string) {
    try {
      // const userAddressResponse = await this.addressService.getSelectedUserAddress(userId);
      // const selectedAddressId = userAddressResponse.data.items[0].id;
      // const selectedUserAddress = await this.addressService.validateAddress(selectedAddressId)
      // const newDelivery = await this.deliverModel.create({
      //   type: DeliveryType.DoorDash,
      //   userId,
      //   addressId: selectedUserAddress.id,
      //   status: DeliveryStatus.Created,
      // })
      // const parsedDeliveries = this.parseDelivery(newDelivery);
      // return responseHandler(true, { items: parsedDeliveries });
    } catch (err) {
      console.error(err);
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

  public async getDoordashDeliveryQuote(userId: string) {
    try {
      const userAddress = await this.getUserSelectedAddress(userId);
      const doordashQuote = await this.doordashClient.getDeliveryQuote({
        pickupAddress: "7305, 207 Petronia St #101, Key West, FL 33040",
        pickupBusinessName: "Santiago's Bodega | Key West",
        pickupPhoneNumber: "+13052967691",
        pickupInstructions: "Test pickup",
        dropoffAddress: this.addressService.getUserAddressString(userAddress),
        dropoffPhoneNumber: userAddress.phoneNumber,
        dropoffInstructions: "Test instructions",
        dropoffContactGivenName: userAddress.firstName,
        dropoffContactFamilyName: userAddress.lastName,
      });
      // console.log({ doordashQuote });
    } catch (err) {
      responseHandler(false, err);
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
    if (!deliveryId) {
      throw new HttpException({
        status: HttpStatus.NOT_ACCEPTABLE,
        error: "No deliveryId provided.",
      }, HttpStatus.NOT_ACCEPTABLE)
    }

    const foundDelivery = await this.deliverModel.findById(deliveryId);

    if (foundDelivery) {
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
    if(!userAddressResponse.success) {
      throw new HttpException({
        status: userAddressResponse.error.statusCode,
        error: userAddressResponse.error.message,
      }, userAddressResponse.error.statusCode);
    }
    
    const selectedAddress = userAddressResponse.data.items[0];
    if(!selectedAddress) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: "No selected address found.",
      }, HttpStatus.NOT_FOUND)
    }
    
    return await this.addressService.validateAddress(selectedAddress._id.toString());
  }

  private async acceptDoordashQuote() {
    // const acceptedDoordashQuote = await this.doordashClient.deliveryQuoteAccept('D-12345');
    // console.log({ acceptedDoordashQuote });

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
