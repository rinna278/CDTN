import { Injectable, OnModuleInit } from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PermissionEntity } from '../permission/permission.entity';
import { RoleEntity } from '../role/role.entity';
import { UserEntity } from '../user/user.entity';
import { PERMISSIONS } from '../permission/permission.constant';
import { RoleName, ROLES_DEFAULT, RoleTypes } from '../role/role.constant';
import { DEFAULT_ADMIN_USER, JWT_CONFIG } from '../../configs/constant.config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeederService implements OnModuleInit {
  constructor(
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
    @InjectRepository(RoleEntity)
    private readonly rolesRepository: Repository<RoleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async onModuleInit() {
    await this.seedPermissions();
    await this.seedRoles();
    await this.seedAdminUser();
  }

  private async seedPermissions() {
    for (const permission of Object.values(PERMISSIONS)) {
      const pExisted = await this.permissionRepository.findOneBy({
        name: permission,
      });
      if (!pExisted) {
        await this.permissionRepository.save({ name: permission });
      }
    }
  }

  private async seedRoles() {
    const count = await this.rolesRepository.countBy({});
    if (count > 0) return;

    for (const role of ROLES_DEFAULT) {
      const roleExisted = await this.rolesRepository.findOneBy({
        name: role.name,
      });
      if (!roleExisted) {
        const permissions = await this.permissionRepository.find({
          where: {
            name: In(role.permissions),
          },
        });
        const rModel = new RoleEntity();
        rModel.name = role.name;
        rModel.type = role.type;
        rModel.isSuperAdmin = role.isSuperAdmin || false;
        rModel.permissions = permissions;
        await this.rolesRepository.save(rModel);
      }
    }
  }

  private async seedAdminUser() {
    const userCount = await this.userRepository.count({});
    if (userCount === 0) {
      const uModel = new UserEntity();
      uModel.email = DEFAULT_ADMIN_USER.email;
      uModel.password = await bcrypt.hash(
        DEFAULT_ADMIN_USER.password,
        JWT_CONFIG.SALT_ROUNDS,
      );
      uModel.name = DEFAULT_ADMIN_USER.name;
      uModel.role = await this.rolesRepository.findOneBy({
        type: RoleTypes.Admin,
        name: RoleName.Administrator,
      });
      await this.userRepository.save(uModel);
    }
  }
}
