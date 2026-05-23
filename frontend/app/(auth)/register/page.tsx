"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Mail,
  Lock,
  User,
  Phone,
  GraduationCap,
  Eye,
  EyeOff,
  ArrowRight,
  Building2,
  Calendar,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/lib/auth/AuthContext";
import { apiClient } from "@/lib/api/client";

const getNestedError = (errors: any, path: string): string | undefined => {
  const parts = path.split(".");
  let current = errors;
  for (const part of parts) {
    if (current && typeof current === "object") {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === "string" ? current : undefined;
};

const getNestedTouched = (touched: any, path: string): boolean => {
  const parts = path.split(".");
  let current = touched;
  for (const part of parts) {
    if (current && typeof current === "object") {
      current = current[part];
    } else {
      return false;
    }
  }
  return Boolean(current);
};

const registerSchema = Yup.object().shape({
  name: Yup.string()
    .min(5, "Name must be at least 5 characters")
    .max(100, "Name is too long")
    .required("Full name is required")
    .matches(/^[a-zA-Z\s]*$/, "Name can only contain letters and spaces"),

  email: Yup.string()
    .email("Invalid email address format")
    .required("Email address is required")
    .matches(
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Please enter a valid email address",
    ),

  phoneNumber: Yup.string()
    .required("Phone number is required")
    .matches(
      /^[0-9+\-\s()]{10,15}$/,
      "Please enter a valid phone number (10-15 digits)",
    ),

  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .max(50, "Password is too long")
    .required("Password is required")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),

  entryMode: Yup.string()
    .oneOf(["UTME", "DIRECT_ENTRY"], "Please select a valid entry mode")
    .required("Entry mode is required"),
});

// Type for form values
interface RegisterFormValues {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  entryMode: "UTME" | "DIRECT_ENTRY";
  agreeToTerms: boolean;
  program: "BSC" | "MSC" | "PHD" | "DIPLOMA" | "";
  firstChoiceId: string;
  departmentId: string;
}
interface PublicCourseDropdownItem {
  id: string;
  title: string;
  code: string;
  program: "BSC" | "MSC" | "PHD" | "DIPLOMA";
}

interface PublicProgram {
  id: string;
  title: string;
  program: string;
}
interface PublicDepartment {
  id: string;
  name: string;
  code: string;
  courses: PublicProgram[];
}

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [departmentsData, setDepartmentsData] = useState<PublicDepartment[]>(
    [],
  );
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");

  const router = useRouter();

  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      entryMode: "UTME",
      agreeToTerms: false,
      program: "",
      departmentId: "",
      firstChoiceId: "",
    },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Prepare data matching Applicant model
        const applicantData = {
          name: values.name,
          email: values.email,
          phoneNumber: values.phoneNumber,
          password: values.password,
          entryMode: values.entryMode,
          program: values.program,
          firstChoiceId: values.firstChoiceId,
        };

        await register(applicantData);
        toast.success("Registration successful! Please login to continue.");
        localStorage.setItem("applicantEntryMode", values.entryMode);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } catch (error: any) {
        toast.error(error.message || "Registration failed. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (formik.values.program) {
      apiClient.getPublicDepartments(formik.values.program).then((res) => {
        if (res.success) setDepartmentsData(res.data);
      });
    } else {
      setDepartmentsData([]);
    }
    setSelectedDepartmentId("");
    formik.setFieldValue("firstChoiceId", "");
  }, [formik.values.program]);
  // 1. Fetch departments when the Degree level (BSC/MSC/PHD) changes

  const activeDepartment = departmentsData.find(
    (d) => d.id === selectedDepartmentId,
  );
  const availablePrograms = activeDepartment ? activeDepartment.courses : [];

  const nextStep = () => {
    // Validate first step fields
    const errors = formik.errors;
    const touched = formik.touched;

    if (currentStep === 1) {
      if (
        !formik.values.name ||
        !formik.values.email ||
        !formik.values.phoneNumber
      ) {
        toast.error("Please fill in all required fields");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formik.values.password || !formik.values.confirmPassword) {
        toast.error("Please set your password");
        return;
      }
      if (formik.values.password !== formik.values.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      setCurrentStep(3);
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 py-12! px-4! sm:px-6! lg:px-8!">
      <div className="max-w-4xl mx-auto! animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-8!">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4!">
            <GraduationCap className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-white">
            Applicant Registration
          </h1>
          <p className="text-white/80 mt-2!">
            Join our academic community and begin your journey
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8!">
          <div className="flex justify-center items-center gap-4!">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= step
                      ? "bg-white text-indigo-600 shadow-lg"
                      : "bg-white/30 text-white/60"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-0.5 mx-2 transition-all ${
                      currentStep > step ? "bg-white" : "bg-white/30"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-20 mt-2 text-sm text-white/70">
            <span>Personal Info</span>
            <span>Security</span>
            <span>Entry Details</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 md:p-8 lg:p-10">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-slideIn">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Personal Information
                </h2>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="text"
                      {...formik.getFieldProps("name")}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all outline-none ${
                        formik.touched.name && formik.errors.name
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-600"
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {formik.touched.name && formik.errors.name && (
                    <p className="mt-1 text-sm text-red-500">
                      {formik.errors.name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="email"
                      {...formik.getFieldProps("email")}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all outline-none ${
                        formik.touched.email && formik.errors.email
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-600"
                      }`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {formik.touched.email && formik.errors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type="tel"
                      {...formik.getFieldProps("phoneNumber")}
                      className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all outline-none ${
                        formik.touched.phoneNumber && formik.errors.phoneNumber
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-600"
                      }`}
                      placeholder="+234 801 234 5678"
                    />
                  </div>
                  {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-500">
                      {formik.errors.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Security */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-slideIn">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Account Security
                </h2>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type={showPassword ? "text" : "password"}
                      {...formik.getFieldProps("password")}
                      className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all outline-none ${
                        formik.touched.password && formik.errors.password
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-600"
                      }`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {formik.touched.password && formik.errors.password && (
                    <p className="mt-1 text-sm text-red-500">
                      {formik.errors.password}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-500">
                    Must contain at least 8 characters, one uppercase, one
                    lowercase, and one number
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      {...formik.getFieldProps("confirmPassword")}
                      className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all outline-none ${
                        formik.touched.confirmPassword &&
                        formik.errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-200 dark:border-gray-600"
                      }`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {formik.touched.confirmPassword &&
                    formik.errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">
                        {formik.errors.confirmPassword}
                      </p>
                    )}
                </div>
              </div>
            )}

            {/* Step 3: Entry Mode Details */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-slideIn">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  Mode Selection
                </h2>

                {/* Entry Mode Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Entry Mode <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => formik.setFieldValue("entryMode", "UTME")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formik.values.entryMode === "UTME"
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-indigo-300"
                      }`}
                    >
                      <GraduationCap className="w-8 h-8 mx-auto mb-2 text-indigo-500" />
                      <div className="font-semibold text-gray-900 dark:text-white">
                        UTME
                      </div>
                      <div className="text-xs text-gray-500">
                        Unified Tertiary Matriculation Examination
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        formik.setFieldValue("entryMode", "DIRECT_ENTRY")
                      }
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formik.values.entryMode === "DIRECT_ENTRY"
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                          : "border-gray-200 dark:border-gray-600 hover:border-indigo-300"
                      }`}
                    >
                      <Building2 className="w-8 h-8 mx-auto mb-2 text-indigo-500" />
                      <div className="font-semibold text-gray-900 dark:text-white">
                        Direct Entry
                      </div>
                      <div className="text-xs text-gray-500">
                        For graduates and diploma holders
                      </div>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Degree Program Level
                  </label>
                  <select
                    name="program"
                    value={formik.values.program}
                    onChange={formik.handleChange}
                    className="w-full border p-2 rounded text-sm mt-1"
                  >
                    <option value="">-- Choose Track --</option>
                    <option value="BSC">Undergraduate (B.Sc.)</option>
                    <option value="MSC">Masters (M.Sc.)</option>
                    <option value="PHD">Doctorate (Ph.D.)</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Academic Department
                  </label>
                  <select
                    value={selectedDepartmentId}
                    onChange={(e) => {
                      setSelectedDepartmentId(e.target.value);
                      formik.setFieldValue("firstChoiceId", ""); 
                    }}
                    disabled={!formik.values.program}
                    className="w-full border p-2 rounded text-sm mt-1 disabled:bg-gray-100"
                  >
                    <option value="">-- Choose Department --</option>
                    {departmentsData.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        [{dept.code}] {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Course of Study Choice
                  </label>
                  <select
                    name="firstChoiceId"
                    value={formik.values.firstChoiceId}
                    onChange={formik.handleChange}
                    disabled={!selectedDepartmentId}
                    className="w-full border p-2 rounded text-sm mt-1 disabled:bg-gray-100"
                  >
                    <option value="">-- Select Specific Major Focus --</option>
                    {availablePrograms.map((prog) => (
                      <option key={prog.id} value={prog.id}>
                        {prog.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Terms Agreement */}
                <div className="flex items-center gap-3 pt-4">
                  <input
                    type="checkbox"
                    id="terms"
                    {...formik.getFieldProps("agreeToTerms")}
                    className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      className="text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {getNestedTouched(formik.touched, "agreeToTerms") &&
                  getNestedError(formik.errors, "agreeToTerms") && (
                    <p className="text-sm text-red-500">
                      {getNestedError(formik.errors, "agreeToTerms")}
                    </p>
                  )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                >
                  Back
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-indigo-600 to-indigo-500 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-indigo-600 transition-all"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={
                    formik.isSubmitting ||
                    isLoading ||
                    !formik.values.agreeToTerms
                  }
                  className="flex-1 px-6 py-3 bg-linear-to-r from-indigo-600 to-indigo-500 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {formik.isSubmitting || isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
