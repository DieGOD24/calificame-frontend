"use client";

import React from "react";
import { Upload, ScanSearch, Brain, BarChart3, Shield, Clock } from "lucide-react";

const features = [
  {
    icon: <Upload className="h-6 w-6" />,
    title: "Subida Facil",
    description:
      "Sube solucionarios y examenes en formato PDF o imagen. Arrastra y suelta o selecciona archivos.",
  },
  {
    icon: <ScanSearch className="h-6 w-6" />,
    title: "OCR Avanzado",
    description:
      "Reconocimiento optico de caracteres de ultima generacion para extraer respuestas de examenes escritos a mano o impresos.",
  },
  {
    icon: <Brain className="h-6 w-6" />,
    title: "Calificacion con IA",
    description:
      "Inteligencia artificial que compara las respuestas de los alumnos con el solucionario de forma precisa.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Reportes Detallados",
    description:
      "Estadisticas completas por alumno, pregunta y grupo. Exporta resultados facilmente.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Revision Humana",
    description:
      "Revisa y ajusta las respuestas extraidas antes de confirmar. Tu tienes el control final.",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Ahorra Tiempo",
    description:
      "Reduce horas de calificacion manual a minutos. Dedica mas tiempo a ensenar y menos a calificar.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Todo lo que necesitas para calificar
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Herramientas poderosas que simplifican el proceso de evaluacion de
            principio a fin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-xl border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all"
            >
              <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
