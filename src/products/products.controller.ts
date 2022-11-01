import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { CheckPolicies, PoliciesGuard, CreateProductPolicyHandler } from 'src/auth/guards/policies.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @UseGuards(AccessTokenGuard, PoliciesGuard)
  @CheckPolicies(new CreateProductPolicyHandler())
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Get('by-page/:page-index')
  findAll(@Param('page-index') pageIndex: string) {
    return this.productsService.findByPage(pageIndex);
  }

  @UseGuards(AccessTokenGuard, PoliciesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(+id, updateProductDto);
  }

  @UseGuards(AccessTokenGuard, PoliciesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
