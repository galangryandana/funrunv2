import { NextRequest, NextResponse } from 'next/server';
import {
  transformToIndonesian,
  type RegistrationFormInput,
} from '../utils';

/**
 * UPDATE existing registration
 * Called when user clicks "Ubah Data Diri" and re-submit
 */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      formData?: RegistrationFormInput;
      orderId?: string;
      paymentAmount?: number;
      bibNumber?: string;
    };
    const { formData, orderId, paymentAmount, bibNumber } = body;

    if (!formData || !orderId) {
      return NextResponse.json(
        { error: 'Form data dan Order ID diperlukan' },
        { status: 400 }
      );
    }

    const appsScriptUrl = process.env.GOOGLE_SHEETS_SCRIPT_URL;

    if (!appsScriptUrl) {
      throw new Error('GOOGLE_SHEETS_SCRIPT_URL not configured');
    }

    // ✅ Transform data to Indonesian before sending to Google Sheets
    const transformedData = transformToIndonesian(formData);

    // Prepare data untuk Apps Script (structure matches Apps Script expectations)
    const payload = {
      action: 'update', // ✅ Action UPDATE
      orderId: orderId, // ✅ orderId = nationalId (Nomor KTP)
      data: transformedData, // ✅ Send transformed data directly (Apps Script will preserve BIB & paymentAmount)
    };

    console.log('🔄 Updating registration:', orderId);

    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to update registration');
    }

    console.log('✅ Registration updated successfully');

    return NextResponse.json({
      success: true,
      message: 'Registration updated successfully',
      orderId: orderId,
      paymentAmount: paymentAmount,
      bibNumber: bibNumber,
    });

  } catch (error) {
    console.error('Update registration error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to update registration',
        success: false,
      },
      { status: 500 }
    );
  }
}
