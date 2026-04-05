"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useProjects } from "@/hooks/useProjects";
import { GradingResults } from "@/components/projects/GradingResults";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ArrowLeft } from "lucide-react";

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
    isLoading,
  } = useProjects();

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

  if (isLoading && studentExams.length === 0) {
    return (
      <div className="py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/projects/${id}`}>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
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

      <GradingResults
        exams={studentExams}
        summary={summary}
        onFetchExamDetail={handleFetchExamDetail}
      />
    </div>
  );
}
