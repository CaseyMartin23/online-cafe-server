import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Address, AddressDocument } from 'src/schemas/address.schema';
import { CreateAddressDto } from './dto/createAddress.dto';
import { UpdateAddressDto } from './dto/updateAddress.dto';

@Injectable()
export class AddressesService {
  constructor(@InjectModel(Address.name) private addressModel: Model<AddressDocument>){}

  async addUserAddress(userId: string, createAddressDto: CreateAddressDto) {
    // create new address
    return 'This action adds a new address';
  }
  
  async getUserAddresses(userId: string) {
    // return all users addresses
    return `This action returns all addresses`;
  }
  
  async getUserAddress(userId: string, addressId: string) {
    // validate addressId
    // check that user owns address
    // return user address
    return `This action returns a #${addressId} address`;
  }
  
  async updateUserAddress(userId: string, addressId: string, updateAddressDto: UpdateAddressDto) {
    // validate addressId
    // check that user owns address
    // update users address
    return `This action updates a #${addressId} address`;
  }

  async removeUserAddress(userId: string, addressId: string) {
    // validate addressId
    // check that user owns address
    // remove user address
    return `This action removes a #${addressId} address`;
  }
}
