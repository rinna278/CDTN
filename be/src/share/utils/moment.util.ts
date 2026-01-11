import * as moment from 'moment-timezone';

const VN_TZ = 'Asia/Ho_Chi_Minh';

export function toVietnamTime(value?: Date | string | null) : string | null {
  if (!value) return null;

  return moment.utc(value).tz(VN_TZ).format('YYYY-MM-DD HH:mm:ss');
}

