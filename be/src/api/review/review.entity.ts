//ĐÃ SỬA

import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../share/database/base.entity';
import { REVIEW_CONST } from './review.constant';

@Entity({ name: REVIEW_CONST.MODEL_NAME })
export class ReviewEntity extends BaseEntity {
  @Column()
  maKhachHang: number;

  @Column({ type: 'text' })
  noiDung: string;

  @Column({ type: 'timestamp' })
  ngayGui: Date;

  guiPhanHoi() {}
  xuLyPhanHoi() {}
}
