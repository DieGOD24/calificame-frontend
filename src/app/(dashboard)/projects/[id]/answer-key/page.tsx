"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjects } from "@/hooks/useProjects";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FileUpload } from "@/components/ui/FileUpload";
import { Spinner } from "@/components/ui/Spinner";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import { ArrowLeft, FileText, Upload } from "lucide-react";
import Link from "next/link";

export default function AnswerKeyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const {
    currentProject: project,
    answerKeys,
    fetchProject,
    fetchAnswerKeys,
    uploadAnswerKey,
    processAnswerKey,
    isLoading,
  } = useProjects();

  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    if (id) {
      fetchProject(id).catch(() => {});
      fetchAnswerKeys(id).catch(() => {});
    }
  }, [id, fetchProject, fetchAnswerKeys]);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) return;
    try {
      await uploadAnswerKey(id, files[0]);
      toast.success("Solucionario subido exitosamente");
      setFiles([]);
      fetchProject(id);
      fetchAnswerKeys(id);
    } catch {
      toast.error("Error al subir el solucionario");
    }
  };

  const handleProcess = async () => {
    try {
      await processAnswerKey(id);
      toast.success("Solucionario procesado. Revisa las preguntas extraidas.");
      router.push(`/projects/${id}/confirm`);
    } catch {
      toast.error("Error al procesar el solucionario");
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/projects/${id}`}>
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Volver
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Solucionario</h1>
      </div>

      {/* Existing answer keys */}
      {answerKeys.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">
              Solucionarios Subidos
            </h2>
          </CardHeader>
          <CardBody>
            <ul className="space-y-3">
              {answerKeys.map((ak) => (
                <li
                  key={ak.id}
                  className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-indigo-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {ak.original_filename || "Solucionario"}
                      </p>
                      <p className="text-xs text-gray-400">
                        {ak.file_type} | {formatDate(ak.created_at)}
                      </p>
                    </div>
                  </div>
                  <Badge
                    label={ak.is_processed ? "Procesado" : "Sin procesar"}
                    className={
                      ak.is_processed
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }
                  />
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      )}

      {/* Upload new */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">
            Subir Solucionario
          </h2>
          <p className="text-sm text-gray-500">
            Sube el solucionario en formato PDF o imagen.
          </p>
        </CardHeader>
        <CardBody>
          <FileUpload
            onFilesSelected={handleFilesSelected}
            files={files}
            onRemoveFile={handleRemoveFile}
            maxFiles={1}
          />
          {files.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleUpload}
                isLoading={isLoading}
                leftIcon={<Upload className="h-4 w-4" />}
              >
                Subir Solucionario
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Process button */}
      {project?.status === "answer_key_uploaded" && (
        <Card>
          <CardBody>
            <p className="text-gray-500 mb-4">
              El solucionario esta listo para ser procesado. Esto extraera las
              preguntas y respuestas automaticamente.
            </p>
            <Button onClick={handleProcess} isLoading={isLoading}>
              Procesar Solucionario
            </Button>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
