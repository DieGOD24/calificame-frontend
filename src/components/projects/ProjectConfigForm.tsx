"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  projectConfigSchema,
  type ProjectConfigFormData,
} from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ProjectConfigFormProps {
  onSubmit: (data: ProjectConfigFormData) => void;
  isLoading?: boolean;
  defaultValues?: Partial<ProjectConfigFormData>;
}

const examTypes = [
  { value: "multiple_choice", label: "Opcion Multiple", description: "Preguntas con opciones A, B, C, D" },
  { value: "open_ended", label: "Respuesta Abierta", description: "Preguntas con respuesta escrita" },
  { value: "mixed", label: "Mixto", description: "Combinacion de ambos tipos" },
] as const;

export function ProjectConfigForm({
  onSubmit,
  isLoading = false,
  defaultValues,
}: ProjectConfigFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProjectConfigFormData>({
    resolver: zodResolver(projectConfigSchema),
    defaultValues: {
      exam_type: defaultValues?.exam_type || "multiple_choice",
      total_questions: defaultValues?.total_questions || 10,
      points_per_question: defaultValues?.points_per_question || 1,
      has_multiple_pages: defaultValues?.has_multiple_pages || false,
      additional_instructions: defaultValues?.additional_instructions || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Exam type selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo de Examen
        </label>
        <Controller
          name="exam_type"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {examTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => field.onChange(type.value)}
                  className={cn(
                    "p-4 rounded-lg border-2 text-left transition-colors",
                    field.value === type.value
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <p className="font-medium text-gray-900 text-sm">
                    {type.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          )}
        />
        {errors.exam_type && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.exam_type.message}
          </p>
        )}
      </div>

      {/* Number of questions */}
      <Input
        label="Numero de preguntas"
        type="number"
        error={errors.total_questions?.message}
        {...register("total_questions", { valueAsNumber: true })}
      />

      {/* Points per question */}
      <Input
        label="Puntos por pregunta"
        type="number"
        step="any"
        error={errors.points_per_question?.message}
        {...register("points_per_question", { valueAsNumber: true })}
      />

      {/* Has multiple pages */}
      <Controller
        name="has_multiple_pages"
        control={control}
        render={({ field }) => (
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={field.value}
              onClick={() => field.onChange(!field.value)}
              className={cn(
                "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                field.value ? "bg-indigo-600" : "bg-gray-200"
              )}
            >
              <span
                className={cn(
                  "inline-block h-4 w-4 rounded-full bg-white transition-transform",
                  field.value ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
            <label className="text-sm font-medium text-gray-700">
              El examen tiene multiples paginas
            </label>
          </div>
        )}
      />

      {/* Additional instructions */}
      <div>
        <label
          htmlFor="additional_instructions"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Instrucciones adicionales (opcional)
        </label>
        <textarea
          id="additional_instructions"
          rows={3}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Instrucciones especiales para la calificacion..."
          {...register("additional_instructions")}
        />
        {errors.additional_instructions && (
          <p className="mt-1 text-sm text-red-600" role="alert">
            {errors.additional_instructions.message}
          </p>
        )}
      </div>

      <Button type="submit" isLoading={isLoading} className="w-full">
        Guardar Configuracion
      </Button>
    </form>
  );
}
