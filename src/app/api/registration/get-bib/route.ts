import { NextRequest, NextResponse } from 'next/server';

/**
 * GET BIB Number from Google Sheets by Order ID
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const appsScriptUrl = process.env.APPS_SCRIPT_ENTRYPOINT;

    if (!appsScriptUrl) {
      throw new Error('APPS_SCRIPT_ENTRYPOINT not configured');
    }

    // Request BIB number dari Apps Script
    const payload = {
      action: 'getBib',
      orderId: orderId,
    };

    console.log('Fetching BIB number for:', orderId);

    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to get BIB number');
    }

    console.log('BIB number fetched:', result.bibNumber);

    return NextResponse.json({ 
      success: true,
      bibNumber: result.bibNumber || null,
      status: result.status || 'PENDING',
    });

  } catch (error) {
    console.error('Error fetching BIB number:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch BIB number',
        success: false,
      },
      { status: 500 }
    );
  }
}
