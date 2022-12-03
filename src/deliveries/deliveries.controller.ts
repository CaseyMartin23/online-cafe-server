import { Controller, Get, Post, Body, Patch, Request, Param, Delete, UseGuards } from '@nestjs/common';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { CheckPolicies, ManageDeliveryPolicyHandler } from 'src/auth/guards/policies.guard';
import { DeliveriesService } from './deliveries.service';
import { CreateDeliveryDto } from './dto/createDelivery.dto';
import { CreateDeliveryQuoteDto } from './dto/createDeliveryQuote.dto';
import { GetDeliveryQuote } from './dto/getDeliveryQuote.dto';
import { UpdateDeliveryDto } from './dto/updateDelivery.dto';

@UseGuards(AccessTokenGuard)
@CheckPolicies(new ManageDeliveryPolicyHandler())
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @Post()
  public async create(@Request() req: any, @Body() createDelivery: CreateDeliveryDto) {
    return await this.deliveriesService.createPartialDelivery(req.user.sub, createDelivery);
  }

  @Post('quote/:id')
  public async getQuote(@Request() req: any, @Param('id') id: string) {
    return await this.deliveriesService.createQuote(req.user.sub, id);
  }

  @Get()
  public async findAll(@Request() req: any) {
    return await this.deliveriesService.getUserDeliveries(req.user.sub);
  }

  @Get(':id')
  public async findOne(@Request() req: any, @Param('id') id: string) {
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
