"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/lib/utils";
import { Upload, FileText, X } from "lucide-react";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  files?: File[];
  onRemoveFile?: (index: number) => void;
  className?: string;
  disabled?: boolean;
}

const defaultAccept = {
  "application/pdf": [".pdf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

export function FileUpload({
  onFilesSelected,
  accept = defaultAccept,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  files = [],
  onRemoveFile,
  className,
  disabled = false,
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesSelected(acceptedFiles);
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept,
      maxFiles,
      maxSize,
      multiple,
      disabled,
    });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} aria-label="Subir archivos" />
        <Upload
          className={cn(
            "mx-auto h-10 w-10 mb-3",
            isDragActive ? "text-indigo-500" : "text-gray-400"
          )}
        />
        {isDragActive ? (
          <p className="text-indigo-600 font-medium">
            Suelta los archivos aqui...
          </p>
        ) : (
          <div>
            <p className="text-gray-600 font-medium">
              Arrastra y suelta archivos aqui
            </p>
            <p className="text-sm text-gray-400 mt-1">
              o haz clic para seleccionar archivos
            </p>
            <p className="text-xs text-gray-400 mt-2">
              PDF, PNG o JPG (max. {formatFileSize(maxSize)})
            </p>
          </div>
        )}
      </div>

      {fileRejections.length > 0 && (
        <div className="text-sm text-red-600" role="alert">
          {fileRejections.map(({ file, errors }, index) => (
            <p key={index}>
              {file.name}: {errors.map((e) => e.message).join(", ")}
            </p>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <ul className="space-y-2" aria-label="Archivos seleccionados">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-5 w-5 text-indigo-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
              {onRemoveFile && (
                <button
                  type="button"
                  onClick={() => onRemoveFile(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  aria-label={`Eliminar ${file.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
