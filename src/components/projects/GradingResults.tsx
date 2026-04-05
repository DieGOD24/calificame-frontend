"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatPercentage } from "@/lib/utils";
import { ExamDetailModal } from "./ExamDetailModal";
import type { StudentExam, GradingSummary } from "@/types/project";
import { BarChart3, Download, Eye, ArrowUpDown } from "lucide-react";

interface GradingResultsProps {
  exams: StudentExam[];
  summary: GradingSummary | null;
  onFetchExamDetail: (examId: string) => Promise<StudentExam>;
}

type SortField = "student_name" | "total_score" | "grade_percentage" | "status";
type SortDirection = "asc" | "desc";

export function GradingResults({
  exams,
  summary,
  onFetchExamDetail,
}: GradingResultsProps) {
  const [selectedExam, setSelectedExam] = useState<StudentExam | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [sortField, setSortField] = useState<SortField>("student_name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleViewDetail = async (exam: StudentExam) => {
    setIsLoadingDetail(true);
    try {
      const detail = await onFetchExamDetail(exam.id);
      setSelectedExam(detail);
      setIsModalOpen(true);
    } catch {
      // Error handled in hook
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedExams = [...exams].sort((a, b) => {
    const dir = sortDirection === "asc" ? 1 : -1;
    switch (sortField) {
      case "student_name":
        return dir * (a.student_name || "").localeCompare(b.student_name || "");
      case "total_score":
        return dir * ((a.total_score || 0) - (b.total_score || 0));
      case "grade_percentage":
        return dir * ((a.grade_percentage || 0) - (b.grade_percentage || 0));
      case "status":
        return dir * a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const handleExport = () => {
    const headers = [
      "Alumno",
      "Identificador",
      "Puntaje",
      "Puntaje Maximo",
      "Porcentaje",
      "Estado",
    ];
    const rows = exams.map((e) => [
      e.student_name || "Sin nombre",
      e.student_identifier || "-",
      e.total_score?.toString() || "-",
      e.max_score?.toString() || "-",
      e.grade_percentage !== null ? `${e.grade_percentage.toFixed(1)}%` : "-",
      e.status,
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "resultados.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (exams.length === 0) {
    return (
      <EmptyState
        icon={<BarChart3 className="h-16 w-16" />}
        title="Sin resultados aun"
        description="Los resultados apareceran aqui una vez que se califiquen los examenes."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardBody className="text-center py-3">
              <p className="text-2xl font-bold text-gray-900">
                {summary.total_exams}
              </p>
              <p className="text-xs text-gray-500">Total Examenes</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-3">
              <p className="text-2xl font-bold text-green-600">
                {summary.graded_count}
              </p>
              <p className="text-xs text-gray-500">Calificados</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-3">
              <p className="text-2xl font-bold text-indigo-600">
                {formatPercentage(summary.average_percentage)}
              </p>
              <p className="text-xs text-gray-500">Promedio</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center py-3">
              <p className="text-2xl font-bold text-gray-900">
                {summary.highest_score !== null ? summary.highest_score : "N/A"}{" "}
                /{" "}
                {summary.lowest_score !== null ? summary.lowest_score : "N/A"}
              </p>
              <p className="text-xs text-gray-500">Mayor / Menor</p>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Results table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Resultados de Examenes
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              leftIcon={<Download className="h-4 w-4" />}
            >
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button
                    className="flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900"
                    onClick={() => handleSort("student_name")}
                  >
                    Alumno
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Identificador
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    className="flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900"
                    onClick={() => handleSort("total_score")}
                  >
                    Puntaje
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    className="flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900"
                    onClick={() => handleSort("grade_percentage")}
                  >
                    Porcentaje
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    className="flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900"
                    onClick={() => handleSort("status")}
                  >
                    Estado
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </button>
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {exam.student_name || "Sin nombre"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {exam.student_identifier || "-"}
                  </td>
                  <td className="px-4 py-3 text-gray-900">
                    {exam.total_score !== null
                      ? `${exam.total_score}/${exam.max_score}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        exam.grade_percentage !== null &&
                        exam.grade_percentage >= 60
                          ? "text-green-600 font-medium"
                          : "text-red-600 font-medium"
                      }
                    >
                      {formatPercentage(exam.grade_percentage)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge status={exam.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(exam)}
                      isLoading={isLoadingDetail}
                      leftIcon={<Eye className="h-4 w-4" />}
                    >
                      Ver
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ExamDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedExam(null);
        }}
        exam={selectedExam}
      />
    </div>
  );
}
