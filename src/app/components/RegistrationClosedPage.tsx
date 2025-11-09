import { Calendar, Clock, MapPin, Phone } from "lucide-react";

/**
 * RegistrationClosedPage Component
 * 
 * Displays when registration is closed for new users.
 * Shows event information and contact details.
 * No action buttons - information only.
 */
export default function RegistrationClosedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-100 via-green-50 to-lime-100">
      {/* Flyer Section */}
      <div className="w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/flyer.jpg" 
          alt="Trail Run Ranu Segaran 2025 Flyer" 
          className="w-full h-auto"
        />
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-green-700 via-emerald-800 to-teal-900">
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

      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Closure Notice */}
          <div className="text-center space-y-6 mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-100 rounded-full mb-4">
              <svg 
                className="w-12 h-12 text-amber-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                Pendaftaran Telah Ditutup
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Terima kasih atas minat Anda untuk berpartisipasi dalam Trail Run Ranu Segaran 2025. 
                Saat ini pendaftaran telah ditutup.
              </p>
            </div>
          </div>

          {/* Event Information */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Informasi Acara
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Tanggal & Waktu</p>
                    <p className="text-gray-600">16 November 2025, 06:00 WIB</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Lokasi</p>
                    <p className="text-gray-600">Ranu Segaran, Kabupaten Probolinggo, Jawa Timur</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Hubungi Kami
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Untuk informasi lebih lanjut, silakan hubungi kami melalui:
              </p>
              <div className="space-y-3 max-w-md mx-auto">
                <div className="flex items-center gap-3 bg-white rounded-xl p-4">
                  <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-gray-800">Call Center</p>
                    <a 
                      href="tel:082233444460" 
                      className="text-green-600 hover:text-green-700 transition-colors"
                    >
                      082233444460
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Race Pack Information */}
            <div className="bg-gradient-to-r from-emerald-50 to-lime-50 rounded-2xl p-6 border border-emerald-100">
              <h3 className="text-xl font-bold text-gray-800 mb-3 text-center">
                Pengambilan Race Pack
              </h3>
              <div className="space-y-2 text-gray-700">
                <p className="text-center">
                  <span className="font-semibold">Tanggal:</span> 15 November 2025
                </p>
                <p className="text-center">
                  <span className="font-semibold">Waktu:</span> 11:00 - 21:00 WIB
                </p>
                <p className="text-center">
                  <span className="font-semibold">Lokasi:</span> Venue Lapangan Ranu Segaran
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 bg-black/50 text-white text-center">
        <p className="mb-2">© 2025 Trail Run Probolinggo - Ranu Segaran</p>
        <p className="text-sm opacity-75">Part of Seven Lakes Festival Kabupaten Probolinggo</p>
      </footer>
    </div>
  );
}
