import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { UpdatePaymentDto } from './dto/updatePayment.dto';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { CreatePaymentDto } from './dto/createPayment.dto';
import { CheckPolicies, ManagePaymentPolicyHandler } from 'src/auth/guards/policies.guard';

@UseGuards(AccessTokenGuard)
@CheckPolicies(new ManagePaymentPolicyHandler())
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intent')
  public async paymentIntent(@Request() req: any) {
    return await this.paymentsService.createStripeIntent(req.user.sub);
  }

  @Post()
  public async create(@Request() req: any, @Body() newPaymentData: CreatePaymentDto){
    return await this.paymentsService.createPayment(req.user.sub, newPaymentData);
  }

  @Get()
  public async findAll(@Request() req: any) {
    return await this.paymentsService.findAll(req.user.sub);
  }

  @Get(':id')
  public async findOne(@Request() req: any, @Param('id') id: string) {
    return await this.paymentsService.findOne(req.user.sub, id);
  }

  @Patch(':id')
  public async update(@Request() req: any, @Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return await this.paymentsService.update(req.user.sub, id, updatePaymentDto);
  }

  @Delete(':id')
  public async remove(@Request() req: any, @Param('id') id: string) {
    return await this.paymentsService.remove(req.user.sub, id);
  }
}
