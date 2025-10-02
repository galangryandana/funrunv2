import { NextRequest, NextResponse } from 'next/server';
import { updateRegistrationStatus } from '@/lib/sheets';

/**
 * TEST ENDPOINT - Manual trigger webhook update
 * Hanya untuk development/testing
 * 
 * Usage:
 * POST /api/test-webhook
 * Body: { "orderId": "FUN-RUN-xxx", "status": "SUCCESS" }
 */
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Hanya allow di development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Endpoint not available in production' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId, status } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    const validStatus = status || 'SUCCESS';

    console.log(`[TEST] Manually updating status: ${orderId} -> ${validStatus}`);

    // Update Google Sheets
    const result = await updateRegistrationStatus(
      orderId,
      validStatus as 'SUCCESS' | 'FAILED' | 'PENDING' | 'EXPIRED',
      {
        transactionId: `MANUAL-TEST-${Date.now()}`,
        paymentType: 'manual_test',
      }
    );

    if (!result.success) {
      throw new Error(result.error || 'Failed to update status');
    }

    console.log(`[TEST] Successfully updated: ${orderId}`);

    return NextResponse.json({
      success: true,
      message: `Status updated to ${validStatus}`,
      orderId: orderId,
    });

  } catch (error) {
    console.error('[TEST] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Info endpoint
 */
export async function GET() {
  return NextResponse.json({
    message: 'Manual webhook test endpoint',
    usage: {
      method: 'POST',
      endpoint: '/api/test-webhook',
      body: {
        orderId: 'FUN-RUN-1234567890-123',
        status: 'SUCCESS (optional, default: SUCCESS)',
      },
      example: `
curl -X POST http://localhost:3000/api/test-webhook \\
  -H "Content-Type: application/json" \\
  -d '{"orderId":"FUN-RUN-1234567890-123","status":"SUCCESS"}'
      `,
    },
    note: 'Only available in development mode',
  });
}
