import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/createPayment.dto';
import { UpdatePaymentDto } from './dto/updatePayment.dto';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';

@UseGuards(AccessTokenGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  async create(@Request() req, @Body() createPaymentDto: CreatePaymentDto) {
    return await this.paymentsService.create(req.user.sub, createPaymentDto);
  }

  @Post('intent')
  async paymentIntent() {
    return await this.paymentsService.createPaymentIntent();
  }

  @Get()
  async findAll(@Request() req) {
    return await this.paymentsService.findAll(req.user.sub);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    return await this.paymentsService.findOne(req.user.sub, id);
  }

  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return await this.paymentsService.update(req.user.sub, id, updatePaymentDto);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    return await this.paymentsService.remove(req.user.sub, id);
  }
}
