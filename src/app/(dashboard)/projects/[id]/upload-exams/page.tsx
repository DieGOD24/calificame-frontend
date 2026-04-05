"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useProjects } from "@/hooks/useProjects";
import { ExamUploader } from "@/components/projects/ExamUploader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import toast from "react-hot-toast";
import { ArrowLeft, Play, FileText } from "lucide-react";

export default function UploadExamsPage() {
  const params = useParams();
  const router = useRouter();
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

  const handleGrade = async () => {
    try {
      await gradeExams(id);
      toast.success("Calificacion iniciada");
      router.push(`/projects/${id}/results`);
    } catch {
      toast.error("Error al iniciar la calificacion");
    }
  };

  if (isLoading && !project) {
    return (
      <div className="py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/projects/${id}`}>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Subir Examenes de Alumnos
        </h1>
      </div>

      <p className="text-gray-500">
        Sube los examenes de tus alumnos en formato PDF o imagen. Puedes subir
        multiples archivos a la vez.
      </p>

      {/* Upload section */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Subir Examenes</h2>
        </CardHeader>
        <CardBody>
          <ExamUploader onUpload={handleUpload} isLoading={isLoading} />
        </CardBody>
      </Card>

      {/* Uploaded exams list */}
      {studentExams.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">
                Examenes Subidos ({studentExams.length})
              </h2>
              <Button
                onClick={handleGrade}
                isLoading={isLoading}
                leftIcon={<Play className="h-4 w-4" />}
              >
                Calificar Todos
              </Button>
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
                    <FileText className="h-5 w-5 text-indigo-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {exam.student_name ||
                          exam.original_filename ||
                          "Examen"}
                      </p>
                      {exam.student_identifier && (
                        <p className="text-xs text-gray-400">
                          ID: {exam.student_identifier}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge status={exam.status} />
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
