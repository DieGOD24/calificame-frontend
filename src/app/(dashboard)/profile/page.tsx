"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardBody, CardHeader, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { User, Mail, Lock, Save } from "lucide-react";

export default function ProfilePage() {
  const { user, fetchUser } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.patch("/auth/me", { full_name: fullName, email });
      await fetchUser();
      toast.success("Perfil actualizado");
    } catch (err: unknown) {
      const detail =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      toast.error(detail ?? "Error al actualizar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Las contrasenas no coinciden");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("La nueva contrasena debe tener al menos 6 caracteres");
      return;
    }
    setIsChangingPassword(true);
    try {
      await api.post("/auth/me/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("Contrasena actualizada");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const detail =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      toast.error(detail ?? "Error al cambiar contrasena");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!user) {
    return (
      <div className="py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>

      {/* Profile info */}
      <Card>
        <form onSubmit={handleSaveProfile}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <User className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Informacion Personal
                </h2>
                <p className="text-sm text-gray-500">
                  Actualiza tu nombre y correo electronico.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <Input
                label="Nombre completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="h-4 w-4" />}
              />
              <Input
                label="Correo electronico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-4 w-4" />}
              />
              <div className="text-xs text-gray-400">
                Miembro desde:{" "}
                {new Date(user.created_at).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </CardBody>
          <CardFooter>
            <Button
              type="submit"
              isLoading={isSaving}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Guardar Cambios
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Change password */}
      <Card>
        <form onSubmit={handleChangePassword}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Lock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Cambiar Contrasena
                </h2>
                <p className="text-sm text-gray-500">
                  Usa una contrasena segura de al menos 6 caracteres.
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <Input
                label="Contrasena actual"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
              />
              <Input
                label="Nueva contrasena"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
              />
              <Input
                label="Confirmar nueva contrasena"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
              />
            </div>
          </CardBody>
          <CardFooter>
            <Button
              type="submit"
              variant="outline"
              isLoading={isChangingPassword}
              disabled={!currentPassword || !newPassword || !confirmPassword}
              leftIcon={<Lock className="h-4 w-4" />}
            >
              Cambiar Contrasena
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
