import { Redis } from '@upstash/redis';

// Initialize Redis client
// These env vars are automatically set when you connect Upstash to Vercel
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Keys for storing data
export const KEYS = {
  SCHEDULES: 'gsd:schedules',
  SETTINGS: 'gsd:settings',
};

