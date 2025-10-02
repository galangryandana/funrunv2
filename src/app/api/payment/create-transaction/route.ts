import { NextRequest, NextResponse } from 'next/server';
import { snap, generateOrderId } from '@/lib/midtrans';
import { saveRegistrationToSheets } from '@/lib/sheets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { formData } = body;
    
    if (!formData || !formData.email || !formData.name) {
      return NextResponse.json(
        { error: 'Data peserta tidak lengkap' },
        { status: 400 }
      );
    }

    const orderId = generateOrderId();
    
    const grossAmount = formData.participantCategory === 'student' 
      ? 150000
      : 200000;

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      credit_card: {
        secure: true,
      },
      customer_details: {
        first_name: formData.name.split(' ')[0] || formData.name,
        last_name: formData.name.split(' ').slice(1).join(' ') || '',
        email: formData.email,
        phone: formData.emergencyContactPhone || '08123456789',
      },
      item_details: [
        {
          id: 'fun-run-registration',
          price: grossAmount,
          quantity: 1,
          name: `Pendaftaran Fun Run - ${formData.participantCategory === 'student' ? 'Pelajar' : 'Umum'}`,
          category: 'Event Registration',
        },
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success?order_id=${orderId}`,
      },
      custom_field1: formData.bibName,
      custom_field2: formData.participantCategory,
      custom_field3: formData.shirtSize,
    };

    const transaction = await snap.createTransaction(parameter);

    console.log('Transaction created:', { orderId, grossAmount });

    // Save to Google Sheets dengan status PENDING
    const sheetsResult = await saveRegistrationToSheets(
      formData,
      orderId,
      grossAmount
    );

    if (!sheetsResult.success) {
      console.error('Failed to save to Google Sheets:', sheetsResult.error);
      // CATATAN: Kita tetap lanjutkan transaksi meskipun gagal save ke sheets
      // Bisa di-handle manual atau retry nanti
    }

    return NextResponse.json({
      success: true,
      token: transaction.token,
      orderId: orderId,
      redirectUrl: transaction.redirect_url,
    });

  } catch (error) {
    console.error('Midtrans transaction error:', error);
    return NextResponse.json(
      { 
        error: 'Gagal membuat transaksi pembayaran',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
