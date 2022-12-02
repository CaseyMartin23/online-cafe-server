import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderDto } from './dto/updateOrder.dto';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { CheckPolicies, ViewAllOrdersPolicyHandler } from 'src/auth/guards/policies.guard';

@UseGuards(AccessTokenGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  public async create(@Request() req: any) {
    return await this.ordersService.create(req.user.sub);
  }

  @CheckPolicies(new ViewAllOrdersPolicyHandler())
  @Get()
  public async findAll() {
    return await this.ordersService.findAll();
  }

  @Get(':id')
  public async findOne(@Param('id') id: string) {
    return await this.ordersService.findOne(+id);
  }

  @Patch(':id')
  public async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return await this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  public async remove(@Param('id') id: string) {
    return await this.ordersService.remove(+id);
  }
}
