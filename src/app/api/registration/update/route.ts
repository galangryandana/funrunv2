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

    // Prepare data untuk Apps Script
    const payload = {
      action: 'update', // ✅ Action UPDATE
      orderId: orderId, // ✅ orderId = nationalId (Nomor KTP)
      data: {
        email: transformedData.email,
        phoneNumber: transformedData.phoneNumber,
        registeringFor: transformedData.registeringFor,
        name: transformedData.name,
        birthDate: transformedData.birthDate,
        gender: transformedData.gender,
        address: transformedData.address,
        nationalId: transformedData.nationalId,
        bibName: transformedData.bibName,
        registrationChannel: transformedData.registrationChannel,
        registrationChannelName: transformedData.registrationChannelName,
        infoSource: transformedData.infoSource,
        bloodType: transformedData.bloodType,
        chronicCondition: transformedData.chronicCondition,
        underDoctorCare: transformedData.underDoctorCare,
        requiresMedication: transformedData.requiresMedication,
        experiencedComplications: transformedData.experiencedComplications,
        experiencedFainting: transformedData.experiencedFainting,
        emergencyContactName: transformedData.emergencyContactName,
        emergencyContactPhone: transformedData.emergencyContactPhone,
        shirtSize: transformedData.shirtSize,
        // Payment amount dan BIB number TIDAK berubah
        paymentAmount: paymentAmount,
        bibNumber: bibNumber,
      },
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
