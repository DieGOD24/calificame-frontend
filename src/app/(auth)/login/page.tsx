"use client";

import React from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
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
            Iniciar Sesion
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Ingresa tus credenciales para acceder a tu cuenta
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <LoginForm />
        </div>

        {/* Register link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          No tienes cuenta?{" "}
          <Link
            href="/register"
            className="text-indigo-600 font-medium hover:text-indigo-500"
          >
            Registrate aqui
          </Link>
        </p>
      </div>
    </div>
  );
}
