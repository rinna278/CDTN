//ĐÃ SỬA

import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../share/database/base.entity';
import { ProductEntity } from '../product/product.entity';
import { DANH_MUC_CONST } from './category.constant';

@Entity({ name: DANH_MUC_CONST.MODEL_NAME })
export class CategoryEntity extends BaseEntity {
  @Column({ length: 255 })
  tenDanhMuc: string;

  // Methods tương tự như ERD
  themDanhMuc() {}
  suaDanhMuc() {}
  xoaDanhMuc() {}
}
