"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import type { StudentExam } from "@/types/project";
import {
  CheckCircle,
  XCircle,
  FileText,
  BookOpen,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface ExamDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: StudentExam | null;
}

function ImageViewer({
  label,
  icon,
  src,
  totalPages,
}: {
  label: string;
  icon: React.ReactNode;
  src: string;
  totalPages: number;
}) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  const pages = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        {icon}
        {label}
        {totalPages > 1 && (
          <span className="text-xs text-gray-400 font-normal">
            ({totalPages} paginas)
          </span>
        )}
      </div>
      <div className="space-y-2 max-h-[500px] overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-1">
        {pages.map((page) => {
          const imgUrl = `${src}?page=${page}${token ? `&token=${token}` : ""}`;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={page}
              src={imgUrl}
              alt={`${label} - pagina ${page + 1}`}
              className="w-full rounded border border-gray-100"
              loading="lazy"
            />
          );
        })}
      </div>
    </div>
  );
}

export function ExamDetailModal({
  isOpen,
  onClose,
  exam,
}: ExamDetailModalProps) {
  const [examPages, setExamPages] = useState(1);
  const [answerKeyPages, setAnswerKeyPages] = useState(1);
  const [showImages, setShowImages] = useState(false);

  useEffect(() => {
    if (!isOpen || !exam) return;
    setShowImages(false);

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    const q = token ? `?token=${token}` : "";

    fetch(
      `${API_URL}/projects/${exam.project_id}/exams/${exam.id}/pages${q}`
    )
      .then((r) => r.json())
      .then((d) => setExamPages(d.pages || 1))
      .catch(() => setExamPages(1));

    fetch(
      `${API_URL}/projects/${exam.project_id}/answer-key/pages${q}`
    )
      .then((r) => r.json())
      .then((d) => setAnswerKeyPages(d.pages || 1))
      .catch(() => setAnswerKeyPages(1));
  }, [isOpen, exam]);

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

        {/* Toggle images */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowImages((v) => !v)}
          leftIcon={<FileText className="h-4 w-4" />}
        >
          {showImages
            ? "Ocultar Imagenes"
            : "Ver Imagenes (Examen y Solucionario)"}
        </Button>

        {/* Images side by side */}
        {showImages && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ImageViewer
              label="Examen del Alumno"
              icon={<FileText className="h-4 w-4 text-indigo-500" />}
              src={`${API_URL}/projects/${exam.project_id}/exams/${exam.id}/image`}
              totalPages={examPages}
            />
            <ImageViewer
              label="Solucionario"
              icon={<BookOpen className="h-4 w-4 text-green-600" />}
              src={`${API_URL}/projects/${exam.project_id}/answer-key/image`}
              totalPages={answerKeyPages}
            />
          </div>
        )}

        {/* Answers breakdown */}
        {exam.answers && exam.answers.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">
              Desglose por Pregunta
            </h4>
            <div className="space-y-3">
              {exam.answers.map((answer, index) => (
                <div
                  key={answer.id}
                  className={`rounded-lg border p-3 ${
                    answer.is_correct
                      ? "border-green-200 bg-green-50"
                      : answer.score && answer.score > 0
                        ? "border-yellow-200 bg-yellow-50"
                        : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      {answer.is_correct ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900">
                          Pregunta{" "}
                          {answer.question?.question_number || index + 1}
                        </p>
                        {answer.question?.question_text && (
                          <p className="text-xs text-gray-600 mt-0.5">
                            {answer.question.question_text}
                          </p>
                        )}
                        <div className="mt-2 space-y-1">
                          <div>
                            <span className="text-xs font-medium text-gray-500">
                              Respuesta del alumno:
                            </span>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap">
                              {answer.extracted_answer || (
                                <span className="italic text-gray-400">
                                  Sin respuesta detectada
                                </span>
                              )}
                            </p>
                          </div>
                          {answer.question?.correct_answer && (
                            <div>
                              <span className="text-xs font-medium text-green-700">
                                Respuesta correcta:
                              </span>
                              <p className="text-sm text-green-800 whitespace-pre-wrap">
                                {answer.question.correct_answer}
                              </p>
                            </div>
                          )}
                        </div>
                        {answer.feedback && (
                          <p className="text-xs text-gray-600 mt-2 italic">
                            {answer.feedback}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold">
                        {answer.score}/{answer.max_score}
                      </p>
                      {answer.confidence !== null && (
                        <p className="text-xs text-gray-400">
                          {(answer.confidence * 100).toFixed(0)}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
