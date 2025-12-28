import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionEntity } from '../../api/permission/permission.entity';
import { RoleEntity } from '../../api/role/role.entity';
import { UserEntity } from '../../api/user/user.entity';
import { DATABASE_CONFIG } from '../constant.config';
import { databaseProviders } from './database.providers';
import { AddressEntity } from 'src/api/user/address.entity';
import { CartEntity } from 'src/api/cart/cart.entity';
import { CartDetailEntity } from 'src/api/cart-detail/cart-detail.entity';
import { ProductEntity } from 'src/api/product/product.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: DATABASE_CONFIG.host,
        port: DATABASE_CONFIG.port,
        username: DATABASE_CONFIG.username,
        password: DATABASE_CONFIG.password,
        database: DATABASE_CONFIG.database,
        entities: [
          PermissionEntity,
          RoleEntity,
          UserEntity,
          AddressEntity,
          CartEntity,
          CartDetailEntity,
          ProductEntity,
        ],
        migrations: [__dirname + '/../../migrations/*.ts'],
        autoLoadEntities: true,
        synchronize: true,
        logging: DATABASE_CONFIG.logging,
      }),
    }),
  ],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
