import { Calendar, MapPin, Phone } from "lucide-react";

/**
 * FormClosureNotice Component
 * 
 * Displays a professional closure notice in place of the registration form.
 * Designed with glass-morphism and green-emerald theme to match the event design.
 * Shows contact information and important event details.
 * No action buttons - information only.
 */
export default function FormClosureNotice() {
  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12">
      {/* Closure Notice Header */}
      <div className="text-center space-y-6 mb-8">
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

        {/* Race Pack Information */}
        <div className="bg-gradient-to-r from-emerald-50 to-lime-50 rounded-2xl p-6 border border-emerald-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
            Pengambilan Race Pack
          </h3>
          <div className="space-y-4">
            {/* Kota Probolinggo Location */}
            <div className="bg-white rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-2 text-center">Area Kota Probolinggo</h4>
              <div className="text-gray-700 text-sm space-y-1">
                <p className="text-center font-medium">Jumat, 14 November 2025</p>
                <p className="text-center">13.00 - 18.00</p>
                <p className="text-center font-medium mt-2">Kantor Jets Organizer</p>
                <p className="text-center text-xs">
                  Jl Mastrip Ruko Grand Pandawa No 5, Kota Probolinggo<br />
                  (Depan Gang Salak)
                </p>
              </div>
            </div>
            
            {/* Venue Location */}
            <div className="bg-white rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-2 text-center">Area Venue</h4>
              <div className="text-gray-700 text-sm space-y-1">
                <p className="text-center font-medium">Sabtu, 15 November 2025</p>
                <p className="text-center">13.00 - 18.00</p>
                <p className="text-center font-medium mt-2">Venue Pendopo Ranu Segaran</p>
                <p className="text-center text-xs">
                  Kabupaten Probolinggo
                </p>
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
      </div>
    </div>
  );
}
