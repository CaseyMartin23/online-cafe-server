import { Controller, Get, Post, Body, Patch, Request, Param, Delete, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto } from './dto/createDelivery.dto';
import { GetDeliveryQuote } from './dto/getDeliveryQuote.dto';
import { UpdateDeliveryDto } from './dto/updateDelivery.dto';

@UseGuards(AccessTokenGuard)
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  public async create(@Request() req) {
    return await this.deliveriesService.addUserDelivery(req.user.sub);
  }

  @Post('quote')
  public async getQuote(@Request() req) {
    return await this.deliveriesService.getQuote(req.user.sub);
  }

  @Get()
  public async findAll(@Request() req) {
    return await this.deliveriesService.getUserDeliveries(req.user.sub);
  }

  @Get(':id')
  public async findOne(@Request() req, @Param('id') id: string) {
    return await this.deliveriesService.getUserDelivery(req.user.sub, id);
  }

  @Patch(':id')
  public async update(@Param('id') id: string, @Body() updateDeliveryDto: UpdateDeliveryDto) {
    return await this.deliveriesService.updateUserDelivery(id, updateDeliveryDto);
  }

  @Delete(':id')
  public async remove(@Param('id') id: string) {
    return await this.deliveriesService.removeUserDelivery(id);
  }
}
