import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { ProductEntity } from '../product/product.entity';
import { CartEntity } from './cart.entity';
import { CartDetailEntity } from '../cart-detail/cart-detail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartEntity, CartDetailEntity, ProductEntity]),
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
