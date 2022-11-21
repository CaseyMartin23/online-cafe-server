import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { UpdatePaymentDto } from './dto/updatePayment.dto';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';

@UseGuards(AccessTokenGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intent')
  async paymentIntent(@Request() req) {
    return await this.paymentsService.createStripeIntent(req.user.sub);
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
