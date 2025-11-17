//ĐÃ SỬA

import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../share/database/base.entity';
import { BAO_CAO_CONST } from './report.constant';

@Entity({ name: BAO_CAO_CONST.MODEL_NAME })
export class ReportEntity extends BaseEntity {
  @Column({ length: 255 })
  loaiBaoCao: string; // doanh thu, công nợ, bán hàng...

  @Column({ type: 'timestamp' })
  ngayLap: Date;

  @Column({ type: 'text' })
  noiDung: string;

  xemBaoCao() {}
  xuatBaoCao() {}
}
