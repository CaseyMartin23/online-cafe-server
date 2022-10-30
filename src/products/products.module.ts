import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { CaslModule } from 'src/auth/casl/casl.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [CaslModule],
  controllers: [ProductsController],
  providers: [ProductsService]
})
export class ProductsModule { }
