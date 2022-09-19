import { Injectable } from '@nestjs/common';
import { CreateDeliveryAddressDto } from './dto/create-deliveryAddress.dto';
import { UpdateDeliveryDto } from './dto/update-deliveryAddress.dto';

@Injectable()
export class DeliveryAddressesService {
  create(createDeliveryAddressDto: CreateDeliveryAddressDto) {
    return 'This action adds a new delivery';
  }

  findAll() {
    return `This action returns all deliveries`;
  }

  findOne(id: number) {
    return `This action returns a #${id} delivery`;
  }

  update(id: number, updateDeliveryAddressDto: UpdateDeliveryDto) {
    return `This action updates a #${id} delivery`;
  }

  remove(id: number) {
    return `This action removes a #${id} delivery`;
  }
}
