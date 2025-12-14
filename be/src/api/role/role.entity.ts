import { Column, Entity, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { BaseEntity } from '../../share/database/base.entity';
import { RoleStatus, RoleTypes, ROLE_CONST } from './role.constant';
import { PermissionEntity } from '../permission/permission.entity';
import { UserEntity } from '../user/user.entity';

@Entity({ name: ROLE_CONST.MODEL_NAME })
export class RoleEntity extends BaseEntity {
  // id is inherited from BaseEntity as UUID string
  // @PrimaryGeneratedColumn removed - using parent class id

  @Column({ length: 255, unique: true })
  name: string;

  @Column({ type: 'enum', enum: RoleTypes })
  type: number;

  @Column({ type: 'varchar', name: 'created_by', nullable: true })
  createdBy: string;

  @Column({ type: 'boolean', name: 'is_super_admin', default: false })
  isSuperAdmin: boolean;

  @Column({ type: 'enum', enum: RoleStatus, default: RoleStatus.ACTIVE })
  status: number;

  @ManyToMany(() => PermissionEntity)
  @JoinTable({
    name: 'role_permission', // role_permissions_permission
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id' },
  })
  permissions: PermissionEntity[];

  @OneToMany(() => UserEntity, (user) => user.role)
  user: UserEntity[];
}
