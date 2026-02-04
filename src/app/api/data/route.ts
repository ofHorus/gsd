import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { redis } from '@/lib/redis';

// Helper to get user-specific keys
const getKeys = (userId: string) => ({
  schedules: `gsd:${userId}:schedules`,
  settings: `gsd:${userId}:settings`,
});

// GET - Load user's data
export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Redis is configured
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      return NextResponse.json({ 
        schedules: {}, 
        settings: null,
        source: 'local' 
      });
    }

    const keys = getKeys(userId);
    const [schedules, settings] = await Promise.all([
      redis.get(keys.schedules),
      redis.get(keys.settings),
    ]);

    return NextResponse.json({
      schedules: schedules || {},
      settings: settings || null,
      source: 'redis',
    });
  } catch (error) {
    console.error('Failed to load data:', error);
    return NextResponse.json(
      { error: 'Failed to load data', schedules: {}, settings: null },
      { status: 500 }
    );
  }
}

// POST - Save user's data
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if Redis is configured
    if (!process.env.UPSTASH_REDIS_REST_URL) {
      return NextResponse.json({ 
        success: true, 
        message: 'No Redis configured, data saved locally only' 
      });
    }

    const body = await request.json();
    const { schedules, settings } = body;
    const keys = getKeys(userId);

    await Promise.all([
      schedules !== undefined && redis.set(keys.schedules, schedules),
      settings !== undefined && redis.set(keys.settings, settings),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save data:', error);
    return NextResponse.json(
      { error: 'Failed to save data' },
      { status: 500 }
    );
  }
}
