"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Calificacion automatizada con IA
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
            Califica examenes en{" "}
            <span className="text-indigo-600">minutos</span>, no en horas
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Sube tu solucionario, sube los examenes de tus alumnos y deja que
            nuestra inteligencia artificial califique todo automaticamente.
            Rapido, preciso y confiable.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Comenzar Gratis
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">
                Iniciar Sesion
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">
            Sin tarjeta de credito requerida
          </p>
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[600px] bg-gradient-to-r from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl" />
    </section>
  );
}
