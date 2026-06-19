import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export type UserRole = 'admin' | 'instructor' | 'student' | 'guest';

export interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

export const RATE_LIMIT_CONFIGS: Record<UserRole, RateLimitConfig> = {
  admin: { limit: 10000, windowMs: 60000 },
  instructor: { limit: 5000, windowMs: 60000 },
  student: { limit: 1000, windowMs: 60000 },
  guest: { limit: 100, windowMs: 60000 },
};

@Injectable()
export class UserRateLimitService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  /**
   * Sliding window rate limit check.
   * Returns true if the request is allowed.
   */
  async checkRateLimit(
    userId: string,
    role: string,
    endpoint?: string,
  ): Promise<boolean> {
    // Admins bypass rate limiting
    if (role === 'admin') return true;

    const config = this.resolveConfig(role, endpoint);
    const key = endpoint
      ? `rate-limit:${userId}:${endpoint}`
      : `rate-limit:${userId}`;

    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Retrieve sliding window timestamps
    const timestamps = (await this.cacheManager.get<number[]>(key)) ?? [];

    // Filter to only timestamps within the current window
    const windowTimestamps = timestamps.filter((t) => t > windowStart);

    if (windowTimestamps.length >= config.limit) {
      return false;
    }

    windowTimestamps.push(now);
    await this.cacheManager.set(key, windowTimestamps, config.windowMs);
    return true;
  }

  async getRateLimitStatus(
    userId: string,
    role: string,
    endpoint?: string,
  ): Promise<{ limit: number; remaining: number; resetTime: Date }> {
    const config = this.resolveConfig(role, endpoint);
    const key = endpoint
      ? `rate-limit:${userId}:${endpoint}`
      : `rate-limit:${userId}`;

    const now = Date.now();
    const windowStart = now - config.windowMs;
    const timestamps = (await this.cacheManager.get<number[]>(key)) ?? [];
    const windowTimestamps = timestamps.filter((t) => t > windowStart);
    const count = windowTimestamps.length;

    return {
      limit: config.limit,
      remaining: Math.max(0, config.limit - count),
      resetTime: new Date(now + config.windowMs),
    };
  }

  async resetUserLimit(userId: string): Promise<void> {
    await this.cacheManager.del(`rate-limit:${userId}`);
  }

  private resolveConfig(role: string, endpoint?: string): RateLimitConfig {
    if (endpoint && ENDPOINT_RATE_LIMITS[endpoint]) {
      return ENDPOINT_RATE_LIMITS[endpoint];
    }
    return ROLE_RATE_LIMITS[role] ?? ROLE_RATE_LIMITS['guest'];
  }
}
