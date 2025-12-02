import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeederService } from './seeder.service';
import { RoleEntity } from '../role/role.entity';
import { UserEntity } from '../user/user.entity';
import { PermissionEntity } from '../permission/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PermissionEntity, RoleEntity, UserEntity]),
  ],
  providers: [SeederService],
})
export class SeederModule {}
