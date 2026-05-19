"use client";

import Link from "next/link";
import {
  GraduationCap,
  Users,
  BookOpen,
  Award,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { useRouter } from "next/navigation";
import { date } from "yup";

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: GraduationCap,
      title: "Student Portal",
      description:
        "Access courses, grades, assignments, and academic resources",
    },
    {
      icon: BookOpen,
      title: "Course Management",
      description: "Browse and register for courses, track your progress",
    },
    {
      icon: Users,
      title: "Faculty Dashboard",
      description:
        "Manage courses, upload grades, and communicate with students",
    },
    {
      icon: Award,
      title: "Academic Excellence",
      description: "Track your achievements and academic performance",
    },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="w-full min-h-screen  bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex flex-col">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 px-2! bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-full mx-auto! px-4! sm:px-6! lg:px-8!">
          <div className="flex justify-between items-center lg:justify-between h-16 min-h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 shrink-0">
              <GraduationCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <span className="text-lg sm:text-xl font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                UniSystem
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8!">
              <Link
                href="#features"
                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition text-sm"
              >
                Features
              </Link>
              <ThemeToggle />
              <button
                onClick={() => router.push("/auth/login")}
                className="px-4! py-2! text-indigo-600 dark:text-indigo-400 border border-indigo-600 dark:border-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950 transition text-sm"
              >
                Sign In
              </button>
              <Link
                href="/register"
                className="px-4! py-2! bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md hover:shadow-lg text-sm"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2! rounded-md text-gray-700 dark:text-gray-300"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 animate-fadein">
            <div className="px-4! py-4! space-y-3!">
              <Link
                href="#features"
                className="block py-2! text-gray-700 dark:text-gray-300 hover:text-indigo-600"
              >
                Features
              </Link>
              <div className="flex items-center justify-between py-2!">
                <span className="text-gray-700 dark:text-gray-300">Theme</span>
                <ThemeToggle />
              </div>
              <div className="pt-4! space-y-3!">
                <Link
                  href="/login"
                  className="block w-full text-center px-4! py-2! dark:hover:text-white/50   dark:hover:border-indigo-800  text-indigo-600 border border-indigo-600 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="  dark:hover:text-black    dark:hover:bg-indigo-800 block w-full text-center px-4! py-2! bg-indigo-600 text-white rounded-lg"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section
        onClick={() => {
          setMobileMenuOpen(false);
        }}
        className="flex-1 flex items-center justify-center py-20! px-4! sm:px-6! lg:px-8!"
      >
        <div className="max-w-4xl w-full text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6! leading-tight">
            Welcome to the Future of Education
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-200 mb-10! leading-relaxed">
            A comprehensive university management system designed for students,
            faculty, and administrators to streamline academic processes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4! justify-center">
            <Link
              href="/register"
              className="px-8! py-3! bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 font-medium"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="px-8! py-3! border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-gray-900 dark:text-white font-medium"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className=" my-5! py-10! px-4! sm:px-6! lg:px-8! bg-gray-50 dark:bg-gray-800/50"
      >
        <div className="max-w-full mx-auto!">
          <div className="text-center mb-10!">
            <h2 className=" text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4!">
              Everything you need to manage your academic journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8!">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-8! shadow-md  dark:hover:drop-shadow-white/15  hover:shadow-lg transition-shadow hover:-translate-y-1 flex flex-col"
                >
                  <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className=" bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800  py-1! md:py-2! lg:px-8! px-1.5! md:px-4!">
        <div className="max-w-full mx-auto! text-center text-gray-600 dark:text-gray-400">
          <p className="text-sm tracking-tighter md:text-lg md:tracking-normal">
            &copy; 2026 University Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
