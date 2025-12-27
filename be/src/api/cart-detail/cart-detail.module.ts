import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartDetailService } from './cart-detail.service';
import { CartDetailController } from './cart-detail.controller';
import { CartDetailEntity } from './cart-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CartDetailEntity])],
  controllers: [CartDetailController],
  providers: [CartDetailService],
  exports: [CartDetailService],
})
export class CartDetailModule {}
