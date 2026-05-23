"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ApplicantPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/applicant/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-96">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  );
}
