import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { AddressEntity } from './address.entity';
import { RoleEntity } from '../role/role.entity';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, AddressEntity, RoleEntity])],
  providers: [UserService, AddressService],
  exports: [UserService, AddressService],
  controllers: [UserController, AddressController],
})
export class UserModule {}
