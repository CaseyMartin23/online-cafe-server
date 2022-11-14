import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CaslModule } from 'src/auth/casl/casl.module';
import { Product, ProductSchema } from 'src/schemas/product.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [CaslModule, MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule { }
