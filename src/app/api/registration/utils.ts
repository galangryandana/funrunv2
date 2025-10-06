export type RegisteringForOption = 'self' | 'other';
export type GenderOption = '' | 'male' | 'female';
export type RegistrationChannelOption = '' | 'community' | 'company' | 'organization' | 'personal';
export type InfoSourceOption = '' | 'friend' | 'social_media' | 'print_media';
export type YesNoOption = '' | 'yes' | 'no';
export type ShirtSizeOption = '' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
export type BloodTypeOption =
  | ''
  | 'A+'
  | 'A-'
  | 'B+'
  | 'B-'
  | 'O+'
  | 'O-'
  | 'AB+'
  | 'AB-';

export type RegistrationFormInput = {
  email: string;
  phoneNumber: string;
  registeringFor: RegisteringForOption;
  name: string;
  birthDate: string;
  gender: GenderOption;
  address: string;
  nationalId: string;
  bibName: string;
  registrationChannel: RegistrationChannelOption;
  registrationChannelName?: string;
  infoSource: InfoSourceOption;
  bloodType: BloodTypeOption;
  chronicCondition: YesNoOption;
  underDoctorCare: YesNoOption;
  requiresMedication: YesNoOption;
  experiencedComplications: YesNoOption;
  experiencedFainting: YesNoOption;
  emergencyContactName: string;
  emergencyContactPhone: string;
  shirtSize: ShirtSizeOption;
};

export type RegistrationSheetData = Omit<
  RegistrationFormInput,
  |
    'registeringFor'
    | 'gender'
    | 'registrationChannel'
    | 'infoSource'
    | 'chronicCondition'
    | 'underDoctorCare'
    | 'requiresMedication'
    | 'experiencedComplications'
    | 'experiencedFainting'
> & {
  registeringFor: string;
  gender: string;
  registrationChannel: string;
  infoSource: string;
  chronicCondition: string;
  underDoctorCare: string;
  requiresMedication: string;
  experiencedComplications: string;
  experiencedFainting: string;
};

const registrationChannelMap: Record<RegistrationChannelOption, string> = {
  '': '',
  community: 'Komunitas',
  company: 'Perusahaan',
  organization: 'Organisasi',
  personal: 'Personal',
};

const infoSourceMap: Record<InfoSourceOption, string> = {
  '': '',
  friend: 'Teman',
  social_media: 'Sosial Media',
  print_media: 'Media Cetak',
};

const yesNoMap: Record<YesNoOption, string> = {
  '': '',
  yes: 'Ya',
  no: 'Tidak',
};

export function transformToIndonesian(data: RegistrationFormInput): RegistrationSheetData {
  return {
    ...data,
    registeringFor: data.registeringFor === 'self' ? 'Diri Sendiri' : 'Orang Lain',
    gender:
      data.gender === 'male'
        ? 'Pria'
        : data.gender === 'female'
        ? 'Wanita'
        : data.gender,
    registrationChannel: registrationChannelMap[data.registrationChannel] ?? data.registrationChannel,
    infoSource: infoSourceMap[data.infoSource] ?? data.infoSource,
    chronicCondition: yesNoMap[data.chronicCondition] ?? data.chronicCondition,
    underDoctorCare: yesNoMap[data.underDoctorCare] ?? data.underDoctorCare,
    requiresMedication: yesNoMap[data.requiresMedication] ?? data.requiresMedication,
    experiencedComplications:
      yesNoMap[data.experiencedComplications] ?? data.experiencedComplications,
    experiencedFainting: yesNoMap[data.experiencedFainting] ?? data.experiencedFainting,
  };
}
