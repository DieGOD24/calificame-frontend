"use client";

import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-lg font-bold text-white">Calificame</span>
            </div>
            <p className="text-sm leading-relaxed">
              Plataforma de calificacion automatizada de examenes con
              inteligencia artificial.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Plataforma</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  Caracteristicas
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors">
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Registrarse
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Iniciar Sesion
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:soporte@calificame.com" className="hover:text-white transition-colors">
                  soporte@calificame.com
                </a>
              </li>
              <li>
                <span>Terminos de Servicio</span>
              </li>
              <li>
                <span>Politica de Privacidad</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; 2026 Calificame.com. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
