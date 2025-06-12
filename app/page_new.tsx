"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BeakerIcon } from "@heroicons/react/24/outline";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after a brief delay
    const timer = setTimeout(() => {
      router.push("/dashboard/datasets");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <BeakerIcon className="h-24 w-24 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">OncoDiag</h1>
          <p className="text-xl text-gray-600 mb-8">
            Plataforma de Diagnóstico Asistido de Cáncer
          </p>
        </div>

        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-gray-600">Iniciando aplicación...</span>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Redirigiendo al panel de control...</p>
        </div>
      </div>
    </div>
  );
}
