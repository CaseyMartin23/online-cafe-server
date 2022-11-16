import { Controller, Get, Post, Body, Patch, Request, Param, Delete, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto } from './dto/createDelivery.dto';
import { UpdateDeliveryDto } from './dto/updateDelivery.dto';

@UseGuards(AccessTokenGuard)
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  async create(@Request() req, @Body() createDeliveryDto: CreateDeliveryDto) {
    return await this.deliveriesService.addUserDelivery(req.user.sub, createDeliveryDto);
  }

  @Get()
  async findAll(@Request() req) {
    return await this.deliveriesService.getUserDeliveries(req.user.sub);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return await this.deliveriesService.getUserDelivery(req.user.sub, id);
  }

  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() updateDeliveryDto: UpdateDeliveryDto) {
    return await this.deliveriesService.updateUserDelivery(req.user.sub, id, updateDeliveryDto);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    return await this.deliveriesService.removeUserDelivery(req.user.sub, id);
  }
}
