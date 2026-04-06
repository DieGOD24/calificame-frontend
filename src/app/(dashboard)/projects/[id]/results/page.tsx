"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useProjects } from "@/hooks/useProjects";
import { GradingResults } from "@/components/projects/GradingResults";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Card, CardBody } from "@/components/ui/Card";
import { ArrowLeft, RefreshCw, Upload } from "lucide-react";
import toast from "react-hot-toast";

export default function ResultsPage() {
  const params = useParams();
  const id = params.id as string;
  const {
    currentProject: project,
    studentExams,
    summary,
    fetchProject,
    fetchStudentExams,
    fetchGradingSummary,
    fetchExamDetail,
    gradeExams,
    isLoading,
  } = useProjects();

  const [isRegrading, setIsRegrading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject(id).catch(() => {});
      fetchStudentExams(id).catch(() => {});
      fetchGradingSummary(id).catch(() => {});
    }
  }, [id, fetchProject, fetchStudentExams, fetchGradingSummary]);

  const handleFetchExamDetail = async (examId: string) => {
    return await fetchExamDetail(id, examId);
  };

  const handleRegrade = async () => {
    setIsRegrading(true);
    try {
      await gradeExams(id, true);
      await fetchStudentExams(id);
      await fetchGradingSummary(id);
      toast.success("Examenes recalificados exitosamente");
    } catch {
      toast.error("Error al recalificar");
    } finally {
      setIsRegrading(false);
    }
  };

  if (isLoading && studentExams.length === 0) {
    return (
      <div className="py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resultados</h1>
            {project && (
              <p className="text-gray-500 text-sm">{project.name}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegrade}
            isLoading={isRegrading}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Recalificar Todos
          </Button>
          <Link href={`/projects/${id}/upload-exams`}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Upload className="h-4 w-4" />}
            >
              Agregar Examenes
            </Button>
          </Link>
        </div>
      </div>

      <GradingResults
        exams={studentExams}
        summary={summary}
        onFetchExamDetail={handleFetchExamDetail}
        projectId={id}
        onExamsUpdated={() => {
          fetchStudentExams(id);
          fetchGradingSummary(id);
        }}
      />

      {/* Regrading overlay */}
      {isRegrading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <Card>
            <CardBody className="text-center py-8 px-12">
              <Spinner size="lg" />
              <p className="mt-4 font-medium text-gray-900">
                Recalificando examenes...
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Esto puede tardar unos minutos.
              </p>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}
