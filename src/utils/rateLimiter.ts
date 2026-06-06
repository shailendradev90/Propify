/**
 * Rate Limiter Utility
 * Prevents abuse by limiting the number of actions a user can perform within a time window
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

class RateLimiter {
  private storage: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Clean up old entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Check if an action is allowed for a given key
   */
  isAllowed(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const entry = this.storage.get(key);

    // Check if user is currently blocked
    if (entry?.blockedUntil && entry.blockedUntil > now) {
      return false;
    }

    // No previous attempts or window expired
    if (!entry || now - entry.firstAttempt > config.windowMs) {
      this.storage.set(key, {
        count: 1,
        firstAttempt: now,
      });
      return true;
    }

    // Increment attempt count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > config.maxAttempts) {
      // Block user if blockDuration is specified
      if (config.blockDurationMs) {
        entry.blockedUntil = now + config.blockDurationMs;
      }
      this.storage.set(key, entry);
      return false;
    }

    this.storage.set(key, entry);
    return true;
  }

  /**
   * Get remaining attempts for a key
   */
  getRemainingAttempts(key: string, config: RateLimitConfig): number {
    const entry = this.storage.get(key);
    if (!entry) return config.maxAttempts;

    const now = Date.now();
    if (now - entry.firstAttempt > config.windowMs) {
      return config.maxAttempts;
    }

    return Math.max(0, config.maxAttempts - entry.count);
  }

  /**
   * Get time until unblocked (in milliseconds)
   */
  getBlockedTimeRemaining(key: string): number {
    const entry = this.storage.get(key);
    if (!entry?.blockedUntil) return 0;

    const remaining = entry.blockedUntil - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.storage.delete(key);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.storage.forEach((entry, key) => {
      // Remove entries older than 1 hour
      if (now - entry.firstAttempt > 60 * 60 * 1000) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.storage.delete(key));
  }

  /**
   * Destroy the rate limiter and clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.storage.clear();
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

// Predefined rate limit configurations
export const RateLimitConfigs = {
  // Login attempts: 5 attempts per 15 minutes, block for 30 minutes
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
    blockDurationMs: 30 * 60 * 1000,
  },
  
  // Signup attempts: 3 attempts per hour
  SIGNUP: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000,
    blockDurationMs: 60 * 60 * 1000,
  },
  
  // Property creation: 10 properties per hour
  CREATE_PROPERTY: {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000,
  },
  
  // Inquiry creation: 5 inquiries per hour
  CREATE_INQUIRY: {
    maxAttempts: 5,
    windowMs: 60 * 60 * 1000,
    blockDurationMs: 60 * 60 * 1000,
  },
  
  // Password reset: 3 attempts per hour
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000,
    blockDurationMs: 60 * 60 * 1000,
  },
  
  // General API calls: 100 per minute
  API_CALL: {
    maxAttempts: 100,
    windowMs: 60 * 1000,
  },
};

/**
 * Check if an action is rate limited
 */
export const checkRateLimit = (
  userId: string,
  action: keyof typeof RateLimitConfigs
): { allowed: boolean; remaining: number; blockedFor?: number } => {
  const config = RateLimitConfigs[action];
  const key = `${action}:${userId}`;
  
  const allowed = rateLimiter.isAllowed(key, config);
  const remaining = rateLimiter.getRemainingAttempts(key, config);
  const blockedFor = rateLimiter.getBlockedTimeRemaining(key);

  return {
    allowed,
    remaining,
    blockedFor: blockedFor > 0 ? blockedFor : undefined,
  };
};

/**
 * Reset rate limit for a user action
 */
export const resetRateLimit = (userId: string, action: keyof typeof RateLimitConfigs): void => {
  const key = `${action}:${userId}`;
  rateLimiter.reset(key);
};

/**
 * Format blocked time for display
 */
export const formatBlockedTime = (milliseconds: number): string => {
  const minutes = Math.ceil(milliseconds / (60 * 1000));
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours !== 1 ? 's' : ''}`;
};

export default rateLimiter;

// Made with Bob
