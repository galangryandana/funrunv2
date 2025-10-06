import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { formData } = await request.json();

    // Validate required fields
    if (!formData.email || !formData.name) {
      return NextResponse.json(
        { error: 'Data tidak lengkap' },
        { status: 400 }
      );
    }

    // Generate unique order ID
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const orderId = `FUN-RUN-${timestamp}-${randomNum}`;

    // Get Google Sheets Script URL from environment
    const scriptUrl = process.env.GOOGLE_SHEETS_SCRIPT_URL;
    if (!scriptUrl) {
      throw new Error('Google Sheets Script URL not configured');
    }

    // Prepare data for Google Sheets
    const registrationData = {
      action: 'create',
      data: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        orderId: orderId,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        registeringFor: formData.registeringFor,
        name: formData.name,
        birthDate: formData.birthDate,
        gender: formData.gender,
        address: formData.address,
        nationalId: formData.nationalId,
        bibName: formData.bibName,
        registrationChannel: formData.registrationChannel,
        registrationChannelName: formData.registrationChannelName || '',
        infoSource: formData.infoSource,
        bloodType: formData.bloodType,
        chronicCondition: formData.chronicCondition,
        underDoctorCare: formData.underDoctorCare,
        requiresMedication: formData.requiresMedication,
        experiencedComplications: formData.experiencedComplications,
        experiencedFainting: formData.experiencedFainting,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        shirtSize: formData.shirtSize,
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
