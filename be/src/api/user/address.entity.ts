import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../share/database/base.entity';
import { UserEntity } from './user.entity';

@Entity({ name: 'addresses' })
export class AddressEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  recipientName: string; // tên người nhận

  @Column({ type: 'varchar', length: 15 })
  phoneNumber: string; // số điện thoại người nhận

  @Column({ type: 'varchar', length: 500 })
  street: string; // địa chỉ chi tiết (số nhà, tên đường, etc)

  @Column({ type: 'varchar', length: 100 })
  ward: string; // phường/xã

  @Column({ type: 'varchar', length: 100 })
  district: string; // quận/huyện

  @Column({ type: 'varchar', length: 100 })
  city: string; // tỉnh/thành phố

  @Column({ type: 'boolean', default: false })
  isDefault: boolean; // địa chỉ mặc định

  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode: string; // mã zip (tùy chọn)

  @Column({ type: 'text', nullable: true })
  notes: string; // ghi chú thêm (nhà, công ty, etc)

  // Relationship
  @ManyToOne(() => UserEntity, (user) => user.addresses, {
    onDelete: 'CASCADE', // nếu xóa user thì xóa tất cả addresses
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserEntity;

  @Column({ name: 'user_id' })
  userId: string;
}
