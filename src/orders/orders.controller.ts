import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderDto } from './dto/updateOrder.dto';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { CheckPolicies, ManageOrdersPolicyHandler } from 'src/auth/guards/policies.guard';

@UseGuards(AccessTokenGuard)
@CheckPolicies(new ManageOrdersPolicyHandler())
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  public async create(@Request() req: any) {
    return await this.ordersService.create(req.user.sub);
  }

  @Get()
  public async findAll(@Request() req: any) {
    return await this.ordersService.findAll(req.user.sub);
  }

  @Get(':id')
  public async findOne(@Request() req: any, @Param('id') id: string) {
    return await this.ordersService.findOne(req.user.sub, id);
  }

  @Patch(':id')
  public async update(@Request() req: any, @Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return await this.ordersService.update(req.user.sub, id, updateOrderDto);
  }

  @Delete(':id')
  public async remove(@Param('id') id: string) {
    return await this.ordersService.remove(id);
  }
}
