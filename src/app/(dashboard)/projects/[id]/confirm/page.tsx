"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useProjects } from "@/hooks/useProjects";
import { QuestionReview } from "@/components/projects/QuestionReview";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  RefreshCw,
  Upload,
  AlertTriangle,
} from "lucide-react";

export default function ConfirmPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const {
    questions,
    fetchProject,
    fetchQuestions,
    processAnswerKey,
    updateQuestion,
    confirmQuestions,
    isLoading,
  } = useProjects();

  const [isReanalyzing, setIsReanalyzing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject(id).catch(() => {});
      fetchQuestions(id).catch(() => {});
    }
  }, [id, fetchProject, fetchQuestions]);

  const handleUpdateQuestion = async (
    questionId: string,
    data: Partial<{
      correct_answer: string;
      points: number;
      question_text: string | null;
    }>
  ) => {
    try {
      await updateQuestion(id, questionId, data);
      toast.success("Pregunta actualizada");
    } catch {
      toast.error("Error al actualizar la pregunta");
    }
  };

  const handleConfirmAll = async () => {
    try {
      await confirmQuestions(id);
      toast.success("Preguntas confirmadas exitosamente");
      router.push(`/projects/${id}/upload-exams`);
    } catch {
      toast.error("Error al confirmar preguntas");
    }
  };

  const handleReanalyze = async () => {
    setIsReanalyzing(true);
    try {
      await processAnswerKey(id);
      await fetchQuestions(id);
      toast.success("Solucionario reanalizado exitosamente");
    } catch {
      toast.error(
        "Error al reanalizar. Intenta subir el solucionario de nuevo con mejor calidad."
      );
    } finally {
      setIsReanalyzing(false);
    }
  };

  if ((isLoading || isReanalyzing) && questions.length === 0) {
    return (
      <div className="py-16 text-center space-y-3">
        <Spinner size="lg" />
        {isReanalyzing && (
          <p className="text-sm text-gray-500">
            Reanalizando solucionario con IA...
          </p>
        )}
      </div>
    );
  }

  const hasEmptyAnswers = questions.some(
    (q) => !q.correct_answer || q.correct_answer.trim() === ""
  );

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
            Confirmar Preguntas
          </h1>
        </div>
        <Link href={`/projects/${id}/upload-exams`}>
          <Button
            variant="outline"
            size="sm"
            rightIcon={<ArrowRight className="h-4 w-4" />}
          >
            Siguiente
          </Button>
        </Link>
      </div>

      <p className="text-gray-500">
        Revisa las preguntas y respuestas extraidas del solucionario. Puedes
        editar cualquier campo antes de confirmar.
      </p>

      {/* Warning banner when answers are empty */}
      {hasEmptyAnswers && questions.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                Algunas respuestas no fueron detectadas
              </p>
              <p className="text-sm text-amber-700 mt-1">
                El analisis no logro extraer todas las respuestas del
                solucionario. Puedes reanalizar el documento o subir una version
                con mejor calidad (imagenes nitidas, buena iluminacion, texto
                legible).
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 ml-8">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReanalyze}
              isLoading={isReanalyzing}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Reanalizar Solucionario
            </Button>
            <Link href={`/projects/${id}/answer-key`}>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Upload className="h-4 w-4" />}
              >
                Subir Nuevo Solucionario
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Reanalyze / re-upload actions (always visible) */}
      {questions.length > 0 && !hasEmptyAnswers && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReanalyze}
            isLoading={isReanalyzing}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Reanalizar Preguntas
          </Button>
          <Link href={`/projects/${id}/answer-key`}>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Upload className="h-4 w-4" />}
            >
              Subir Otro Solucionario
            </Button>
          </Link>
        </div>
      )}

      {questions.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-16 w-16" />}
          title="Sin preguntas extraidas"
          description="No se encontraron preguntas. Verifica que el solucionario haya sido procesado correctamente."
          action={
            <div className="flex flex-col items-center gap-3">
              <Button
                variant="outline"
                onClick={handleReanalyze}
                isLoading={isReanalyzing}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Reanalizar Solucionario
              </Button>
              <Link href={`/projects/${id}/answer-key`}>
                <Button
                  variant="ghost"
                  leftIcon={<Upload className="h-4 w-4" />}
                >
                  Subir Nuevo Solucionario
                </Button>
              </Link>
            </div>
          }
        />
      ) : (
        <QuestionReview
          questions={questions}
          onUpdateQuestion={handleUpdateQuestion}
          onConfirmAll={handleConfirmAll}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
