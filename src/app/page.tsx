"use client";

import { useState, useEffect } from "react";
import AuthForms from "@/components/auth/AuthForms";
import { useAppSelector } from "@/redux/hooks";
import { useRouter } from "next/navigation";

export default function Home() {
  const { user, isAuthenticated, loading } = useAppSelector(
    (state) => state.auth
  );
  const router = useRouter();

  // Prevent initial hydration mismatch
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Redirect to stocks page if already authenticated
    if (isAuthenticated && !loading) {
      router.push("/stocks");
    }
  }, [isAuthenticated, loading, router]);

  // Prevent hydration mismatch by rendering nothing on server
  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <AuthForms />
      </div>
    </div>
  );
}
