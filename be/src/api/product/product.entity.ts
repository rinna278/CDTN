// //ĐÃ SỬA

// import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
// import { BaseEntity } from '../../share/database/base.entity';
// import { DiscountEntity } from '../discount/discount.entity';
// import { OrderDetailEntity } from '../order-detail/order-detail.entity';
// import { PRODUCT_CONST } from './product.constant';
// import { CartDetailEntity } from '../cart-detail/cart-detail.entity';

// @Entity({ name: PRODUCT_CONST.MODEL_NAME })
// export class ProductEntity extends BaseEntity {
//   @Column({ length: 200 })
//   name: string;

//   @Column({ type: 'text', nullable: true })
//   description: string;

//   @Column({ type: 'decimal', precision: 10, scale: 2 })
//   price: number;

//   @Column({ type: 'int' })
//   status: number;

//   @Column({ type: 'int' })
//   stock: number;

//   // @ManyToOne(() => DiscountEntity, (discount) => discount.products)
//   // @JoinColumn({ name: 'discountID' })
//   // discount: DiscountEntity;

//   // @OneToMany(() => OrderDetailEntity, (orderDetail) => orderDetail.product)
//   // orderDetails: OrderDetailEntity[];

//   @OneToMany(() => CartDetailEntity, (cartDetail) => cartDetail.product)
//   cartDetails: CartDetailEntity[];

//   // Methods
//   themSanPham() {}
//   suaSanPham() {}
//   xoaSanPham() {}
//   timKiem() {}
//   locSanPham() {}
// }
