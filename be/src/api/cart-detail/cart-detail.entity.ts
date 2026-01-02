import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from 'src/share/database/base.entity';
import { CART_DETAIL_CONST } from './cart-detail.constant';
import { CartEntity } from '../cart/cart.entity';
import { ProductEntity } from '../product/product.entity';

@Entity({ name: CART_DETAIL_CONST.MODEL_NAME })
export class CartDetailEntity extends BaseEntity {
  @Column({ type: 'uuid', name: 'cart_id' })
  cartId: string;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @Column({ type: 'varchar', length: 50 })
  color: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  discount: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    name: 'subtotal',
  })
  subtotal: number;

  // Relations
  @ManyToOne(() => CartEntity, (cart) => cart.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'cart_id', referencedColumnName: 'id' })
  cart: CartEntity;

  @ManyToOne(() => ProductEntity, { eager: true })
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product: ProductEntity;
}
