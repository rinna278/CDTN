// product.entity.ts
import { Column, Entity } from 'typeorm';
import { Exclude } from 'class-transformer';
import {
  ProductStatus,
  PRODUCT_CONST,
  IProductImage,
} from './product.constant';
import { BaseEntity } from '../../share/database/base.entity';

@Entity({ name: PRODUCT_CONST.MODEL_NAME })
export class ProductEntity extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'int', default: 0 })
  discount: number;

  @Column({ type: 'int', default: 0 })
  stock: number;

  @Column({ length: 100, nullable: true })
  category: string;

  @Column({ type: 'simple-json', nullable: true })
  images: IProductImage[];

  @Column({ length: 50, nullable: true })
  color: string;

  @Column({ type: 'simple-json', nullable: true })
  occasions: string[];

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.ACTIVE })
  status: number;

  @Column({ type: 'int', default: 0, name: 'sold_count' })
  soldCount: number;

  @Column({ type: 'varchar', name: 'created_by', nullable: true })
  @Exclude()
  createdBy: string;

  @Column({ type: 'varchar', name: 'updated_by', nullable: true })
  @Exclude()
  updatedBy: string;
}
