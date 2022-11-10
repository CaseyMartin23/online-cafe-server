import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DeliveryAddressesService } from './deliveryAddresses.service';
import { CreateDeliveryAddressDto } from './dto/createDeliveryAddress.dto';
import { UpdateDeliveryDto } from './dto/updateDeliveryAddress.dto';

@Controller('delivery-addresses')
export class DeliveryAddressesController {
  constructor(private readonly deliveryAddressesService: DeliveryAddressesService) { }

  @Post()
  create(@Body() createDeliveryDto: CreateDeliveryAddressDto) {
    return this.deliveryAddressesService.create(createDeliveryDto);
  }

  @Get()
  findAll() {
    return this.deliveryAddressesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.deliveryAddressesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDeliveryDto: UpdateDeliveryDto) {
    return this.deliveryAddressesService.update(+id, updateDeliveryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deliveryAddressesService.remove(+id);
  }
}
