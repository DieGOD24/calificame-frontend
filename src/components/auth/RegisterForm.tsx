"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { registerSchema, type RegisterFormData } from "@/lib/validations";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, User } from "lucide-react";
import toast from "react-hot-toast";

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      await registerUser({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
      });
      toast.success("Cuenta creada exitosamente. Inicia sesion.");
      router.push("/login");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al crear la cuenta. Intenta de nuevo.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Input
        label="Nombre completo"
        type="text"
        placeholder="Tu nombre completo"
        leftIcon={<User className="h-4 w-4" />}
        error={errors.full_name?.message}
        autoComplete="name"
        {...register("full_name")}
      />

      <Input
        label="Correo electronico"
        type="email"
        placeholder="tu@correo.com"
        leftIcon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        autoComplete="email"
        {...register("email")}
      />

      <Input
        label="Contrasena"
        type="password"
        placeholder="Minimo 6 caracteres"
        leftIcon={<Lock className="h-4 w-4" />}
        error={errors.password?.message}
        autoComplete="new-password"
        {...register("password")}
      />

      <Input
        label="Confirmar contrasena"
        type="password"
        placeholder="Repite tu contrasena"
        leftIcon={<Lock className="h-4 w-4" />}
        error={errors.confirmPassword?.message}
        autoComplete="new-password"
        {...register("confirmPassword")}
      />

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Crear Cuenta
      </Button>
    </form>
  );
}
