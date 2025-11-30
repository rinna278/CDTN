// import {
//   Column,
//   Entity,
//   OneToMany,
//   ManyToOne,
//   JoinColumn,
//   CreateDateColumn,
// } from 'typeorm';
// import { BaseEntity } from '../../share/database/base.entity';
// import { BillEntity } from '../bill/bill.entity';
// import { OrderDetailEntity } from '../order-detail/order-detail.entity';
// import { UserEntity } from '../user/user.entity';

// @Entity({ name: 'don_hang' })
// export class OrderEntity extends BaseEntity {
//   @Column({ name: 'ma_khach_hang' })
//   customerId: number;

//   @ManyToOne(() => UserEntity)
//   @JoinColumn({ name: 'ma_khach_hang' })
//   customer: UserEntity;

//   @CreateDateColumn({ name: 'ngay_dat' })
//   orderDate: Date;

//   @Column({ name: 'trang_thai', type: 'int', default: 0 })
//   status: number;

//   @Column({ name: 'phuong_thuc_thanh_toan', length: 50 })
//   paymentMethod: string;

//   @Column({ name: 'tong_tien', type: 'decimal', precision: 12, scale: 2 })
//   totalAmount: number;

//   // 🔹 1 đơn hàng có nhiều chi tiết đơn hàng
//   @OneToMany(() => OrderDetailEntity, (detail) => detail.order)
//   orderDetails: OrderDetailEntity[];

//   // 🔹 1 đơn hàng có nhiều hóa đơn
//   @OneToMany(() => BillEntity, (bill) => bill.order)
//   bills: BillEntity[];
// }
