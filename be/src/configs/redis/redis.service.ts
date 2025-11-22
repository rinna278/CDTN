import { Injectable, Inject } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redisClient: Redis) {}

  // Set giá trị vào Redis
  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      // Nếu có ttl (thời gian sống), set với TTL
      await this.redisClient.set(key, value, 'EX', ttl);
    } else {
      // Nếu không có ttl, set không giới hạn thời gian
      await this.redisClient.set(key, value);
    }
  }

  // Get giá trị từ Redis
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch (e) {
      // Nếu không phải JSON string, trả về giá trị gốc
      return value as unknown as T;
    }
  }

  // Xóa key trong Redis
  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  // Kiểm tra key có tồn tại trong Redis không
  async exists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key);
    return result === 1; // Redis trả về 1 nếu tồn tại, 0 nếu không
  }

  // Xóa hết dữ liệu trong Redis
  async flushAll(): Promise<void> {
    await this.redisClient.flushall();
  }
}
