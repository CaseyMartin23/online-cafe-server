import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from "../schemas/product.schema";
import { CreateProductDto } from './dto/createProduct.dto';
import { UpdateProductDto } from './dto/updateProduct.dto';
import { responseHandler } from '../utils/responseHandling.util'

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
      const data = {
        items: [
          {
            id,
            name,
            description,
            price
          }
        ]
      };

      return responseHandler(true, data);
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  async findByPage(pageNum: string) {
    const intIndex = Number(`${pageNum || "1"}`)
    try {
      const allProducts = await this.productModel.find({});
      const productPage = this.getProductPage(intIndex, allProducts);
      return responseHandler(true, { ...productPage });
    } catch (err) {
      return responseHandler(false, err)
    }
  }

  private getProductPage(pageNum: number, products: ProductDocument[]) {
    const pageSize = 30;
    const totalProductLength = products.length;
    const pageProducts = products.slice((pageNum - 1) * pageSize, pageNum * pageSize);

    return {
      pageNumber: pageNum,
      items: this.parseProducts(pageProducts),
      totalPages: Math.ceil(totalProductLength / pageSize),
      totalItems: totalProductLength,
    }
  }

  private parseProducts(products: ProductDocument[] | ProductDocument) {
    const arrayOfProducts = Array.isArray(products) ? products : [products];
    return arrayOfProducts.map((product) => {
      const { createdBy, ...rest } = product.toObject();
      return rest
    })
  }

  async findOne(id: string) {
    try {
      const foundProduct = await this.productModel.findById(id);

      if(!foundProduct){
        throw new HttpException({
          status: HttpStatus.BAD_REQUEST,
          error: "No product found",
        }, HttpStatus.BAD_REQUEST);
      }

      const parsedProduct = this.parseProducts(foundProduct);
      return responseHandler(true, { items: parsedProduct});
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  async update(id: string, updateProductInfo: UpdateProductDto) {
    try {
      await this.productModel.findByIdAndUpdate(id, {
        $set: {
          ...updateProductInfo,
          dateUpdated: new Date(),
        }
      });
      return await this.findOne(id);
    } catch (err) {
      return responseHandler(false, err);
    }
  }

  async remove(id: string) {
    try {
      const foundProduct = await this.findOne(id);
      
      if(!foundProduct.success){
        const { error } = foundProduct;
        throw new HttpException({
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        }, HttpStatus.BAD_REQUEST);
      }

      await this.productModel.findByIdAndDelete(id);
      return responseHandler(true, { message: "Successfully deleted product" });
    } catch (err) {
      return responseHandler(false, err)
    }
  }
}
