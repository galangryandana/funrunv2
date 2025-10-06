import { NextResponse } from 'next/server';
import {
  transformToIndonesian,
  type RegistrationFormInput,
} from '../utils';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { formData?: RegistrationFormInput };
    const { formData } = body;

    if (!formData) {
      return NextResponse.json(
        { error: 'Form data tidak ditemukan' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!formData.email || !formData.name || !formData.nationalId) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // ✅ Use NATIONAL_ID (KTP) as orderId (unique identifier)
    const orderId = formData.nationalId;

    // Get Google Sheets Script URL from environment
    const scriptUrl = process.env.GOOGLE_SHEETS_SCRIPT_URL;
    if (!scriptUrl) {
      throw new Error('Google Sheets Script URL not configured');
    }

    // ✅ Transform data to Indonesian before sending to Google Sheets
    const transformedData = transformToIndonesian(formData);

    // Prepare data for Google Sheets
    const registrationData = {
      action: 'create',
      data: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        orderId: orderId,
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
        registrationChannelName: transformedData.registrationChannelName || '',
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
      },
    };

    // Send to Google Sheets
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to create registration');
    }

    // Get payment amount and BIB number from Apps Script response
    const paymentAmount = result.paymentAmount || 200001;
    const bibNumber = result.bibNumber || '0001';

    return NextResponse.json({
      success: true,
      orderId: orderId,
      paymentAmount: paymentAmount,
      bibNumber: bibNumber,
      message: 'Pendaftaran berhasil dibuat',
    });
  } catch (error) {
    console.error('Registration create error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Terjadi kesalahan',
      },
      { status: 500 }
    );
  }
}
