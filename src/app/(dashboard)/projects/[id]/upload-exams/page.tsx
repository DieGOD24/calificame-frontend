"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useProjects } from "@/hooks/useProjects";
import { ExamUploader } from "@/components/projects/ExamUploader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Play,
  FileText,
  RefreshCw,
  Trash2,
  BarChart3,
  AlertTriangle,
} from "lucide-react";

export default function UploadExamsPage() {
  const params = useParams();
  const id = params.id as string;
  const {
    currentProject: project,
    studentExams,
    fetchProject,
    fetchStudentExams,
    uploadStudentExams,
    gradeExams,
    isLoading,
  } = useProjects();

  const [isGrading, setIsGrading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject(id).catch(() => {});
      fetchStudentExams(id).catch(() => {});
    }
  }, [id, fetchProject, fetchStudentExams]);

  const handleUpload = async (files: File[]) => {
    try {
      await uploadStudentExams(id, files);
      toast.success(`${files.length} examen(es) subido(s) exitosamente`);
      fetchStudentExams(id);
    } catch {
      toast.error("Error al subir los examenes");
    }
  };

  const handleGradeAll = async () => {
    setIsGrading(true);
    try {
      await gradeExams(id);
      toast.success("Calificacion completada");
      await fetchStudentExams(id);
    } catch {
      toast.error("Error al calificar los examenes");
    } finally {
      setIsGrading(false);
    }
  };

  const handleRegrade = async () => {
    setIsGrading(true);
    try {
      await gradeExams(id, true);
      toast.success("Examenes recalificados exitosamente");
      await fetchStudentExams(id);
    } catch {
      toast.error("Error al recalificar los examenes");
    } finally {
      setIsGrading(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    try {
      const { default: api } = await import("@/lib/api");
      await api.delete(`/projects/${id}/exams/${examId}`);
      toast.success("Examen eliminado");
      fetchStudentExams(id);
    } catch {
      toast.error("Error al eliminar el examen");
    }
  };

  if (isLoading && !project) {
    return (
      <div className="py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  const uploadedCount = studentExams.filter((e) => e.status === "uploaded").length;
  const gradedCount = studentExams.filter((e) => e.status === "graded").length;
  const errorCount = studentExams.filter((e) => e.status === "error").length;
  const hasGradedExams = gradedCount > 0;
  const hasErrors = errorCount > 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/projects/${id}`}>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Examenes de Alumnos
          </h1>
        </div>
        {hasGradedExams && (
          <Link href={`/projects/${id}/results`}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<BarChart3 className="h-4 w-4" />}
            >
              Ver Resultados
            </Button>
          </Link>
        )}
      </div>

      <p className="text-gray-500">
        Sube los examenes de tus alumnos en formato PDF o imagen. Puedes subir
        multiples archivos a la vez y agregar mas en cualquier momento.
      </p>

      {/* Upload section - always visible */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Subir Examenes</h2>
        </CardHeader>
        <CardBody>
          <ExamUploader onUpload={handleUpload} isLoading={isLoading} />
        </CardBody>
      </Card>

      {/* Error banner */}
      {hasErrors && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                {errorCount} examen(es) con error en la calificacion
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Puedes recalificar los examenes con error o eliminarlos y subir
                versiones con mejor calidad.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Uploaded exams list */}
      {studentExams.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Examenes ({studentExams.length})
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {uploadedCount > 0 && `${uploadedCount} pendiente(s)`}
                  {uploadedCount > 0 && gradedCount > 0 && " · "}
                  {gradedCount > 0 && `${gradedCount} calificado(s)`}
                  {(uploadedCount > 0 || gradedCount > 0) && errorCount > 0 && " · "}
                  {errorCount > 0 && `${errorCount} con error`}
                </p>
              </div>
              <div className="flex gap-2">
                {hasGradedExams && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRegrade}
                    isLoading={isGrading}
                    leftIcon={<RefreshCw className="h-4 w-4" />}
                  >
                    Recalificar Todos
                  </Button>
                )}
                <Button
                  onClick={handleGradeAll}
                  size="sm"
                  isLoading={isGrading}
                  leftIcon={<Play className="h-4 w-4" />}
                  disabled={uploadedCount === 0 && !hasErrors}
                >
                  {hasGradedExams ? "Calificar Pendientes" : "Calificar Todos"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <ul className="space-y-2">
              {studentExams.map((exam) => (
                <li
                  key={exam.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-indigo-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {exam.student_name ||
                          exam.original_filename ||
                          "Examen"}
                      </p>
                      {exam.total_score !== null && (
                        <p className="text-xs text-gray-500">
                          Puntaje: {exam.total_score}/{exam.max_score} (
                          {exam.grade_percentage?.toFixed(1)}%)
                        </p>
                      )}
                      {exam.error_message && (
                        <p className="text-xs text-red-500 truncate">
                          {exam.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge status={exam.status} />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteExam(exam.id)}
                      aria-label="Eliminar examen"
                    >
                      <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      {/* Grading in progress overlay */}
      {isGrading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <Card>
            <CardBody className="text-center py-8 px-12">
              <Spinner size="lg" />
              <p className="mt-4 font-medium text-gray-900">
                Calificando examenes...
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Esto puede tardar unos minutos dependiendo de la cantidad de
                examenes.
              </p>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
