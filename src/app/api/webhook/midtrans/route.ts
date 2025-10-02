import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { snap } from '@/lib/midtrans';
import { updateRegistrationStatus } from '@/lib/sheets';
import type { MidtransNotification } from '@/types/midtrans';

function verifySignature(notification: MidtransNotification): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY || '';
  const signatureKey = notification.signature_key;
  
  const hash = crypto
    .createHash('sha512')
    .update(
      `${notification.order_id}${notification.status_code}${notification.gross_amount}${serverKey}`
    )
    .digest('hex');
  
  return hash === signatureKey;
}

export async function POST(request: NextRequest) {
  try {
    const notification: MidtransNotification = await request.json();
    
    console.log('Midtrans Notification received:', {
      orderId: notification.order_id,
      transactionStatus: notification.transaction_status,
      fraudStatus: notification.fraud_status,
    });

    if (!verifySignature(notification)) {
      console.error('Invalid signature from Midtrans');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    const statusResponse = await snap.transaction.status(orderId);
    
    console.log('Transaction status verified:', statusResponse);

    let registrationStatus: 'SUCCESS' | 'FAILED' | 'PENDING' | 'EXPIRED' = 'PENDING';

    if (transactionStatus === 'capture') {
      if (fraudStatus === 'accept') {
        registrationStatus = 'SUCCESS';
      }
    } else if (transactionStatus === 'settlement') {
      registrationStatus = 'SUCCESS';
    } else if (
      transactionStatus === 'cancel' ||
      transactionStatus === 'deny' ||
      transactionStatus === 'expire'
    ) {
      registrationStatus = 'FAILED';
    } else if (transactionStatus === 'pending') {
      registrationStatus = 'PENDING';
    }

    console.log(`Order ${orderId} status: ${registrationStatus}`);

    // Update Google Sheets
    const sheetsResult = await updateRegistrationStatus(
      orderId,
      registrationStatus,
      {
        transactionId: notification.transaction_id,
        paymentType: notification.payment_type,
      }
    );

    if (!sheetsResult.success) {
      console.error('Failed to update Google Sheets:', sheetsResult.error);
      // CATATAN: Kita tetap return success agar Midtrans tidak retry
      // Error bisa di-handle manual atau retry nanti
    } else {
      console.log(`Google Sheets updated: ${orderId} - ${registrationStatus}`);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Notification processed'
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Midtrans webhook endpoint is active' 
  });
}
