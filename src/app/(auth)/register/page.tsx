"use client";

import React from "react";
import Link from "next/link";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Calificame</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Crear Cuenta
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Registrate para comenzar a calificar examenes automaticamente
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <RegisterForm />
        </div>

        {/* Login link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="text-indigo-600 font-medium hover:text-indigo-500"
          >
            Inicia sesion
          </Link>
        </p>
      </div>
    </div>
  );
}
