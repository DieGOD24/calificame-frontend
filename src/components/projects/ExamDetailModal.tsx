"use client";

import React from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { StudentExam } from "@/types/project";
import { CheckCircle, XCircle } from "lucide-react";

interface ExamDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: StudentExam | null;
}

export function ExamDetailModal({
  isOpen,
  onClose,
  exam,
}: ExamDetailModalProps) {
  if (!exam) return null;

  const percentage = exam.grade_percentage ?? 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalle - ${exam.student_name || "Alumno"}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Header info */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-semibold text-gray-900">
              {exam.student_name || "Sin nombre"}
            </h3>
            {exam.student_identifier && (
              <p className="text-sm text-gray-500">
                ID: {exam.student_identifier}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {exam.total_score !== null
                ? `${exam.total_score}/${exam.max_score}`
                : "N/A"}
            </p>
            <Badge status={exam.status} />
          </div>
        </div>

        {/* Progress */}
        <ProgressBar
          value={percentage}
          label="Calificacion"
          showPercentage
          color={percentage >= 60 ? "green" : "red"}
        />

        {/* Error message */}
        {exam.error_message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{exam.error_message}</p>
          </div>
        )}

        {/* Answers breakdown */}
        {exam.answers && exam.answers.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Desglose por Pregunta
            </h4>
            <div className="space-y-2">
              {exam.answers.map((answer, index) => (
                <div
                  key={answer.id}
                  className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    {answer.is_correct ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Pregunta {answer.question?.question_number || index + 1}
                      </p>
                      <p className="text-xs text-gray-500">
                        Respuesta: {answer.extracted_answer || "Sin respuesta"}
                      </p>
                      {answer.question && (
                        <p className="text-xs text-gray-400">
                          Correcta: {answer.question.correct_answer}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {answer.score}/{answer.max_score}
                    </p>
                    {answer.confidence !== null && (
                      <p className="text-xs text-gray-400">
                        Confianza: {(answer.confidence * 100).toFixed(0)}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback section */}
        {exam.answers?.some((a) => a.feedback) && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Retroalimentacion
            </h4>
            {exam.answers
              .filter((a) => a.feedback)
              .map((answer, index) => (
                <div key={index} className="mb-2 text-sm text-gray-600">
                  <span className="font-medium">
                    P{answer.question?.question_number || index + 1}:
                  </span>{" "}
                  {answer.feedback}
                </div>
              ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
