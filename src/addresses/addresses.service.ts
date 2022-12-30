import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address, AddressDocument } from 'src/schemas/address.schema';
import { responseHandler } from 'src/utils/responseHandling.util';
import { CreateAddressDto } from './dto/createAddress.dto';
import { UpdateAddressDto } from './dto/updateAddress.dto';

@Injectable()
export class AddressesService {
  constructor(@InjectModel(Address.name) private addressModel: Model<AddressDocument>) { }

  public async addUserAddress(userId: string, createAddressDto: CreateAddressDto) {
    try {
      const { firstName, lastName, streetAddress, aptAddress, city, state, country, zip, phoneNumber } = createAddressDto;
      const currentDate = new Date();
      const newUserAddress = await this.addressModel.create({
        userId,
        firstName,
        lastName,
        streetAddress,
        aptAddress,
        city,
        state,
        country,
        zip,
        phoneNumber,
        isSelected: false,
        dateCreated: currentDate,
        dateUpdated: currentDate,
      });
      const parsedAddress = this.parseAddresses(newUserAddress);
      return responseHandler(true, { items: parsedAddress });
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  public async getUserAddresses(userId: string) {
    try {
      const foundAddresses = await this.addressModel.find({ userId });
      const parsedAddresses = this.parseAddresses(foundAddresses);
      return responseHandler(true, { items: parsedAddresses });
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  public async getUserAddress(userId: string, addressId: string) {
    try {
      const foundAddress = await this.validateAddress(addressId);
      this.validateUserAddressAuth(userId, foundAddress.userId.toString());
      const parsedAddress = this.parseAddresses(foundAddress)
      return responseHandler(true, { items: parsedAddress });
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  public async getSelectedUserAddress(userId: string) {
    try {
      const selectedUserAddress = await this.addressModel.findOne({ userId, isSelected: true });
      const parsedAddress = this.parseAddresses(selectedUserAddress);
      return responseHandler(true, { items: parsedAddress });
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  public async selectUserAddress(userId: string, addressId: string) {
    try {
      const foundAddress = await this.validateAddress(addressId);
      this.validateUserAddressAuth(userId, foundAddress.userId.toString());
      await this.addressModel.updateMany({ userId }, {
        $set: {
          isSelected: false,
          dateUpdated: new Date(),
        } 
      });
      await this.addressModel.findByIdAndUpdate(foundAddress.id, {
        $set: {
          isSelected: true,
          dateUpdated: new Date(),
        }
      });
      return responseHandler(true, { message: "Successfully updated address" })
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  public async updateUserAddress(userId: string, addressId: string, updateAddressDto: UpdateAddressDto) {
    try {
      const foundAddress = await this.validateAddress(addressId);
      this.validateUserAddressAuth(userId, foundAddress.userId.toString())
      await this.addressModel.findByIdAndUpdate(foundAddress.id, {
        $set: {
          ...updateAddressDto,
          dateUpdated: new Date(),
        }
      })
      return responseHandler(true, { message: "Successfully updated address" });
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  public async removeUserAddress(userId: string, addressId: string) {
    try {
      const foundAddress = await this.validateAddress(addressId);
      this.validateUserAddressAuth(userId, foundAddress.userId.toString())
      await this.addressModel.findOneAndDelete(foundAddress.id);
      return responseHandler(true, { message: "Successfully removed address" });
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  public async validateAddress(addressId: string) {
    if(!addressId) {
      throw new HttpException({
        status: HttpStatus.NOT_ACCEPTABLE,
        error: "No addressId provided.",
      }, HttpStatus.NOT_ACCEPTABLE);
    }
    
    const found = await this.addressModel.findById(addressId);
    
    if(!found) {
      throw new HttpException({
        status: HttpStatus.NOT_FOUND,
        error: "No address found.",
      }, HttpStatus.NOT_FOUND);
    }
    
    return found;
  }

  public getUserAddressString(userAddress: Partial<AddressDocument>) {
    const { streetAddress, aptAddress, city, state, zip, country } = userAddress.toObject();
    return `${streetAddress}, ${aptAddress ? `${aptAddress},` : ""} ${city}, ${state} ${zip}${country ? `, ${country}` : ""}`;
  }

  private validateUserAddressAuth(userId: string, addressUserId: string) {
    if(userId !== addressUserId) {
      throw new HttpException({
        status: HttpStatus.UNAUTHORIZED,
        error: "Unauthorized",
      }, HttpStatus.UNAUTHORIZED)
    }
  }

  private parseAddresses(addresses: AddressDocument | AddressDocument[]) {
    const addressArray = Array.isArray(addresses) ? addresses : [addresses];
    const parsedAddresses = addressArray.map((address) => {
      const { userId, _id, ...rest } = address.toObject();
      return { ...rest, id: _id, isSelected: rest.isSelected === "true" ? true : false };
    })
    return parsedAddresses;
  }
}
