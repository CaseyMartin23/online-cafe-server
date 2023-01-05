import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { PaymentMethodService } from './payment-method.service';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from './dto/update-payment-method.dto';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { CheckPolicies, ManagePaymentPolicyHandler } from 'src/auth/guards/policies.guard';

@UseGuards(AccessTokenGuard)
@CheckPolicies(new ManagePaymentPolicyHandler())
@Controller('payment-methods')
export class PaymentMethodController {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  @Post()
  public async create(@Req() req, @Body() createPaymentMethodDto: CreatePaymentMethodDto) {
    return await this.paymentMethodService.create(req.user.sub, createPaymentMethodDto);
  }

  @Get()
  public async getMethods() {
    return await this.paymentMethodService.getPaymentMethods();
  }

  @Get(':id')
  public async findOne(@Req() req, @Param('id') id: string) {
    return await this.paymentMethodService.findOne(req.user.sub, id);
  }

  @Patch(':id')
  public async update(@Req() req, @Param('id') id: string, @Body() updatePaymentMethodDto: UpdatePaymentMethodDto) {
    return await this.paymentMethodService.update(req.user.sub, id, updatePaymentMethodDto);
  }

  @Delete(':id')
  public async remove(@Req() req, @Param('id') id: string) {
    return await this.paymentMethodService.remove(req.user.sub, id);
  }
}
