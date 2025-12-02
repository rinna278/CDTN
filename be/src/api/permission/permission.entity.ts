import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../share/database/base.entity';
import { PERMISSION_CONST } from './permission.constant';
// import { RoleEntity } from '../../../api/roles/entities/role.entity';

@Entity({ name: PERMISSION_CONST.MODEL_NAME })
export class PermissionEntity extends BaseEntity {
  // id is inherited from BaseEntity as UUID string
  // @PrimaryGeneratedColumn removed - using parent class id

  @Column({ length: 255, unique: true, enum: Object.values(PERMISSION_CONST) })
  name: string;

  // @ManyToMany(() => RoleEntity)
  // @JoinTable()
  // roles: RoleEntity[];
}
