"use client";

import Link from "next/link";
import { Search, Home, School, Users, Menu } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-300 shadow-sm shadow-black/5">
        <div className="flex justify-between items-center px-16 py-4 max-w-5xl mx-auto w-full">
          <span className="font-headline-md text-2xl text-black tracking-tight font-semibold">
            St. Jude's Academy
          </span>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-black transition-colors uppercase tracking-wide"
            >
              Academics
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-black transition-colors uppercase tracking-wide"
            >
              Admissions
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-black transition-colors uppercase tracking-wide"
            >
              Campus Life
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-black transition-colors uppercase tracking-wide"
            >
              Faculty
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-black transition-colors uppercase tracking-wide"
            >
              Alumni
            </a>
            <button className="ml-4 px-6 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-900 transition-all active:scale-95 uppercase tracking-wide font-semibold">
              Apply Now
            </button>
          </div>
          <button className="md:hidden text-black">
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col items-center justify-center pt-24 px-5 md:px-16 bg-white relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
          <img
            alt="A grand, high-ceilinged academic library with towering bookshelves filled with leather-bound books, ornate wooden ladders, and soft sunlight filtering through tall arched windows."
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAak8J-Knf7PmnRhgDDe0EVmS5J5__-gg-CHWqcaP43eWWF2JaJgXfPg648Ra3vhn9v9ZliN6GOdq226eamcTrNLty4JzRURK2e_VL5pKxXzzR5xm7m1tACgmV4SYzHmRcNec3hICKDivU3HAym9wj_sFwXG2kOF8nXUQCazXNnULC71NLb0b2f3A45GvifA4FrCj4nFK0phNook6g9AS17QQaS8k3jOBQKFT_IAzZTLoTsTftK7-GDIfFU1__RotyggYtCGGGZ24Ad"
            className="w-full h-full object-cover grayscale blur-sm"
          />
        </div>

        <div className="relative z-10 w-full max-w-4xl text-center">
          {/* 404 Heading */}
          <div className="mb-8">
            <h1 className="text-7xl md:text-8xl text-black mb-4 font-bold">
              404
            </h1>
            <div className="w-24 h-1 bg-yellow-600 mx-auto mb-8"></div>
            <p className="text-2xl text-gray-600 max-w-2xl mx-auto italic mb-4">
              "Even the most diligent scholars lose their way sometimes."
            </p>
            <p className="text-lg text-gray-500">
              The page you are looking for has been moved or archived in our
              great hall.
            </p>
          </div>

          {/* Secret Doors / Book Spines Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 mb-32">
            {/* Home Door */}
            <Link
              href="/"
              className="group flex flex-col items-center transition-all duration-500"
            >
              <div
                className="w-full aspect-[2/3] bg-white border border-gray-300 p-6 flex flex-col justify-between shadow-sm group-hover:shadow-xl group-hover:border-yellow-600 transition-all duration-300 group-hover:scale-105 rounded-lg"
                style={{
                  backgroundImage:
                    "url(https://lh3.googleusercontent.com/aida-public/AB6AXuDrAAk_SBQd8eIL3-Qso-_2H65ps3cdh3Mj6MsZY-fraUeOEQJ5T6HoIgJLwnLnMlYIRmOw7CNY1BIQVgxUCWPgFvF6WAGX2Xf-y0vrD5UNnbOqhNP4iZSUa7jaiLp9zKUpS-kBpmoTQm-mWX_WwSKwlXyv959ksCqDL1PRedSCfMsJmcC_9N3Mh2IzVc75IJV1Xrpud_MqBY6ckm12MSxdiZOdlgnjbFQy7GcthF_ZeTyPvkmRkcckqptNG20ydXObAJtVPw6zmM9T)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="border-b border-gray-300 pb-4">
                  <span className="text-xs uppercase tracking-widest text-yellow-600 font-semibold">
                    Volume I
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center py-8">
                  <Home size={48} className="text-black" />
                </div>
                <div className="text-center">
                  <span className="text-2xl text-black group-hover:text-yellow-600 transition-colors font-semibold">
                    The Hall
                  </span>
                  <p className="text-xs uppercase tracking-widest text-gray-500 mt-2 font-semibold">
                    Return Home
                  </p>
                </div>
              </div>
            </Link>

            {/* Admissions Door */}
            <Link
              href="#"
              className="group flex flex-col items-center transition-all duration-500 md:-translate-y-8"
            >
              <div className="w-full aspect-[2/3] bg-black text-white border border-black p-6 flex flex-col justify-between shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-105 rounded-lg">
                <div className="border-b border-white/20 pb-4">
                  <span className="text-xs uppercase tracking-widest text-yellow-400 font-semibold">
                    Volume II
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center py-8">
                  <School size={48} className="text-yellow-400" />
                </div>
                <div className="text-center">
                  <span className="text-2xl text-white font-semibold">
                    Admissions
                  </span>
                  <p className="text-xs uppercase tracking-widest text-gray-300 mt-2 font-semibold">
                    Join the Academy
                  </p>
                </div>
              </div>
            </Link>

            {/* Campus Life Door */}
            <Link
              href="#"
              className="group flex flex-col items-center transition-all duration-500"
            >
              <div
                className="w-full aspect-[2/3] bg-white border border-gray-300 p-6 flex flex-col justify-between shadow-sm group-hover:shadow-xl group-hover:border-yellow-600 transition-all duration-300 group-hover:scale-105 rounded-lg"
                style={{
                  backgroundImage:
                    "url(https://lh3.googleusercontent.com/aida-public/AB6AXuDrAAk_SBQd8eIL3-Qso-_2H65ps3cdh3Mj6MsZY-fraUeOEQJ5T6HoIgJLwnLnMlYIRmOw7CNY1BIQVgxUCWPgFvF6WAGX2Xf-y0vrD5UNnbOqhNP4iZSUa7jaiLp9zKUpS-kBpmoTQm-mWX_WwSKwlXyv959ksCqDL1PRedSCfMsJmcC_9N3Mh2IzVc75IJV1Xrpud_MqBY6ckm12MSxdiZOdlgnjbFQy7GcthF_ZeTyPvkmRkcckqptNG20ydXObAJtVPw6zmM9T)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="border-b border-gray-300 pb-4">
                  <span className="text-xs uppercase tracking-widest text-yellow-600 font-semibold">
                    Volume III
                  </span>
                </div>
                <div className="flex-1 flex items-center justify-center py-8">
                  <Users size={48} className="text-black" />
                </div>
                <div className="text-center">
                  <span className="text-2xl text-black group-hover:text-yellow-600 transition-colors font-semibold">
                    Campus Life
                  </span>
                  <p className="text-xs uppercase tracking-widest text-gray-500 mt-2 font-semibold">
                    Explore Our World
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Search Bar Action */}
          <div className="max-w-md mx-auto mb-12">
            <div className="relative">
              <input
                className="w-full bg-transparent border-b border-gray-300 py-4 px-2 focus:outline-none focus:border-yellow-600 transition-all text-center placeholder-gray-400"
                placeholder="Search the archives..."
                type="text"
              />
              <button className="absolute right-0 top-1/2 -translate-y-1/2 text-black hover:text-yellow-600 transition-colors">
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="px-12 py-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition-all active:scale-95 shadow-md uppercase tracking-wide text-sm"
            >
              Return to the Hall
            </Link>
            <button className="px-12 py-4 border border-black text-black font-semibold rounded-lg hover:bg-gray-100 transition-all active:scale-95 uppercase tracking-wide text-sm">
              Contact Registrar
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-16 py-32 max-w-5xl mx-auto w-full">
          <div className="md:col-span-1">
            <span className="text-2xl text-black mb-4 block font-semibold">
              St. Jude's
            </span>
            <p className="text-gray-600 max-w-xs">
              Excellence in Education Since 1892. Nurturing the leaders of
              tomorrow with tradition and innovation.
            </p>
          </div>
          <div className="md:col-span-1">
            <h4 className="text-black mb-6 text-xs uppercase tracking-widest font-semibold">
              Resources
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-black underline decoration-yellow-600"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-black underline decoration-yellow-600"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-black underline decoration-yellow-600"
                >
                  Accreditation
                </a>
              </li>
            </ul>
          </div>
          <div className="md:col-span-1">
            <h4 className="text-black mb-6 text-xs uppercase tracking-widest font-semibold">
              Connect
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-black underline decoration-yellow-600"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-black underline decoration-yellow-600"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-black underline decoration-yellow-600"
                >
                  Campus Map
                </a>
              </li>
            </ul>
          </div>
          <div className="md:col-span-1">
            <h4 className="text-black mb-6 text-xs uppercase tracking-widest font-semibold">
              Newsletter
            </h4>
            <div className="relative">
              <input
                className="w-full bg-transparent border-b border-gray-400 py-2 focus:outline-none focus:border-yellow-600 placeholder-gray-400"
                placeholder="Academic Email"
                type="email"
              />
              <button className="absolute right-0 top-1/2 -translate-y-1/2">
                <Menu size={20} className="text-black" />
              </button>
            </div>
          </div>
        </div>
        <div className="px-16 py-8 border-t border-gray-200 text-center">
          <p className="text-gray-600">
            © 2024 St. Jude's Academy. Excellence in Education Since 1892.
          </p>
        </div>
      </footer>
    </div>
  );
}
