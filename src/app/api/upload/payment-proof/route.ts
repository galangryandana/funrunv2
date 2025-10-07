import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const orderId = formData.get('orderId') as string;
    const userName = formData.get('userName') as string;
    const bibNumber = formData.get('bibNumber') as string;

    if (!file || !orderId) {
      return NextResponse.json(
        { error: 'File dan Order ID diperlukan' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File harus berupa gambar' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Ukuran file maksimal 5MB' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');

    // Get Google Sheets Script URL
    const scriptUrl = process.env.GOOGLE_SHEETS_SCRIPT_URL;
    if (!scriptUrl) {
      throw new Error('Google Sheets Script URL not configured');
    }

    // Send to Apps Script to upload to Google Drive
    const uploadData = {
      action: 'uploadPaymentProof',
      orderId: orderId,
      userName: userName,
      bibNumber: bibNumber,
      file: {
        name: file.name,
        mimeType: file.type,
        data: base64,
      },
    };

    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(uploadData),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to upload payment proof');
    }

    return NextResponse.json({
      success: true,
      driveLink: result.driveLink,
      message: 'Bukti pembayaran berhasil diupload',
    });
  } catch (error) {
    console.error('Upload payment proof error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengupload',
      },
      { status: 500 }
    );
  }
}
