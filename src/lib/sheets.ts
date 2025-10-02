/**
 * Helper functions untuk komunikasi dengan Google Sheets via Apps Script
 */

// Mapping label Bahasa Indonesia
const LABEL_MAPS = {
  registeringFor: {
    self: 'Diri Sendiri',
    other: 'Orang Lain',
  },
  gender: {
    male: 'Pria',
    female: 'Wanita',
  },
  registrationChannel: {
    community: 'Komunitas',
    company: 'Perusahaan',
    organization: 'Organisasi',
    personal: 'Personal',
  },
  infoSource: {
    friend: 'Teman',
    social_media: 'Sosial Media',
    print_media: 'Media Cetak',
  },
  participantCategory: {
    student: 'Pelajar',
    general: 'Umum',
  },
  yesNo: {
    yes: 'Ya',
    no: 'Tidak',
  },
};

type FormDataForSheets = {
  email: string;
  phoneNumber: string;
  registeringFor: 'self' | 'other';
  name: string;
  birthDate: string;
  gender: 'male' | 'female';
  address: string;
  nationalId: string;
  bibName: string;
  registrationChannel: 'community' | 'company' | 'organization' | 'personal';
  registrationChannelName: string;
  infoSource: 'friend' | 'social_media' | 'print_media';
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  chronicCondition: 'yes' | 'no';
  underDoctorCare: 'yes' | 'no';
  requiresMedication: 'yes' | 'no';
  experiencedComplications: 'yes' | 'no';
  experiencedFainting: 'yes' | 'no';
  emergencyContactName: string;
  emergencyContactPhone: string;
  shirtSize: string;
  participantCategory: 'student' | 'general';
};

/**
 * Generate timestamp in WIB (Asia/Jakarta)
 */
function getWIBTimestamp(): string {
  const now = new Date();
  // Format: YYYY-MM-DD HH:mm:ss
  return now.toLocaleString('sv-SE', { 
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).replace('T', ' ');
}

/**
 * Convert form data ke format Bahasa Indonesia untuk Sheets
 */
function convertToIndonesian(formData: FormDataForSheets) {
  return {
    registeringFor: LABEL_MAPS.registeringFor[formData.registeringFor],
    gender: LABEL_MAPS.gender[formData.gender],
    registrationChannel: LABEL_MAPS.registrationChannel[formData.registrationChannel],
    infoSource: LABEL_MAPS.infoSource[formData.infoSource],
    participantCategory: LABEL_MAPS.participantCategory[formData.participantCategory],
    chronicCondition: LABEL_MAPS.yesNo[formData.chronicCondition],
    underDoctorCare: LABEL_MAPS.yesNo[formData.underDoctorCare],
    requiresMedication: LABEL_MAPS.yesNo[formData.requiresMedication],
    experiencedComplications: LABEL_MAPS.yesNo[formData.experiencedComplications],
    experiencedFainting: LABEL_MAPS.yesNo[formData.experiencedFainting],
  };
}

/**
 * CREATE: Save new registration to Google Sheets (status: PENDING)
 */
export async function saveRegistrationToSheets(
  formData: FormDataForSheets,
  orderId: string,
  grossAmount: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const appsScriptUrl = process.env.APPS_SCRIPT_ENTRYPOINT;

    if (!appsScriptUrl) {
      throw new Error('APPS_SCRIPT_ENTRYPOINT not configured');
    }

    // Convert data ke Bahasa Indonesia
    const converted = convertToIndonesian(formData);
    const timestamp = getWIBTimestamp();

    // Prepare data untuk dikirim ke Apps Script
    // Tambah apostrophe prefix untuk nomor agar diformat sebagai text (tidak kehilangan 0 di depan)
    const payload = {
      action: 'create',
      data: {
        createdAt: timestamp,
        updatedAt: timestamp,
        orderId: orderId,
        email: formData.email,
        phoneNumber: "'" + formData.phoneNumber, // Prefix untuk format text
        registeringFor: converted.registeringFor,
        bibNumber: '', // Kosong saat create, akan diisi saat payment SUCCESS
        name: formData.name,
        birthDate: formData.birthDate,
        gender: converted.gender,
        address: formData.address,
        nationalId: "'" + formData.nationalId, // Prefix untuk format text
        bibName: formData.bibName,
        registrationChannel: converted.registrationChannel,
        registrationChannelName: formData.registrationChannelName || '',
        infoSource: converted.infoSource,
        bloodType: formData.bloodType,
        chronicCondition: converted.chronicCondition,
        underDoctorCare: converted.underDoctorCare,
        requiresMedication: converted.requiresMedication,
        experiencedComplications: converted.experiencedComplications,
        experiencedFainting: converted.experiencedFainting,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: "'" + formData.emergencyContactPhone, // Prefix untuk format text
        shirtSize: formData.shirtSize,
        participantCategory: converted.participantCategory,
        amount: grossAmount,
      },
    };

    console.log('Saving to Google Sheets:', { orderId, email: formData.email });

    // Kirim request ke Apps Script
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to save to Google Sheets');
    }

    console.log('Successfully saved to Google Sheets:', orderId);
    return { success: true };

  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * UPDATE: Update registration status in Google Sheets
 */
export async function updateRegistrationStatus(
  orderId: string,
  status: 'SUCCESS' | 'FAILED' | 'PENDING' | 'EXPIRED',
  paymentData?: {
    transactionId?: string;
    paymentType?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const appsScriptUrl = process.env.APPS_SCRIPT_ENTRYPOINT;

    if (!appsScriptUrl) {
      throw new Error('APPS_SCRIPT_ENTRYPOINT not configured');
    }

    const timestamp = getWIBTimestamp();

    // Prepare update data
    const updateData: {
      status: string;
      paymentDate?: string;
      transactionId?: string;
      paymentType?: string;
      generateBibNumber?: boolean;
    } = {
      status: status,
    };

    // Jika status SUCCESS, tambahkan payment info dan trigger BIB number generation
    if (status === 'SUCCESS' && paymentData) {
      updateData.paymentDate = timestamp;
      updateData.generateBibNumber = true; // Trigger Apps Script untuk generate BIB number
      if (paymentData.transactionId) {
        updateData.transactionId = paymentData.transactionId;
      }
      if (paymentData.paymentType) {
        updateData.paymentType = paymentData.paymentType;
      }
    }

    const payload = {
      action: 'update',
      orderId: orderId,
      data: updateData,
    };

    console.log('Updating Google Sheets:', { orderId, status });

    // Kirim request ke Apps Script
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to update Google Sheets');
    }

    console.log('Successfully updated Google Sheets:', orderId);
    return { success: true };

  } catch (error) {
    console.error('Error updating Google Sheets:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
