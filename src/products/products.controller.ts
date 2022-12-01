import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { AccessTokenGuard } from 'src/auth/guards/accessToken.guard';
import { CheckPolicies, PoliciesGuard, CreateProductPolicyHandler } from 'src/auth/guards/policies.guard';

@UseGuards(AccessTokenGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @UseGuards(PoliciesGuard)
  @CheckPolicies(new CreateProductPolicyHandler())
  @Post()
  create(@Request() req, @Body() createProductDto: CreateProductDto) {
    return this.productsService.create(req.user.sub, createProductDto);
  }

  @Get('page')
  public async findAll(@Query("index") pageIndex: string) {
    return await this.productsService.findByPage(pageIndex);
  }

  @Get(':id')
  public async findOne(@Param('id') id: string) {
    return await this.productsService.findOne(id);
  }

  @UseGuards(PoliciesGuard)
  @Patch(':id')
  public async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return await this.productsService.update(id, updateProductDto);
  }

  @UseGuards(PoliciesGuard)
  @Delete(':id')
  public async remove(@Param('id') id: string) {
    return await this.productsService.remove(id);
  }
}
