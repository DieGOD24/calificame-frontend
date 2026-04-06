"use client";

import React from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useSettingsStore } from "@/stores/settingsStore";
import toast from "react-hot-toast";
import {
  Palette,
  Bell,
  Globe,
  Trash2,
  Download,
  Shield,
  Moon,
  Sun,
} from "lucide-react";

interface SettingToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function SettingToggle({
  label,
  description,
  checked,
  onChange,
}: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const {
    darkMode,
    language,
    notifications,
    autoGrade,
    confirmBeforeGrade,
    setDarkMode,
    setLanguage,
    setNotifications,
    setAutoGrade,
    setConfirmBeforeGrade,
  } = useSettingsStore();

  const handleExportData = () => {
    toast.success("Exportacion iniciada. Se descargara en breve.");
  };

  const handleDeleteAccount = () => {
    toast.error("Contacta al administrador para eliminar tu cuenta.");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configuracion</h1>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Apariencia</h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="divide-y divide-gray-100">
            {/* Dark mode */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                {darkMode ? (
                  <Moon className="h-5 w-5 text-indigo-500" />
                ) : (
                  <Sun className="h-5 w-5 text-amber-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {darkMode ? "Modo oscuro" : "Modo claro"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {darkMode
                      ? "Interfaz con colores oscuros activa"
                      : "Interfaz con colores claros activa"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={darkMode}
                onClick={() => {
                  setDarkMode(!darkMode);
                  toast.success(
                    !darkMode ? "Modo oscuro activado" : "Modo claro activado"
                  );
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? "bg-indigo-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    darkMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Language */}
            <div className="py-3">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Idioma</p>
                  <p className="text-xs text-gray-500">
                    Selecciona el idioma de la interfaz
                  </p>
                </div>
              </div>
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value as "es" | "en");
                  toast.success(
                    e.target.value === "es"
                      ? "Idioma: Espanol"
                      : "Language: English"
                  );
                }}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="es">Espanol</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Notificaciones
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <SettingToggle
            label="Notificaciones en la app"
            description="Muestra notificaciones cuando se completa una calificacion"
            checked={notifications}
            onChange={(v) => {
              setNotifications(v);
              toast.success(
                v ? "Notificaciones activadas" : "Notificaciones desactivadas"
              );
            }}
          />
        </CardBody>
      </Card>

      {/* Grading preferences */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Calificacion
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="divide-y divide-gray-100">
            <SettingToggle
              label="Calificar automaticamente"
              description="Inicia la calificacion automaticamente al subir examenes"
              checked={autoGrade}
              onChange={setAutoGrade}
            />
            <SettingToggle
              label="Confirmar antes de calificar"
              description="Pedir confirmacion antes de iniciar la calificacion"
              checked={confirmBeforeGrade}
              onChange={setConfirmBeforeGrade}
            />
          </div>
        </CardBody>
      </Card>

      {/* Data & Privacy */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Datos y Privacidad
            </h2>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Exportar mis datos
                </p>
                <p className="text-xs text-gray-500">
                  Descarga todos tus proyectos y resultados
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                leftIcon={<Download className="h-4 w-4" />}
              >
                Exportar
              </Button>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div>
                <p className="text-sm font-medium text-red-600">
                  Eliminar cuenta
                </p>
                <p className="text-xs text-gray-500">
                  Elimina permanentemente tu cuenta y todos los datos
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeleteAccount}
                leftIcon={<Trash2 className="h-4 w-4" />}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
