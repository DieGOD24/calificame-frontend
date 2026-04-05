"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useProjects } from "@/hooks/useProjects";
import { QuestionReview } from "@/components/projects/QuestionReview";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import toast from "react-hot-toast";
import { ArrowLeft, ArrowRight, FileText } from "lucide-react";

export default function ConfirmPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const {
    questions,
    fetchProject,
    fetchQuestions,
    updateQuestion,
    confirmQuestions,
    isLoading,
  } = useProjects();

  useEffect(() => {
    if (id) {
      fetchProject(id).catch(() => {});
      fetchQuestions(id).catch(() => {});
    }
  }, [id, fetchProject, fetchQuestions]);

  const handleUpdateQuestion = async (
    questionId: string,
    data: Partial<{ correct_answer: string; points: number; question_text: string | null }>
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

  if (isLoading && questions.length === 0) {
    return (
      <div className="py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/projects/${id}`}>
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
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

      {questions.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-16 w-16" />}
          title="Sin preguntas extraidas"
          description="No se encontraron preguntas. Verifica que el solucionario haya sido procesado correctamente."
          action={
            <Link href={`/projects/${id}/answer-key`}>
              <Button variant="outline">Ir al Solucionario</Button>
            </Link>
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
