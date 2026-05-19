"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

// Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema: LoginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await login(values.email, values.password);
        toast.success("Login successful!");
        if (values.rememberMe) {
          localStorage.setItem("rememberEmail", values.email);
        } else {
          localStorage.removeItem("rememberEmail");
        }
      } catch (error: any) {
        toast.error(error.message || "Login failed");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const demoAccounts = [
    {
      role: "Student",
      email: "student@university.edu",
      password: "student123",
      icon: "🎓",
    },
    {
      role: "Lecturer",
      email: "lecturer@university.edu",
      password: "lecturer123",
      icon: "👨‍🏫",
    },
    {
      role: "Department Head",
      email: "depthead@university.edu",
      password: "depthead123",
      icon: "📚",
    },
    {
      role: "Admin",
      email: "admin@university.edu",
      password: "admin123",
      icon: "⚙️",
    },
  ];

  const fillDemo = (email: string, password: string) => {
    formik.setValues({
      email,
      password,
      rememberMe: formik.values.rememberMe,
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-5!">
      <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-8! items-center">
        {/* Left Side - Brand Section */}
        <div className="hidden lg:block text-white space-y-6!">
          <div className="flex items-center gap-3 mb-8!">
            <div className="bg-white/10 backdrop-blur-sm p-3! rounded-2xl">
              <GraduationCap className="w-10 h-10" />
            </div>
            <span className="text-2xl font-bold">UniSystem</span>
          </div>

          <h1 className="text-5xl font-bold leading-tight">
            Welcome back to
            <br />
            <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Academic Excellence
            </span>
          </h1>

          <p className="text-lg text-white/70 leading-relaxed">
            Access your courses, track your progress, and connect with your
            academic community all in one place.
          </p>

          <div className="flex gap-4! pt-8!">
            <div className="flex -space-x-2!">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full bg-linear-to-br from-purple-400 to-pink-400 border-2 border-slate-900 flex items-center justify-center text-sm font-bold"
                >
                  👨‍🎓
                </div>
              ))}
            </div>
            <div className="text-white/60 text-sm">
              <span className="text-white font-semibold">2,500+</span> students
              <br />
              already enrolled
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6! md:p-10!">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8!">
            <div className="bg-linear-to-tr from-purple-600 to-pink-600 p-3! rounded-2xl">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="text-center mb-8!">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2!">
              Sign In
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-6!">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2!"
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />

                {/* subtle divider */}
                <div className="absolute left-10 top-1/2 -translate-y-1/2 h-5 w-px! bg-gray-300 dark:bg-gray-600" />

                <input
                  id="email"
                  type="email"
                  {...formik.getFieldProps("email")}
                  className={`w-full pl-14! pr-4! py-3.5! border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent  dark:focus-within:text-white  dark:bg-gray-700 dark:text-white transition-all outline-none  text-black ${
                    formik.touched.email && formik.errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <div className="mt-2! text-sm text-red-500 flex items-center gap-1!">
                  <span className="text-xs">⚠️</span>
                  {formik.errors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2!"
              >
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-2 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-purple-500 transition-colors" />

                <div className="absolute left-10 top-1/2 -translate-y-1/2 h-5 w-px! bg-gray-300 dark:bg-gray-600" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...formik.getFieldProps("password")}
                  className={`w-full pl-14! pr-12! py-3.5! border-2 rounded-xl dark:focus-within:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all outline-none text-black  ${
                    formik.touched.password && formik.errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                  placeholder="••••••••"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="mt-2 text-sm text-red-500 flex items-center gap-1">
                  <span className="text-xs">⚠️</span>
                  {formik.errors.password}
                </div>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  {...formik.getFieldProps("rememberMe")}
                  className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition">
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || formik.isSubmitting}
              className="w-full bg-linear-to-r from-purple-600 to-pink-600 text-white py-3.5! rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2! shadow-lg shadow-purple-500/25"
            >
              {isLoading || formik.isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="hidden md:block mt-8!">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4! bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Demo Accounts
                </span>
              </div>
            </div>

            <div className="hidden md:grid grid-cols-2 gap-3! mt-6!">
              {demoAccounts.map((account, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => fillDemo(account.email, account.password)}
                  className="group flex items-center gap-3! px-4! py-2.5! bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 text-left"
                >
                  <span className="text-xl">{account.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {account.role}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-purple-600 transition">
                      Click to login
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Register Link */}
          <div className="mt-8! text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
