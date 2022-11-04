import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from "../schemas/product.schema";
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) { }

  async create(userId: string, createProductDto: CreateProductDto) {
    try {
      const { id, name, description, price } = await this.productModel.create({
        ...createProductDto,
        createdBy: userId,
        isPublished: false,
        dateCreated: new Date(),
        dateUpdated: new Date(),
      });

      return {
        success: true,
        createdProduct: {
          id,
          name,
          description,
          price
        }
      }
    } catch (err) {
      console.error(err);
      return { success: false }
    }
  }

  async findByPage(index: string) {
    const intIndex = Number(`${index ? index : "0"}`)
    try {
      const allProducts = await this.productModel.find({});
      return {
        success: true,
        result: this.getProductPage(intIndex, allProducts),
      }
    } catch (err) {
      console.error(err)
    }
  }

  private getProductPage(index: number, products: ProductDocument[]) {
    const pageSize = 50;
    const totalProductLength = products.length;
    const pageProducts = products.slice(index * pageSize, (index + 1) * pageSize);

    return {
      pageIndex: index,
      items: this.parseProducts(pageProducts),
      totalPages: Math.ceil(totalProductLength / pageSize),
      totalItems: totalProductLength,
    }
  }

  private parseProducts(products: ProductDocument[]) {
    return products.map((product) => {
      const { createdBy, ...rest } = product;
      return rest
    })
  }

  findOne(id: string) {
    return `This action returns a #${id} product`;
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: string) {
    return `This action removes a #${id} product`;
  }
}
