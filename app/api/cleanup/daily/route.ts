import { NextRequest, NextResponse } from 'next/server';
import { tokenRepository } from '@/lib/db/repositories/tokenRepository';

/**
 * Daily cleanup endpoint for processing expired plans and moving vehicles
 * This should be called by a cron job or scheduler daily
 */
export async function POST(request: NextRequest) {
  try {
    // Basic authentication check (you might want to add a secret key)
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CLEANUP_SECRET || 'your-secret-key';
    
    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting daily token cleanup process...');
    
    // Process expired plans
    await tokenRepository.processExpiredPlans();
    
    console.log('Daily token cleanup completed successfully');
    
    return NextResponse.json({
      success: true,
      message: 'Daily cleanup completed successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Daily cleanup failed:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Daily cleanup failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Optional: Allow GET requests for health checks
export async function GET() {
  return NextResponse.json({
    service: 'Token Cleanup Service',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
}
