// order.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './order.entity';
import { OrderDetailEntity } from '../order-detail/order-detail.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { CartModule } from '../cart/cart.module';
import { UserModule } from '../user/user.module';
import { ProductModule } from '../product/product.module';
import { UserEntity } from '../user/user.entity';
import { QueueModule } from '../queue/queue.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderDetailEntity, UserEntity]),
    CartModule,
    UserModule,
    ProductModule,
    EmailModule,
    QueueModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
