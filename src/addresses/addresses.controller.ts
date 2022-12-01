import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/createAddress.dto';
import { UpdateAddressDto } from './dto/updateAddress.dto';

@UseGuards(AccessTokenGuard)
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  public async create(@Request() req, @Body() createAddressDto: CreateAddressDto) {
    return await this.addressesService.addUserAddress(req.user.sub, createAddressDto);
  }

  @Get()
  public async findAll(@Request() req) {
    return await this.addressesService.getUserAddresses(req.user.sub);
  }

  @Get(':id')
  public async findOne(@Request() req, @Param('id') id: string) {
    return await this.addressesService.getUserAddress(req.user.sub, id);
  }

  @Patch('select/:id')
  public async selectAddress(@Request() req, @Param('id') id: string) {
    return this.addressesService.selectUserAddress(req.user.sub, id);
  }

  @Patch(':id')
  public async update(@Request() req, @Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
    return this.addressesService.updateUserAddress(req.user.sub, id, updateAddressDto);
  }

  @Delete(':id')
  public async remove(@Request() req, @Param('id') id: string) {
    return await this.addressesService.removeUserAddress(req.user.sub, id);
  }
}
