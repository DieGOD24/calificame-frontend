"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useProjects } from "@/hooks/useProjects";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { formatDate, getStatusLabel } from "@/lib/utils";
import {
  Upload,
  FileText,
  CheckCircle,
  BarChart3,
  Settings,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const {
    currentProject: project,
    fetchProject,
    processAnswerKey,
    isLoading,
    error,
  } = useProjects();

  useEffect(() => {
    if (id) {
      fetchProject(id).catch(() => {
        // Error handled in hook
      });
    }
  }, [id, fetchProject]);

  const handleProcessAnswerKey = async () => {
    try {
      await processAnswerKey(id);
      toast.success("Solucionario procesado exitosamente");
      fetchProject(id);
    } catch {
      toast.error("Error al procesar el solucionario");
    }
  };

  if (isLoading && !project) {
    return (
      <div className="py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="text-center py-16">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-gray-900">
          Proyecto no encontrado
        </h2>
        <p className="text-gray-500 mt-1">
          No se pudo cargar el proyecto solicitado.
        </p>
        <Link href="/projects" className="mt-4 inline-block">
          <Button variant="outline">Volver a Proyectos</Button>
        </Link>
      </div>
    );
  }

  const statusSteps = [
    {
      key: "draft",
      label: "Creado",
      done: true,
    },
    {
      key: "configuring",
      label: "Configurado",
      done: [
        "configuring",
        "answer_key_uploaded",
        "answer_key_processed",
        "confirmed",
        "grading",
        "completed",
      ].includes(project.status),
    },
    {
      key: "answer_key_uploaded",
      label: "Solucionario",
      done: [
        "answer_key_uploaded",
        "answer_key_processed",
        "confirmed",
        "grading",
        "completed",
      ].includes(project.status),
    },
    {
      key: "confirmed",
      label: "Confirmado",
      done: ["confirmed", "grading", "completed"].includes(project.status),
    },
    {
      key: "completed",
      label: "Calificado",
      done: project.status === "completed",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {project.name}
            </h1>
            <Badge status={project.status} />
          </div>
          {project.subject && (
            <p className="text-indigo-600 mt-1">{project.subject}</p>
          )}
          {project.description && (
            <p className="text-gray-500 text-sm mt-1">{project.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Creado: {formatDate(project.created_at)} | Actualizado:{" "}
            {formatDate(project.updated_at)}
          </p>
        </div>
      </div>

      {/* Status progress */}
      <Card>
        <CardBody>
          <div className="flex items-center justify-between">
            {statusSteps.map((step, index) => (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      step.done
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step.done ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-xs text-gray-500 text-center hidden sm:block">
                    {step.label}
                  </span>
                </div>
                {index < statusSteps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      step.done ? "bg-indigo-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Status-dependent content */}
      {(project.status === "draft" || project.status === "configuring") && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Siguiente Paso: Subir Solucionario
            </h2>
          </CardHeader>
          <CardBody>
            <p className="text-gray-500 mb-4">
              Sube el solucionario del examen para que nuestra IA pueda extraer
              las respuestas correctas.
            </p>
            <Link href={`/projects/${project.id}/answer-key`}>
              <Button leftIcon={<Upload className="h-4 w-4" />}>
                Subir Solucionario
              </Button>
            </Link>
          </CardBody>
        </Card>
      )}

      {project.status === "answer_key_uploaded" && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Solucionario Subido
            </h2>
          </CardHeader>
          <CardBody>
            <p className="text-gray-500 mb-4">
              El solucionario ha sido subido. Procesa el solucionario para
              extraer las preguntas y respuestas.
            </p>
            <Button
              onClick={handleProcessAnswerKey}
              isLoading={isLoading}
              leftIcon={<Settings className="h-4 w-4" />}
            >
              Procesar Solucionario
            </Button>
          </CardBody>
        </Card>
      )}

      {project.status === "answer_key_processed" && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Revisar y Confirmar Preguntas
            </h2>
          </CardHeader>
          <CardBody>
            <p className="text-gray-500 mb-4">
              Las preguntas y respuestas han sido extraidas. Revisalas y
              confirmalas antes de continuar.
            </p>
            <Link href={`/projects/${project.id}/confirm`}>
              <Button
                leftIcon={<FileText className="h-4 w-4" />}
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                Revisar Preguntas
              </Button>
            </Link>
          </CardBody>
        </Card>
      )}

      {project.status === "confirmed" && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Subir Examenes de Alumnos
            </h2>
          </CardHeader>
          <CardBody>
            <p className="text-gray-500 mb-4">
              Las preguntas estan confirmadas. Sube los examenes de los alumnos
              para calificarlos.
            </p>
            <Link href={`/projects/${project.id}/upload-exams`}>
              <Button leftIcon={<Upload className="h-4 w-4" />}>
                Subir Examenes
              </Button>
            </Link>
          </CardBody>
        </Card>
      )}

      {(project.status === "grading" || project.status === "completed") && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              {project.status === "grading"
                ? "Calificacion en Progreso..."
                : "Calificacion Completada"}
            </h2>
          </CardHeader>
          <CardBody>
            <p className="text-gray-500 mb-4">
              {project.status === "grading"
                ? "Los examenes estan siendo calificados. Esto puede tardar unos minutos."
                : "Todos los examenes han sido calificados. Revisa los resultados."}
            </p>
            <Link href={`/projects/${project.id}/results`}>
              <Button leftIcon={<BarChart3 className="h-4 w-4" />}>
                Ver Resultados
              </Button>
            </Link>
          </CardBody>
        </Card>
      )}

      {/* Project info */}
      {project.config && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Configuracion
            </h2>
          </CardHeader>
          <CardBody>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Tipo de examen</dt>
                <dd className="font-medium text-gray-900 mt-0.5">
                  {project.config.exam_type === "multiple_choice"
                    ? "Opcion Multiple"
                    : project.config.exam_type === "open_ended"
                      ? "Respuesta Abierta"
                      : "Mixto"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Preguntas</dt>
                <dd className="font-medium text-gray-900 mt-0.5">
                  {project.config.total_questions}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Puntos por pregunta</dt>
                <dd className="font-medium text-gray-900 mt-0.5">
                  {project.config.points_per_question || "Variable"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Multiples paginas</dt>
                <dd className="font-medium text-gray-900 mt-0.5">
                  {project.config.has_multiple_pages ? "Si" : "No"}
                </dd>
              </div>
            </dl>
            {project.config.additional_instructions && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <dt className="text-sm text-gray-500">
                  Instrucciones adicionales
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {project.config.additional_instructions}
                </dd>
              </div>
            )}
          </CardBody>
        </Card>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardBody className="text-center py-3">
            <p className="text-xl font-bold text-gray-900">
              {project.questions_count || 0}
            </p>
            <p className="text-xs text-gray-500">Preguntas</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-3">
            <p className="text-xl font-bold text-gray-900">
              {project.exams_count || 0}
            </p>
            <p className="text-xs text-gray-500">Examenes</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="text-center py-3">
            <p className="text-xl font-bold text-gray-900">
              {project.graded_count || 0}
            </p>
            <p className="text-xs text-gray-500">Calificados</p>
          </CardBody>
        </Card>
      </div>

      {/* Action: see current step label */}
      <div className="text-center text-sm text-gray-400">
        Estado actual: {getStatusLabel(project.status)}
      </div>
    </div>
  );
}
