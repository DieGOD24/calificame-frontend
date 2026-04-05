"use client";

import React, { useState, useCallback } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Upload } from "lucide-react";

interface ExamUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  isLoading?: boolean;
}

export function ExamUploader({ onUpload, isLoading = false }: ExamUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);

    try {
      await onUpload(files);
      setUploadProgress(100);
      setFiles([]);
    } catch {
      // Error handled in parent
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  return (
    <div className="space-y-4">
      <FileUpload
        onFilesSelected={handleFilesSelected}
        multiple
        maxFiles={50}
        files={files}
        onRemoveFile={handleRemoveFile}
        disabled={isUploading}
      />

      {isUploading && (
        <ProgressBar
          value={uploadProgress}
          label="Subiendo examenes..."
          showPercentage
          color="indigo"
        />
      )}

      {files.length > 0 && !isUploading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {files.length} archivo(s) seleccionado(s)
          </p>
          <Button
            onClick={handleUpload}
            isLoading={isLoading}
            leftIcon={<Upload className="h-4 w-4" />}
          >
            Subir Examenes
          </Button>
        </div>
      )}
    </div>
  );
}
