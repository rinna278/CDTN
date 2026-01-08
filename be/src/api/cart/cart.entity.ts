import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CartDetailEntity } from '../cart-detail/cart-detail.entity';
import { UserEntity } from '../user/user.entity';
import { Transform } from 'class-transformer';
@Entity('carts')
export class CartEntity {
  // ID duy nhất của giỏ hàng
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // ID của người dùng sở hữu giỏ hàng
  @Column('uuid')
  userId: string;

  // Tổng số lượng sản phẩm trong giỏ
  @Column('int', { default: 0 })
  totalItems: number;

  // Tổng giá trị giỏ hàng
  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  totalPrice: number;

  // Trạng thái giỏ hàng (1: active, 2: checkout, 3: abandoned)
  @Column({ type: 'int', default: 1 })
  status: number;

  // Ngày tạo
  @CreateDateColumn()
  @Transform(({ value }) => value && new Date(value).toISOString())
  createdAt: Date;

  // Ngày cập nhật
  @UpdateDateColumn()
  @Transform(({ value }) => value && new Date(value).toISOString())
  updatedAt: Date;

  // Mối quan hệ với User - một Cart thuộc một User
  @ManyToOne(() => UserEntity)
  user: UserEntity;

  // Mối quan hệ với CartDetail - một Cart có nhiều CartDetail
  @OneToMany(() => CartDetailEntity, (cartDetail) => cartDetail.cart, {
    cascade: true,
  })
  items: CartDetailEntity[];
}
