"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { Question } from "@/types/project";
import { Check, Edit2, X, Save } from "lucide-react";

interface QuestionReviewProps {
  questions: Question[];
  onUpdateQuestion: (
    questionId: string,
    data: Partial<Question>
  ) => Promise<void>;
  onConfirmAll: () => Promise<void>;
  isLoading?: boolean;
}

export function QuestionReview({
  questions,
  onUpdateQuestion,
  onConfirmAll,
  isLoading = false,
}: QuestionReviewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    correct_answer: string;
    points: number;
    question_text: string;
  }>({ correct_answer: "", points: 0, question_text: "" });

  const startEditing = (question: Question) => {
    setEditingId(question.id);
    setEditValues({
      correct_answer: question.correct_answer,
      points: question.points,
      question_text: question.question_text || "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValues({ correct_answer: "", points: 0, question_text: "" });
  };

  const saveEdit = async (questionId: string) => {
    await onUpdateQuestion(questionId, {
      correct_answer: editValues.correct_answer,
      points: editValues.points,
      question_text: editValues.question_text || null,
    });
    setEditingId(null);
  };

  const allConfirmed = questions.every((q) => q.is_confirmed);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Revisar Preguntas ({questions.length})
        </h3>
        <Button
          onClick={onConfirmAll}
          isLoading={isLoading}
          disabled={allConfirmed}
          leftIcon={<Check className="h-4 w-4" />}
        >
          Confirmar Todas
        </Button>
      </div>

      <div className="space-y-3">
        {questions.map((question) => (
          <Card key={question.id}>
            <CardBody className="py-3">
              {editingId === question.id ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                    Pregunta {question.question_number}
                  </div>
                  <Input
                    label="Texto de la pregunta (opcional)"
                    value={editValues.question_text}
                    onChange={(e) =>
                      setEditValues((prev) => ({
                        ...prev,
                        question_text: e.target.value,
                      }))
                    }
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Respuesta correcta"
                      value={editValues.correct_answer}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev,
                          correct_answer: e.target.value,
                        }))
                      }
                    />
                    <Input
                      label="Puntos"
                      type="number"
                      step="0.1"
                      value={editValues.points}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev,
                          points: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEditing}
                      leftIcon={<X className="h-4 w-4" />}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => saveEdit(question.id)}
                      leftIcon={<Save className="h-4 w-4" />}
                    >
                      Guardar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-indigo-600 w-8">
                      {question.question_number}
                    </span>
                    <div>
                      {question.question_text && (
                        <p className="text-sm text-gray-600">
                          {question.question_text}
                        </p>
                      )}
                      <p className="text-sm">
                        <span className="text-gray-500">Respuesta:</span>{" "}
                        <span className="font-medium text-gray-900">
                          {question.correct_answer}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400">
                        {question.points} punto(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {question.is_confirmed ? (
                      <Badge
                        className="bg-green-100 text-green-800"
                        label="Confirmada"
                      />
                    ) : (
                      <Badge
                        className="bg-yellow-100 text-yellow-800"
                        label="Pendiente"
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEditing(question)}
                      aria-label={`Editar pregunta ${question.question_number}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
