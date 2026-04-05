"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  projectCreateSchema,
  type ProjectCreateFormData,
} from "@/lib/validations";
import { useProjects } from "@/hooks/useProjects";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader, CardFooter } from "@/components/ui/Card";
import { ProjectConfigForm } from "@/components/projects/ProjectConfigForm";
import { FileUpload } from "@/components/ui/FileUpload";
import type { ProjectConfigFormData } from "@/lib/validations";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";

const steps = [
  { number: 1, title: "Informacion Basica" },
  { number: 2, title: "Configuracion" },
  { number: 3, title: "Solucionario" },
];

export default function NewProjectPage() {
  const router = useRouter();
  const {
    createProject,
    updateProjectConfig,
    uploadAnswerKey,
    isLoading,
  } = useProjects();

  const [currentStep, setCurrentStep] = useState(1);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [answerKeyFiles, setAnswerKeyFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectCreateFormData>({
    resolver: zodResolver(projectCreateSchema),
  });

  // Step 1: Create project
  const handleCreateProject = async (data: ProjectCreateFormData) => {
    try {
      const project = await createProject({
        name: data.name,
        description: data.description || undefined,
        subject: data.subject || undefined,
      });
      setProjectId(project.id);
      setCurrentStep(2);
      toast.success("Proyecto creado exitosamente");
    } catch {
      toast.error("Error al crear el proyecto");
    }
  };

  // Step 2: Configure project
  const handleConfigSubmit = async (data: ProjectConfigFormData) => {
    if (!projectId) return;
    try {
      await updateProjectConfig(projectId, {
        exam_type: data.exam_type,
        total_questions: data.total_questions,
        points_per_question: data.points_per_question,
        has_multiple_pages: data.has_multiple_pages,
        additional_instructions: data.additional_instructions,
      });
      setCurrentStep(3);
      toast.success("Configuracion guardada");
    } catch {
      toast.error("Error al guardar configuracion");
    }
  };

  // Step 3: Upload answer key
  const handleFilesSelected = useCallback((files: File[]) => {
    setAnswerKeyFiles(files);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setAnswerKeyFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUploadAnswerKey = async () => {
    if (!projectId || answerKeyFiles.length === 0) return;
    try {
      await uploadAnswerKey(projectId, answerKeyFiles[0]);
      toast.success("Solucionario subido exitosamente");
      router.push(`/projects/${projectId}`);
    } catch {
      toast.error("Error al subir el solucionario");
    }
  };

  const handleSkipUpload = () => {
    if (projectId) {
      router.push(`/projects/${projectId}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Nuevo Proyecto
      </h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className="flex items-center gap-2">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.number
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep > step.number ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`text-sm hidden sm:inline ${
                  currentStep >= step.number
                    ? "text-gray-900 font-medium"
                    : "text-gray-400"
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 ${
                  currentStep > step.number ? "bg-indigo-600" : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Basic info */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Informacion del Proyecto
            </h2>
            <p className="text-sm text-gray-500">
              Define los datos basicos de tu proyecto de calificacion.
            </p>
          </CardHeader>
          <CardBody>
            <form
              onSubmit={handleSubmit(handleCreateProject)}
              className="space-y-4"
            >
              <Input
                label="Nombre del Proyecto"
                placeholder="Ej: Examen Final Matematicas"
                error={errors.name?.message}
                {...register("name")}
              />
              <Input
                label="Materia (opcional)"
                placeholder="Ej: Matematicas"
                error={errors.subject?.message}
                {...register("subject")}
              />
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Descripcion (opcional)
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe tu proyecto..."
                  {...register("description")}
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.description.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Continuar
              </Button>
            </form>
          </CardBody>
        </Card>
      )}

      {/* Step 2: Configuration */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Configuracion del Examen
            </h2>
            <p className="text-sm text-gray-500">
              Configura los parametros de calificacion.
            </p>
          </CardHeader>
          <CardBody>
            <ProjectConfigForm
              onSubmit={handleConfigSubmit}
              isLoading={isLoading}
            />
          </CardBody>
          <CardFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentStep(1)}
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Atras
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Upload answer key */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Subir Solucionario
            </h2>
            <p className="text-sm text-gray-500">
              Sube el solucionario del examen en formato PDF o imagen.
            </p>
          </CardHeader>
          <CardBody>
            <FileUpload
              onFilesSelected={handleFilesSelected}
              files={answerKeyFiles}
              onRemoveFile={handleRemoveFile}
              maxFiles={1}
            />
          </CardBody>
          <CardFooter>
            <div className="flex items-center justify-between w-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentStep(2)}
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Atras
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSkipUpload}>
                  Omitir por ahora
                </Button>
                <Button
                  size="sm"
                  onClick={handleUploadAnswerKey}
                  isLoading={isLoading}
                  disabled={answerKeyFiles.length === 0}
                >
                  Subir y Continuar
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
