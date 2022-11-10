import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { CheckPolicies, PoliciesGuard, CreateProductPolicyHandler } from 'src/auth/guards/policies.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @UseGuards(AccessTokenGuard, PoliciesGuard)
  @CheckPolicies(new CreateProductPolicyHandler())
  @Post()
  create(@Req() req, @Body() createProductDto: CreateProductDto) {
    return this.productsService.create(req.user.sub, createProductDto);
  }

  @Get('page')
  async findAll(@Query("index") pageIndex: string) {
    return await this.productsService.findByPage(pageIndex);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(id);
  }

  @UseGuards(AccessTokenGuard, PoliciesGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return await this.productsService.update(id, updateProductDto);
  }

  @UseGuards(AccessTokenGuard, PoliciesGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.productsService.remove(id);
  }
}
