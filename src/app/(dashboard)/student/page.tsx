"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { getStudentProgress } from "@/lib/api";
import {
  GraduationCap,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate, formatPercentage } from "@/lib/utils";

interface ExamResult {
  id: string;
  project_id: string;
  project_name: string;
  subject: string | null;
  student_name: string | null;
  total_score: number | null;
  max_score: number | null;
  grade_percentage: number | null;
  graded_at: string | null;
  answers?: {
    question_number: number;
    extracted_answer: string | null;
    is_correct: boolean | null;
    score: number;
    max_score: number | null;
    feedback: string | null;
  }[];
}

interface GroupedExams {
  project_name: string;
  subject: string | null;
  exams: ExamResult[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState<ExamResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedExam, setExpandedExam] = useState<string | null>(null);

  const isStudent = user?.role === "student";

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const res = await getStudentProgress(user.id);
      setExams(res.data?.exams ?? res.data ?? []);
    } catch {
      // silently fail - might not have data yet
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  if (!isStudent) {
    return (
      <div className="py-16">
        <EmptyState
          title="Acceso restringido"
          description="Esta seccion es solo para estudiantes."
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  // Group exams by project
  const grouped: GroupedExams[] = [];
  const projectMap = new Map<string, GroupedExams>();
  for (const exam of exams) {
    const key = exam.project_id;
    if (!projectMap.has(key)) {
      const group: GroupedExams = {
        project_name: exam.project_name,
        subject: exam.subject,
        exams: [],
      };
      projectMap.set(key, group);
      grouped.push(group);
    }
    projectMap.get(key)!.exams.push(exam);
  }

  const getScoreColor = (pct: number | null) => {
    if (pct === null) return "text-gray-400";
    if (pct >= 70) return "text-green-600";
    if (pct >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (pct: number | null) => {
    if (pct === null) return "bg-gray-100";
    if (pct >= 70) return "bg-green-50";
    if (pct >= 50) return "bg-yellow-50";
    return "bg-red-50";
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center">
          <GraduationCap className="h-6 w-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hola, {user?.full_name || "Estudiante"}
          </h1>
          <p className="text-gray-500 text-sm">
            Revisa tus examenes calificados y tu progreso.
          </p>
        </div>
      </div>

      {exams.length === 0 ? (
        <EmptyState
          icon={<FileCheck className="h-16 w-16" />}
          title="Sin examenes calificados"
          description="Tus examenes calificados apareceran aqui cuando esten disponibles."
        />
      ) : (
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {grouped.map((group) => (
            <motion.div key={group.project_name} variants={cardVariants}>
              <div className="mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {group.project_name}
                </h2>
                {group.subject && (
                  <p className="text-sm text-gray-500">{group.subject}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.exams.map((exam) => (
                  <motion.div key={exam.id} variants={cardVariants}>
                    <Card
                      className="overflow-hidden"
                      onClick={() =>
                        setExpandedExam(
                          expandedExam === exam.id ? null : exam.id
                        )
                      }
                    >
                      <CardBody className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Award
                              className={`h-5 w-5 ${getScoreColor(exam.grade_percentage)}`}
                            />
                            <span className="font-medium text-gray-900">
                              {exam.student_name || "Examen"}
                            </span>
                          </div>
                          {expandedExam === exam.id ? (
                            <ChevronUp className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          <div
                            className={`px-3 py-1.5 rounded-lg ${getScoreBg(exam.grade_percentage)}`}
                          >
                            <span
                              className={`text-lg font-bold ${getScoreColor(exam.grade_percentage)}`}
                            >
                              {exam.grade_percentage !== null
                                ? formatPercentage(exam.grade_percentage)
                                : "N/A"}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {exam.total_score !== null &&
                            exam.max_score !== null ? (
                              <span>
                                {exam.total_score} / {exam.max_score} pts
                              </span>
                            ) : (
                              <span>Sin puntaje</span>
                            )}
                          </div>
                        </div>

                        {exam.graded_at && (
                          <p className="text-xs text-gray-400">
                            Calificado: {formatDate(exam.graded_at)}
                          </p>
                        )}

                        {/* Expanded detail */}
                        <AnimatePresence>
                          {expandedExam === exam.id && exam.answers && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-gray-100 pt-3 mt-1 space-y-2">
                                <p className="text-xs font-medium text-gray-500 uppercase">
                                  Desglose por pregunta
                                </p>
                                {exam.answers.map((ans) => (
                                  <div
                                    key={ans.question_number}
                                    className="flex items-center justify-between text-sm"
                                  >
                                    <span className="text-gray-600">
                                      Pregunta {ans.question_number}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500">
                                        {ans.score}
                                        {ans.max_score !== null &&
                                          `/${ans.max_score}`}
                                      </span>
                                      {ans.is_correct !== null && (
                                        <span
                                          className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                            ans.is_correct
                                              ? "bg-green-100 text-green-700"
                                              : "bg-red-100 text-red-700"
                                          }`}
                                        >
                                          {ans.is_correct
                                            ? "Correcto"
                                            : "Incorrecto"}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
