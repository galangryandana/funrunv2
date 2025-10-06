"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  Heart,
  Mail,
  MapPin,
  Phone,
  ShoppingBag,
  Star,
  User,
} from "lucide-react";

type ShirtSize = "" | "S" | "M" | "L" | "XL" | "XXL";
type RegistrationChannel = "" | "community" | "company" | "organization" | "personal";
type InfoSource = "" | "friend" | "social_media" | "billboard";
type YesNoValue = "" | "yes" | "no";

type FormData = {
  email: string;
  phoneNumber: string;
  registeringFor: "self" | "other";
  name: string;
  birthDate: string;
  gender: "" | "male" | "female";
  address: string;
  nationalId: string;
  bibName: string;
  registrationChannel: RegistrationChannel;
  registrationChannelName: string;
  infoSource: InfoSource;
  bloodType: "" | "A" | "B" | "O" | "AB";
  chronicCondition: YesNoValue;
  underDoctorCare: YesNoValue;
  requiresMedication: YesNoValue;
  experiencedComplications: YesNoValue;
  experiencedFainting: YesNoValue;
  emergencyContactName: string;
  emergencyContactPhone: string;
  shirtSize: ShirtSize;
  agreedToTerm1: boolean;
  agreedToTerm2: boolean;
  agreedToTerm3: boolean;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const shirtSizes: ShirtSize[] = ["S", "M", "L", "XL", "XXL"];

const genderLabels = { male: "Pria", female: "Wanita" } as const;
const registrationChannelLabels = {
  community: "Komunitas",
  company: "Perusahaan",
  organization: "Organisasi",
  personal: "Personal",
} as const;
const registrationChannelNameLabels = {
  community: "Nama Komunitas *",
  company: "Nama Perusahaan *",
  organization: "Nama Organisasi *",
} as const;
const registrationChannelNamePlaceholders = {
  community: "Masukkan nama komunitas",
  company: "Masukkan nama perusahaan",
  organization: "Masukkan nama organisasi",
} as const;
const registeringForLabels = { self: "Dirimu sendiri", other: "Orang lain" } as const;

type StepKey = "email" | "info" | "questionnaire" | "racePack" | "payment";

type StepConfig = {
  key: StepKey;
  title: string;
  description: string;
  fields: (keyof FormData)[];
};

const stepConfigs: StepConfig[] = [
  {
    key: "email",
    title: "Masukkan Email",
    description: "Mulai pendaftaran dengan email aktif serta nomor telepon aktif dan pilih siapa yang didaftarkan.",
    fields: ["email", "phoneNumber", "registeringFor"],
  },
  {
    key: "info",
    title: "Informasi Peserta",
    description: "Lengkapi data pribadi sesuai identitas resmi.",
    fields: [
      "name",
      "birthDate",
      "gender",
      "nationalId",
      "address",
      "bibName",
      "registrationChannel",
      "registrationChannelName",
      "infoSource",
    ],
  },
  {
    key: "questionnaire",
    title: "Kuesioner Kesehatan",
    description: "Berikan informasi kesehatan dan kontak darurat untuk keamanan lomba.",
    fields: [
      "bloodType",
      "chronicCondition",
      "underDoctorCare",
      "requiresMedication",
      "experiencedComplications",
      "emergencyContactName",
      "emergencyContactPhone",
    ],
  },
  {
    key: "racePack",
    title: "Race Pack",
    description: "Pilih ukuran jersey yang paling sesuai.",
    fields: ["shirtSize"],
  },
  {
    key: "payment",
    title: "Syarat & Ketentuan",
    description: "Baca dan setujui syarat & ketentuan pendaftaran.",
    fields: ["agreedToTerm1", "agreedToTerm2", "agreedToTerm3"],
  },
];

const stepFieldList = Array.from(new Set(stepConfigs.flatMap((step) => step.fields))) as (keyof FormData)[];

type StepVisual = {
  key: StepKey;
  label: string;
  icon: LucideIcon;
};

const stepVisuals: StepVisual[] = [
  { key: "email", label: "Email", icon: Phone },
  { key: "info", label: "Informasi", icon: User },
  { key: "questionnaire", label: "Kuesioner", icon: Heart },
  { key: "racePack", label: "Race Pack", icon: ShoppingBag },
  { key: "payment", label: "Pembayaran", icon: CreditCard },
];

// LocalStorage keys
const STORAGE_KEY = 'funrun_registration_data';

export default function MalangFunRunPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    phoneNumber: "",
    registeringFor: "self",
    name: "",
    birthDate: "",
    gender: "",
    address: "",
    nationalId: "",
    bibName: "",
    registrationChannel: "",
    registrationChannelName: "",
    infoSource: "",
    bloodType: "",
    chronicCondition: "",
    underDoctorCare: "",
    requiresMedication: "",
    experiencedComplications: "",
    experiencedFainting: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    shirtSize: "",
    agreedToTerm1: false,
    agreedToTerm2: false,
    agreedToTerm3: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPaymentPage, setIsPaymentPage] = useState(false); // Payment instruction page
  const [currentStep, setCurrentStep] = useState(0);
  const [orderId, setOrderId] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<number>(0); // Unique amount: 200.001, 200.002, dst
  const [bibNumber, setBibNumber] = useState<string>(""); // BIB number: 0001, 0002, dst
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true); // ✅ Loading state untuk localStorage
  const [isEditMode, setIsEditMode] = useState(false); // ✅ Track apakah ini edit mode atau create mode

  // ✅ Load dari localStorage saat component mount
  useEffect(() => {
    console.log('🔍 Checking localStorage...');
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        console.log('📦 Found data in localStorage:', parsed);
        
        if (parsed.formData && parsed.orderId && parsed.paymentAmount && parsed.bibNumber) {
          console.log('✅ Valid data found, loading...');
          setFormData(parsed.formData);
          setOrderId(parsed.orderId);
          setPaymentAmount(parsed.paymentAmount);
          // ✅ Ensure bibNumber is string with leading zeros (format: 0001, 0002, etc)
          setBibNumber(String(parsed.bibNumber).padStart(4, '0'));
          setIsEditMode(parsed.isEditMode || false); // ✅ Load isEditMode dari localStorage
          setIsPaymentPage(true); // Langsung ke halaman pembayaran
          console.log('✅ Data loaded successfully, redirecting to payment page');
        } else {
          console.log('⚠️ Data incomplete, clearing localStorage');
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        console.error('❌ Error parsing localStorage:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    } else {
      console.log('ℹ️ No saved data in localStorage');
    }
    
    setIsInitializing(false);
  }, []);

  // ✅ Auto-save ke localStorage saat payment page state berubah
  useEffect(() => {
    if (isPaymentPage && orderId && paymentAmount && bibNumber) {
      // ✅ CRITICAL: Ensure bibNumber is string with leading zeros before saving
      const formattedBibNumber = String(bibNumber).padStart(4, '0');
      
      const dataToSave = {
        formData,
        orderId,
        paymentAmount,
        bibNumber: formattedBibNumber, // ✅ Save with guaranteed format
        isEditMode, // ✅ Save isEditMode ke localStorage
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      console.log('💾 Data auto-saved to localStorage, BIB:', formattedBibNumber);
    }
  }, [isPaymentPage, orderId, paymentAmount, bibNumber, formData, isEditMode]);

  // ✅ Clear localStorage
  const clearLocalStorage = () => {
    localStorage.removeItem(STORAGE_KEY);
    console.log('Data cleared from localStorage');
  };

  const validators: Record<keyof FormData, () => string | undefined> = {
    email: () => {
      if (!formData.email.trim()) return "Email wajib diisi";
      if (!/\S+@\S+\.\S+/.test(formData.email)) return "Format email tidak valid";
      return undefined;
    },
    phoneNumber: () => {
      const digits = formData.phoneNumber.replace(/\D/g, "");
      if (!digits) return "Nomor telepon wajib diisi";
      if (digits.length < 10 || digits.length > 13) return "Nomor telepon tidak valid (10-13 digit)";
      return undefined;
    },
    registeringFor: () => undefined,
    name: () => (!formData.name.trim() ? "Nama lengkap wajib diisi" : undefined),
    birthDate: () => (!formData.birthDate ? "Tanggal lahir wajib diisi" : undefined),
    gender: () => (!formData.gender ? "Jenis kelamin wajib dipilih" : undefined),
    address: () => (!formData.address.trim() ? "Alamat wajib diisi" : undefined),
    nationalId: () => {
      const digits = formData.nationalId.replace(/\D/g, "");
      if (!digits) return "Nomor KTP wajib diisi";
      if (digits.length !== 16) return "Nomor KTP harus 16 digit";
      return undefined;
    },
    bibName: () => {
      const bibName = formData.bibName.trim();
      if (!bibName) return "Nama BIB wajib diisi";
      if (bibName.length > 15) return "Nama BIB maksimal 15 karakter";
      return undefined;
    },
    registrationChannel: () =>
      !formData.registrationChannel ? "Pilih asal pendaftaran" : undefined,
    registrationChannelName: () => {
      if (["community", "company", "organization"].includes(formData.registrationChannel)) {
        if (!formData.registrationChannelName.trim()) return "Nama wajib diisi";
      }
      return undefined;
    },
    infoSource: () => (!formData.infoSource ? "Pilih sumber informasi" : undefined),
    bloodType: () => (!formData.bloodType ? "Pilih golongan darah" : undefined),
    chronicCondition: () => (!formData.chronicCondition ? "Pilih salah satu" : undefined),
    underDoctorCare: () => (!formData.underDoctorCare ? "Pilih salah satu" : undefined),
    requiresMedication: () => (!formData.requiresMedication ? "Pilih salah satu" : undefined),
    experiencedComplications: () =>
      !formData.experiencedComplications ? "Pilih salah satu" : undefined,
    experiencedFainting: () => (!formData.experiencedFainting ? "Pilih salah satu" : undefined),
    emergencyContactName: () =>
      !formData.emergencyContactName.trim() ? "Nama kontak darurat wajib diisi" : undefined,
    emergencyContactPhone: () => {
      const digits = formData.emergencyContactPhone.replace(/\D/g, "");
      if (!digits) return "Nomor kontak darurat wajib diisi";
      if (digits.length < 10 || digits.length > 13) return "Nomor kontak darurat tidak valid";
      return undefined;
    },
    shirtSize: () => (!formData.shirtSize ? "Pilih ukuran jersey" : undefined),
    agreedToTerm1: () => (!formData.agreedToTerm1 ? "Anda harus menyetujui ketentuan ini" : undefined),
    agreedToTerm2: () => (!formData.agreedToTerm2 ? "Anda harus menyetujui ketentuan ini" : undefined),
    agreedToTerm3: () => (!formData.agreedToTerm3 ? "Anda harus menyetujui ketentuan ini" : undefined),
  };

  const runValidation = (fieldNames: (keyof FormData)[]) => {
    const stepErrors: FormErrors = {};

    fieldNames.forEach((field) => {
      const validator = validators[field];
      if (!validator) return;
      const message = validator();
      if (message) {
        stepErrors[field] = message;
      }
    });

    setErrors((previous) => {
      const merged = { ...previous };
      fieldNames.forEach((field) => {
        if (stepErrors[field]) {
          merged[field] = stepErrors[field];
        } else {
          delete merged[field];
        }
      });
      return merged;
    });

    return stepErrors;
  };

  const validateFields = (fieldNames: (keyof FormData)[]) =>
    Object.keys(runValidation(fieldNames)).length === 0;

  const validateAll = () => runValidation(stepFieldList);

  const handleChange = (name: keyof FormData, value: FormData[keyof FormData]) => {
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "registrationChannel") {
        updated.registrationChannelName = "";
      }
      return updated;
    });
    setErrors((prev) => {
      const hasDirectError = prev[name];
      const needsChannelCleanup =
        name === "registrationChannel" && prev.registrationChannelName !== undefined;

      if (!hasDirectError && !needsChannelCleanup) {
        return prev;
      }

      const updated = { ...prev };
      delete updated[name];
      if (needsChannelCleanup) {
        delete updated.registrationChannelName;
      }
      return updated;
    });
  };

  const handleNext = () => {
    if (!validateFields(stepConfigs[currentStep].fields)) {
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, stepConfigs.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateFields(stepConfigs[currentStep].fields)) {
      return;
    }

    const allErrors = validateAll();
    if (Object.keys(allErrors).length > 0) {
      const firstInvalidStepIndex = stepConfigs.findIndex((step) =>
        step.fields.some((field) => allErrors[field])
      );
      if (firstInvalidStepIndex >= 0) {
        setCurrentStep(firstInvalidStepIndex);
      }
      return;
    }

    setIsLoading(true);

    try {
      // ✅ Cek mode: CREATE atau UPDATE
      if (isEditMode) {
        // UPDATE existing registration
        console.log('🔄 Update mode: updating existing registration');
        const response = await fetch('/api/registration/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            formData,
            orderId,
            paymentAmount, // Tetap sama
            bibNumber, // Tetap sama
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Gagal mengupdate pendaftaran');
        }

        console.log('✅ Registration updated successfully');
        // ✅ IMPORTANT: Re-ensure bibNumber format after update
        setBibNumber(String(bibNumber).padStart(4, '0'));
        setIsLoading(false);
        setIsPaymentPage(true); // Kembali ke payment page
        // Data orderId, paymentAmount, bibNumber tetap sama
        
      } else {
        // CREATE new registration
        console.log('➕ Create mode: creating new registration');
        const response = await fetch('/api/registration/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ formData }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Gagal membuat pendaftaran');
        }

        // Save orderId, unique payment amount, and BIB number
        if (data.orderId && data.paymentAmount && data.bibNumber) {
          console.log('✅ Registration created:', data.orderId);
          console.log('Payment amount:', data.paymentAmount);
          console.log('BIB number:', data.bibNumber);
          setOrderId(data.orderId);
          setPaymentAmount(data.paymentAmount);
          // ✅ Ensure bibNumber is string with leading zeros (format: 0001, 0002, etc)
          setBibNumber(String(data.bibNumber).padStart(4, '0'));
          setIsEditMode(true); // ✅ Set ke edit mode setelah create pertama kali
          setIsLoading(false);
          setIsPaymentPage(true); // Show payment instruction page
          // ✅ Data akan otomatis tersimpan oleh useEffect
        } else {
          throw new Error('Data tidak lengkap dari server');
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan');
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    // ✅ Clear localStorage first
    clearLocalStorage();
    
    setFormData({
      email: "",
      phoneNumber: "",
      registeringFor: "self",
      name: "",
      birthDate: "",
      gender: "",
      address: "",
      nationalId: "",
      bibName: "",
      registrationChannel: "",
      registrationChannelName: "",
      infoSource: "",
      bloodType: "",
      chronicCondition: "",
      underDoctorCare: "",
      requiresMedication: "",
      experiencedComplications: "",
      experiencedFainting: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      shirtSize: "",
      agreedToTerm1: false,
      agreedToTerm2: false,
      agreedToTerm3: false,
    });
    setErrors({});
    setIsSubmitted(false);
    setIsPaymentPage(false);
    setCurrentStep(0);
    setOrderId("");
    setPaymentAmount(0);
    setBibNumber("");
    setPaymentProofFile(null);
    setIsEditMode(false); // ✅ Reset edit mode
  };

  // ✅ Handle back to edit data
  const handleBackToEdit = () => {
    console.log('📝 Edit mode activated, current BIB:', bibNumber);
    // ✅ Re-ensure bibNumber format before going back to edit
    setBibNumber(String(bibNumber).padStart(4, '0'));
    setIsPaymentPage(false);
    setCurrentStep(0); // Kembali ke step pertama
    // isEditMode tetap true, tidak berubah
    console.log('📝 Will UPDATE on next submit, BIB ensured:', String(bibNumber).padStart(4, '0'));
  };

  // Handle payment proof upload
  const handlePaymentProofUpload = async () => {
    if (!paymentProofFile) {
      alert('Silakan upload bukti pembayaran terlebih dahulu');
      return;
    }

    setIsUploadingProof(true);

    try {
      // Upload to Google Drive
      const uploadFormData = new FormData();
      uploadFormData.append('file', paymentProofFile);
      uploadFormData.append('orderId', orderId);
      uploadFormData.append('userName', formData.name); // ✅ Tambah nama peserta
      uploadFormData.append('nationalId', formData.nationalId); // ✅ Tambah nomor KTP

      const response = await fetch('/api/upload/payment-proof', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal mengupload bukti pembayaran');
      }

      console.log('Payment proof uploaded:', data.driveLink);
      
      // ✅ Clear localStorage after successful upload
      clearLocalStorage();
      
      // Show success page
      setIsUploadingProof(false);
      setIsPaymentPage(false);
      setIsSubmitted(true);
    } catch (error) {
      console.error('Upload error:', error);
      alert(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengupload');
      setIsUploadingProof(false);
    }
  };

  // ✅ Loading screen saat initialize (check localStorage)
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-green-50 to-lime-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Memuat data pendaftaran...</p>
        </div>
      </div>
    );
  }

  // Payment instruction page
  if (isPaymentPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-green-50 to-lime-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CreditCard className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Instruksi Pembayaran</h2>
            <p className="text-gray-600">Silakan transfer sesuai nominal yang tertera</p>
          </div>

          {/* Payment Amount */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 text-center border-2 border-green-200">
            <p className="text-sm text-gray-600 mb-2">Nominal Transfer</p>
            <p className="text-4xl md:text-5xl font-bold text-green-600">
              Rp {paymentAmount.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              *Pastikan nominal yang anda transfer sesuai dengan nominal di atas
            </p>
          </div>

          {/* Bank Account Info */}
          <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
            <h3 className="font-semibold text-gray-800 text-lg mb-4">Transfer ke Rekening:</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Bank</span>
                <span className="font-semibold text-gray-800">Bank BCA</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Nomor Rekening</span>
                <span className="font-semibold text-gray-800">1234567890</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Atas Nama</span>
                <span className="font-semibold text-gray-800">Panitia Trail Run</span>
              </div>
            </div>
          </div>

          {/* Upload Proof */}
          <div className="space-y-3">
            <label className="block">
              <span className="text-gray-700 font-medium mb-2 block">Upload Bukti Transfer *</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Check file size (max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      alert('Ukuran file maksimal 5MB');
                      e.target.value = '';
                      return;
                    }
                    setPaymentProofFile(file);
                  }
                }}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-3 file:px-6
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-green-50 file:text-green-700
                  hover:file:bg-green-100
                  cursor-pointer"
              />
            </label>
            {paymentProofFile && (
              <p className="text-sm text-green-600">
                ✓ File terpilih: {paymentProofFile.name}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            onClick={handlePaymentProofUpload}
            disabled={isUploadingProof || !paymentProofFile}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-full font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isUploadingProof ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Mengupload...
              </span>
            ) : (
              'Kirim Bukti Pembayaran'
            )}
          </button>

          {/* ✅ Tombol Ubah Data Diri */}
          <button
            onClick={handleBackToEdit}
            disabled={isUploadingProof}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-full font-semibold hover:border-green-500 hover:bg-green-50 hover:text-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Ubah Data Diri
          </button>

        </div>
      </div>
    );
  }

  if (isSubmitted) {
    const registrationChannelLabel = formData.registrationChannel
      ? registrationChannelLabels[formData.registrationChannel]
      : "";
    const genderLabel = formData.gender ? genderLabels[formData.gender] : "";

    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-green-50 to-lime-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full transform transition-all duration-500 scale-100">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Pendaftaran Berhasil! 🎉</h2>
              <p className="text-lg text-gray-600">
                Terima kasih <span className="font-semibold text-emerald-600">{formData.name}</span> telah mendaftar!
              </p>
            </div>

            {/* BIB Number Highlight */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-center text-white">
              <p className="text-sm opacity-90 mb-2">Nomor BIB Anda</p>
              <p className="text-5xl md:text-6xl font-bold">
                {bibNumber}
              </p>
              <p className="text-xs opacity-75 mt-2">
                Simpan nomor ini untuk pengambilan race pack
              </p>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-lime-50 rounded-2xl p-6 text-left space-y-2">
              <h3 className="font-semibold text-gray-800">Detail Registrasi:</h3>
              <p><span className="font-medium">Nama Peserta:</span> {formData.name}</p>
              <p><span className="font-medium">Mendaftar untuk:</span> {registeringForLabels[formData.registeringFor]}</p>
              <p><span className="font-medium">Email:</span> {formData.email}</p>
              <p><span className="font-medium">Nomor Telepon:</span> {formData.phoneNumber}</p>
              <p><span className="font-medium">Jenis Kelamin:</span> {genderLabel}</p>
              <p><span className="font-medium">Nama BIB:</span> {formData.bibName}</p>
              <p><span className="font-medium">Golongan Darah:</span> {formData.bloodType}</p>
              <p><span className="font-medium">Ukuran Jersey:</span> {formData.shirtSize}</p>
              <p>
                <span className="font-medium">Kontak Darurat:</span> {formData.emergencyContactName} ({formData.emergencyContactPhone})
              </p>
              <p>
                <span className="font-medium">Terdaftar dari:</span> {registrationChannelLabel}
                {formData.registrationChannelName ? ` - ${formData.registrationChannelName}` : ""}
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800 whitespace-pre-line">
                Screenshoot Halaman Ini (Nomor BIB & data peserta), tunjukkan beserta bukti pembayaran kepada crew panitia di Pos Registrasi untuk Pengambilan Race Pack.
                {"\n\n"}
                Pengambilan Race Pack akan dilaksanakan pada tanggal 15 November 2025 di Venue Lapangan Desa Ranu Segaran pada pukul 10.00 - 21.00
                {"\n\n"}
                Informasi lebih lanjut hubungi Call Center di
                {"\n"}
                082233444460
              </p>
            </div>
            <button
              onClick={resetForm}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Daftarkan Peserta Lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage =
    stepVisuals.length > 0 ? ((currentStep + 1) / stepVisuals.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-emerald-800 to-teal-900">
      {/* Flyer Section */}
      <div className="w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/flyer.jpg" 
          alt="Trail Run Ranu Segaran 2025 Flyer" 
          className="w-full h-auto"
        />
      </div>

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative mx-auto max-w-5xl px-4 pt-6 pb-16 md:pt-8 md:pb-24 text-center text-white">
          <div className="inline-flex items-center justify-center mt-4 mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/logo.PNG" 
              alt="Trail Run Ranu Segaran Logo" 
              className="w-40 h-40 md:w-48 md:h-48 object-contain drop-shadow-2xl"
            />
          </div>
          <div className="space-y-4 mb-6">
            <h1 className="text-4xl md:text-6xl font-bold">
              TRAIL RUN
              <br className="md:hidden" />
              {" "}RANU SEGARAN
              <br className="md:hidden" />
              {" "}2025
            </h1>
            <p className="text-xl md:text-2xl font-light">
              Rasakan refreshment langsung
              <br className="md:hidden" />
              {" "}dari alam Kabupaten Probolinggo
            </p>
            <p className="text-sm md:text-base font-light">Part of &quot;Seven Lakes Festival&quot;</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm md:text-base">
            <span className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <Calendar className="w-5 h-5" />
              16 November 2025
            </span>
            <span className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <Clock className="w-5 h-5" />
              06:00 WIB
            </span>
            <span className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <MapPin className="w-5 h-5" />
              Ranu Segaran, Kab. Probolinggo
            </span>
          </div>
        </div>
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full opacity-20" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-400 rounded-full opacity-20" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-cyan-400 rounded-full opacity-20" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 space-y-12">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: Award,
              title: "Race Pack",
              description: "Jersey, Finisher Medali, Nomor BIB, Asuransi, Mineral Water & Snack, Kelapa Muda",
              gradient: "from-emerald-600 to-teal-500",
            },
            {
              icon: Heart,
              title: "Kesehatan & Keamanan",
              description: "Tim medis profesional, degan station, dan asuransi peserta",
              gradient: "from-green-600 to-lime-600",
            },
            {
              icon: Star,
              title: "Hadiah Podium",
              description: "Uang pembinaan untuk para finisher podium",
              gradient: "from-teal-600 to-cyan-600",
            },
          ].map(({ icon: Icon, title, description, gradient }) => (
            <div
              key={title}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-3">
                <span className={`p-3 bg-gradient-to-r ${gradient} rounded-xl`}>
                  <Icon className="w-6 h-6 text-white" />
                </span>
                <h3 className="font-bold text-gray-800">{title}</h3>
              </div>
              <p className="text-gray-600">{description}</p>
            </div>
          ))}
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Formulir Registrasi</h2>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="h-2 w-full rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                {stepVisuals.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = index === currentStep;
                  const isReached = index <= currentStep;

                  const circleClasses = isReached
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                    : "bg-slate-100 text-slate-400";

                  return (
                    <button
                      key={step.key}
                      type="button"
                      disabled={index > currentStep}
                      onClick={() => {
                        if (index <= currentStep) {
                          setCurrentStep(index);
                        }
                      }}
                      className="flex flex-1 flex-col items-center gap-1 sm:gap-2 text-center focus:outline-none min-w-0"
                    >
                      <span
                        className={`flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-full transition-all ${
                          circleClasses
                        } ${isActive ? "ring-2 sm:ring-4 ring-blue-100" : ""}`}
                      >
                        <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${isReached ? "text-white" : "text-slate-400"}`} />
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-semibold ${
                          isReached ? "text-slate-800" : "text-slate-400"
                        } truncate w-full px-1`}
                      >
                        {step.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6 text-left">
              <h3 className="text-2xl font-bold text-gray-800">{stepConfigs[currentStep].title}</h3>
              <p className="text-sm text-gray-500">{stepConfigs[currentStep].description}</p>
            </div>

            {currentStep === 0 && (
              <section className="space-y-4">
                <FieldText
                  type="email"
                  label="Masukkan Email *"
                  name="email"
                  value={formData.email}
                  placeholder="email@example.com"
                  leftIcon={<Mail className="w-5 h-5 text-gray-400" />}
                  error={errors.email}
                  onChange={handleChange}
                />
                <FieldText
                  type="tel"
                  label="Nomor Telepon *"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  placeholder="08123456789"
                  leftIcon={<Phone className="w-5 h-5 text-gray-400" />}
                  error={errors.phoneNumber}
                  onChange={(field, value) => handleChange(field, value.replace(/\D/g, ""))}
                />
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Mendaftar untuk *</h3>
                  <OptionButtonGroup
                    value={formData.registeringFor}
                    columns="grid-cols-1 md:grid-cols-2"
                    onSelect={(value) => handleChange("registeringFor", value as FormData["registeringFor"])}
                    options={[
                      { value: "self", label: "Dirimu sendiri" },
                      { value: "other", label: "Orang lain" },
                    ]}
                  />
                  {errors.registeringFor && <p className="text-sm text-red-500 mt-2">{errors.registeringFor}</p>}
                </div>
              </section>
            )}

            {currentStep === 1 && (
              <section className="space-y-6">
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <h3 className="text-xl font-bold text-gray-800">Informasi Peserta</h3>
                    <span className="text-sm text-gray-500">Lengkapi sesuai identitas resmi</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <FieldText
                        label="Nama Lengkap *"
                        name="name"
                        value={formData.name}
                        placeholder="Masukkan nama lengkap"
                        leftIcon={<User className="w-5 h-5 text-gray-400" />}
                        error={errors.name}
                        onChange={handleChange}
                      />
                      <p className="text-sm text-gray-500 mt-1">Sesuai data eKTP / Akta Kelahiran</p>
                    </div>
                    <FieldText
                      type="date"
                      label="Tanggal Lahir *"
                      name="birthDate"
                      value={formData.birthDate}
                      error={errors.birthDate}
                      onChange={handleChange}
                    />
                    <div>
                      <p className="text-gray-700 font-semibold mb-2">Jenis Kelamin *</p>
                      <OptionButtonGroup
                        value={formData.gender}
                        columns="grid-cols-2"
                        onSelect={(value) => handleChange("gender", value as FormData["gender"])}
                        options={[
                          { value: "male", label: "Pria" },
                          { value: "female", label: "Wanita" },
                        ]}
                      />
                      {errors.gender && <p className="text-sm text-red-500 mt-2">{errors.gender}</p>}
                    </div>
                    <FieldText
                      label="Nomor KTP *"
                      name="nationalId"
                      value={formData.nationalId}
                      placeholder="16 digit nomor KTP"
                      error={errors.nationalId}
                      maxLength={16}
                      onChange={(field, value) => handleChange(field, value.replace(/\D/g, ""))}
                    />
                    <div className="md:col-span-2">
                      <FieldTextarea
                        label="Alamat Saat Ini *"
                        name="address"
                        value={formData.address}
                        placeholder="Tuliskan alamat tempat tinggal Anda saat ini"
                        error={errors.address}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <FieldText
                        label="Nama di BIB Number *"
                        name="bibName"
                        value={formData.bibName}
                        placeholder="Maksimal 15 karakter"
                        error={errors.bibName}
                        maxLength={15}
                        onChange={(field, value) => handleChange(field, value.toUpperCase())}
                      />
                      <p className="text-sm text-gray-500 mt-1">Maksimal 15 karakter</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-xl font-bold text-gray-800">Terdaftar dari *</h3>
                  <OptionButtonGroup
                    value={formData.registrationChannel}
                    columns="grid-cols-1 md:grid-cols-2"
                    onSelect={(value) => handleChange("registrationChannel", value as FormData["registrationChannel"])}
                    options={[
                      { value: "community", label: "Komunitas" },
                      { value: "company", label: "Perusahaan" },
                      { value: "organization", label: "Organisasi" },
                      { value: "personal", label: "Personal" },
                    ]}
                  />
                  {errors.registrationChannel && <p className="text-sm text-red-500">{errors.registrationChannel}</p>}
                  {["community", "company", "organization"].includes(formData.registrationChannel) && (
                    <FieldText
                      label={registrationChannelNameLabels[formData.registrationChannel as keyof typeof registrationChannelNameLabels]}
                      name="registrationChannelName"
                      value={formData.registrationChannelName}
                      placeholder={
                        registrationChannelNamePlaceholders[formData.registrationChannel as keyof typeof registrationChannelNamePlaceholders]
                      }
                      error={errors.registrationChannelName}
                      onChange={handleChange}
                    />
                  )}
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-xl font-bold text-gray-800">Mengetahui informasi pendaftaran dari *</h3>
                  <OptionButtonGroup
                    value={formData.infoSource}
                    columns="grid-cols-1 md:grid-cols-3"
                    onSelect={(value) => handleChange("infoSource", value as FormData["infoSource"])}
                    options={[
                      { value: "friend", label: "Teman" },
                      { value: "social_media", label: "Sosial Media" },
                      { value: "billboard", label: "Papan Reklame" },
                    ]}
                  />
                  {errors.infoSource && <p className="text-sm text-red-500">{errors.infoSource}</p>}
                </div>
              </section>
            )}

            {currentStep === 2 && (
              <section className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800">Kuesioner</h3>
                <div>
                  <p className="text-gray-700 font-semibold mb-2">Golongan Darah *</p>
                  <OptionButtonGroup
                    value={formData.bloodType}
                    columns="grid-cols-2 md:grid-cols-4"
                    onSelect={(value) => handleChange("bloodType", value as FormData["bloodType"])}
                    options={[
                      { value: "A", label: "A" },
                      { value: "B", label: "B" },
                      { value: "O", label: "O" },
                      { value: "AB", label: "AB" },
                    ]}
                  />
                  {errors.bloodType && <p className="text-sm text-red-500 mt-2">{errors.bloodType}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <YesNoField
                    name="chronicCondition"
                    label="Apakah Anda memiliki penyakit kronis / kondisi medis lainnya?"
                    value={formData.chronicCondition}
                    error={errors.chronicCondition}
                    onChange={handleChange}
                  />
                  <YesNoField
                    name="underDoctorCare"
                    label="Apakah saat ini Anda sedang berada di bawah perawatan dokter?"
                    value={formData.underDoctorCare}
                    error={errors.underDoctorCare}
                    onChange={handleChange}
                  />
                  <YesNoField
                    name="requiresMedication"
                    label="Apakah Anda diharuskan minum obat untuk penyakit tersebut?"
                    value={formData.requiresMedication}
                    error={errors.requiresMedication}
                    onChange={handleChange}
                  />
                  <YesNoField
                    name="experiencedComplications"
                    label="Apakah Anda pernah mengalami komplikasi terkait penyakit saat berkegiatan fisik?"
                    value={formData.experiencedComplications}
                    error={errors.experiencedComplications}
                    onChange={handleChange}
                  />
                  <YesNoField
                    name="experiencedFainting"
                    label="Apakah anda pernah atau sering mengalami pingsan?"
                    value={formData.experiencedFainting}
                    error={errors.experiencedFainting}
                    onChange={handleChange}
                  />
                </div>

                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-xl font-bold text-gray-800">Kontak Darurat</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FieldText
                      label="Nama Kontak Darurat *"
                      name="emergencyContactName"
                      value={formData.emergencyContactName}
                      placeholder="Nama kontak darurat"
                      error={errors.emergencyContactName}
                      onChange={handleChange}
                    />
                    <FieldText
                      type="tel"
                      label="Nomor Telepon Kontak Darurat *"
                      name="emergencyContactPhone"
                      value={formData.emergencyContactPhone}
                      placeholder="0812xxxxxxx"
                      leftIcon={<Phone className="w-5 h-5 text-gray-400" />}
                      error={errors.emergencyContactPhone}
                      onChange={(field, value) => handleChange(field, value.replace(/\D/g, ""))}
                    />
                  </div>
                </div>
              </section>
            )}

            {currentStep === 3 && (
              <section className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800">Race Pack</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 text-gray-700 text-left">
                    Jersey dalam ukuran standar. Silakan dipilih sesuai tabel ukuran yang tertera.
                    Mohon diperhatikan bahwa penukaran ukuran tidak tersedia setelah pemilihan ini.
                  </div>
                  <div className="relative w-full h-64 md:h-72">
                    <Image
                      src="/size.jpg"
                      alt="Panduan ukuran jersey Fun Run"
                      fill
                      sizes="(min-width: 768px) 50vw, 100vw"
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
                <div>
                  <p className="text-gray-700 font-semibold mb-2">Pilih Ukuran Jersey *</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {shirtSizes.map((size) => {
                      const isActive = formData.shirtSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleChange("shirtSize", size)}
                          className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                            isActive
                              ? "bg-emerald-600 text-white shadow-lg scale-105"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                  {errors.shirtSize && <p className="text-sm text-red-500 mt-2">{errors.shirtSize}</p>}
                </div>
              </section>
            )}

            {currentStep === 4 && (
              <section className="space-y-6">
                <h3 className="text-xl font-bold text-gray-800">Syarat & Ketentuan</h3>
                
                <div className="rounded-2xl border border-gray-200 bg-white p-6 text-left space-y-2">
                  <h4 className="font-semibold text-gray-800">Ringkasan Pendaftaran</h4>
                  <p>
                    <span className="font-medium">Nama Lengkap:</span> {formData.name || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Nomor Telepon:</span> {formData.phoneNumber || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span> {formData.email || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Nama BIB:</span> {formData.bibName || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Ukuran Jersey:</span> {formData.shirtSize || "-"}
                  </p>
                </div>

                {/* Terms & Conditions */}
                <div className="border-t pt-6 space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Harap membaca ketentuan berikut dengan cermat sebelum lanjut ke langkah berikutnya. Dengan menyetujui secara elektronik, Anda mengakui bahwa Anda telah membaca dan memahami semua teks yang disajikan kepada Anda sebagai bagian dari proses pendaftaran.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.agreedToTerm1}
                        onChange={(e) => handleChange("agreedToTerm1", e.target.checked)}
                        className="flex-shrink-0 mt-0.5 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 leading-relaxed group-hover:text-gray-900">
                        Dengan mendaftar atau berpartisipasi dalam Trail Run Ranu Segaran 2025, peserta menyetujui semua Ketentuan dan kondisi yang berlaku
                      </span>
                    </label>
                    {errors.agreedToTerm1 && (
                      <p className="text-sm text-red-500 ml-8">{errors.agreedToTerm1}</p>
                    )}
                    
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.agreedToTerm2}
                        onChange={(e) => handleChange("agreedToTerm2", e.target.checked)}
                        className="flex-shrink-0 mt-0.5 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 leading-relaxed group-hover:text-gray-900">
                        Saya setuju bahwa panitia berhak menggunakan data dan dokumentasi peserta untuk keperluan pihak ketiga atau terkait
                      </span>
                    </label>
                    {errors.agreedToTerm2 && (
                      <p className="text-sm text-red-500 ml-8">{errors.agreedToTerm2}</p>
                    )}
                    
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={formData.agreedToTerm3}
                        onChange={(e) => handleChange("agreedToTerm3", e.target.checked)}
                        className="flex-shrink-0 mt-0.5 w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 leading-relaxed group-hover:text-gray-900">
                        Saya setuju bahwa biaya registrasi tidak dapat dikembalikan apabila saya batal berpartisipasi baik karena alasan pribadi maupun force majeure, seperti bencana alam atau wabah penyakit yang mengakibatkan acara tidak terselenggara
                      </span>
                    </label>
                    {errors.agreedToTerm3 && (
                      <p className="text-sm text-red-500 ml-8">{errors.agreedToTerm3}</p>
                    )}
                  </div>
                </div>
              </section>
            )}

            <div className={`flex items-center gap-4 pt-6 ${currentStep === 0 ? 'justify-end' : 'justify-between'}`}>
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex min-w-[140px] items-center justify-center rounded-full border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-600"
                >
                  Kembali
                </button>
              )}

              {currentStep < stepConfigs.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex min-w-[140px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                >
                  Selanjutnya
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className={`flex items-center justify-center gap-2 rounded-full px-4 sm:px-6 py-3 font-semibold text-white transition-all text-sm sm:text-base ${
                    isLoading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg hover:scale-105 hover:shadow-2xl"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Spinner />
                      <span className="whitespace-nowrap">Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline whitespace-nowrap">Selesaikan Pendaftaran</span>
                      <span className="inline sm:hidden whitespace-nowrap">Selesaikan</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-8 py-8 bg-black/50 text-white text-center">
        <p className="mb-2">© 2025 Trail Run Ranu Segaran</p>
        <p className="text-sm opacity-75">Part of Seven Lakes Festival Kabupaten Probolinggo</p>
      </footer>
    </div>
  );
}

type FieldTextProps = {
  label: string;
  name: keyof FormData;
  value: string;
  error?: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  leftIcon?: React.ReactNode;
  maxLength?: number;
  onChange: (name: keyof FormData, value: string) => void;
};

function FieldText({ label, name, value, error, placeholder, type = "text", leftIcon, maxLength, onChange }: FieldTextProps) {
  return (
    <div>
      <label className="block text-gray-700 font-semibold mb-2">{label}</label>
      <div className="relative">
        {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2">{leftIcon}</span>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full ${leftIcon ? "pl-10" : "pl-3"} pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            error ? "border-red-500" : "border-gray-300"
          }`}
        />
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}

type FieldTextareaProps = {
  label: string;
  name: keyof FormData;
  value: string;
  error?: string;
  placeholder?: string;
  rows?: number;
  onChange: (name: keyof FormData, value: string) => void;
};

function FieldTextarea({ label, name, value, error, placeholder, rows = 3, onChange }: FieldTextareaProps) {
  return (
    <div>
      <label className="block text-gray-700 font-semibold mb-2">{label}</label>
      <textarea
        name={name}
        value={value}
        onChange={(event) => onChange(name, event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-3 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          error ? "border-red-500" : "border-gray-300"
        }`}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}

type OptionButton = {
  value: string;
  label: string;
  description?: string;
};

type OptionButtonGroupProps = {
  value: string;
  options: OptionButton[];
  onSelect: (value: string) => void;
  columns?: string;
};

function OptionButtonGroup({ value, options, onSelect, columns = "grid-cols-1 md:grid-cols-2" }: OptionButtonGroupProps) {
  return (
    <div className={`grid gap-3 ${columns}`}>
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onSelect(option.value)}
            className={`relative overflow-hidden rounded-2xl p-4 text-left transition-all ${
              isActive
                ? "ring-4 ring-green-500 bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg"
                : "bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700"
            }`}
          >
            {isActive && <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-white" />}
            <span className="block font-semibold">{option.label}</span>
            {option.description && (
              <span className={`mt-1 text-sm ${isActive ? "text-white/80" : "text-gray-500"}`}>{option.description}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

type YesNoFieldName = "chronicCondition" | "underDoctorCare" | "requiresMedication" | "experiencedComplications" | "experiencedFainting";

type YesNoFieldProps = {
  name: YesNoFieldName;
  label: string;
  value: FormData[YesNoFieldName];
  error?: string;
  onChange: (name: keyof FormData, value: FormData[keyof FormData]) => void;
};

function YesNoField({ name, label, value, error, onChange }: YesNoFieldProps) {
  return (
    <div>
      <p className="text-gray-700 font-semibold mb-2">{label}</p>
      <OptionButtonGroup
        value={value}
        columns="grid-cols-2"
        onSelect={(selected) => onChange(name, selected as FormData[typeof name])}
        options={[
          { value: "yes", label: "Ya" },
          { value: "no", label: "Tidak" },
        ]}
      />
      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" role="presentation">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
