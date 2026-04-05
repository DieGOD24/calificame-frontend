"use client";

import React from "react";

const steps = [
  {
    number: "01",
    title: "Crea tu Proyecto",
    description:
      "Define el nombre, materia y configura el tipo de examen que vas a calificar.",
  },
  {
    number: "02",
    title: "Sube el Solucionario",
    description:
      "Sube el solucionario en PDF o imagen. Nuestra IA extraera las respuestas correctas automaticamente.",
  },
  {
    number: "03",
    title: "Revisa y Confirma",
    description:
      "Verifica las respuestas extraidas y haz ajustes si es necesario. Tu tienes el control.",
  },
  {
    number: "04",
    title: "Sube los Examenes",
    description:
      "Sube los examenes de tus alumnos. Puedes subir multiples archivos a la vez.",
  },
  {
    number: "05",
    title: "Obtiene Resultados",
    description:
      "Recibe calificaciones detalladas con desglose por pregunta para cada alumno.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Como Funciona
          </h2>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Un proceso simple de 5 pasos para calificar examenes automaticamente.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative flex gap-6 pb-12 last:pb-0">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-indigo-200" />
              )}
              {/* Step number */}
              <div className="relative z-10 flex-shrink-0 h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {step.number}
                </span>
              </div>
              {/* Content */}
              <div className="pt-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
