"use client";

import React, { useState, useCallback, useRef } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { analyzePdfImages, generatePdf } from "@/lib/api";
import {
  Upload,
  ImageIcon,
  GripVertical,
  Trash2,
  Check,
  RefreshCw,
  Download,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface PhotoItem {
  id: string;
  file: File;
  preview: string;
  croppedPreview?: string;
  showOriginal: boolean;
  status: "pending" | "analyzing" | "done" | "error";
}

const steps = [
  { num: 1, label: "Subir Fotos" },
  { num: 2, label: "Previsualizar" },
  { num: 3, label: "Ordenar" },
  { num: 4, label: "Generar PDF" },
];

const stepVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

export default function PdfGeneratorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const newPhotos: PhotoItem[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      showOriginal: true,
      status: "pending" as const,
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removePhoto = (id: string) => {
    setPhotos((prev) => {
      const p = prev.find((x) => x.id === id);
      if (p) URL.revokeObjectURL(p.preview);
      return prev.filter((x) => x.id !== id);
    });
  };

  const analyzePhotos = async () => {
    setIsAnalyzing(true);
    try {
      const filesToAnalyze = photos.filter((p) => p.status === "pending");
      if (filesToAnalyze.length === 0) {
        setCurrentStep(2);
        setIsAnalyzing(false);
        return;
      }
      await analyzePdfImages(filesToAnalyze.map((p) => p.file));
      setPhotos((prev) =>
        prev.map((p) =>
          p.status === "pending" ? { ...p, status: "done" as const } : p
        )
      );
      setCurrentStep(2);
      toast.success("Fotos analizadas correctamente");
    } catch {
      setPhotos((prev) =>
        prev.map((p) =>
          p.status === "pending" ? { ...p, status: "error" as const } : p
        )
      );
      toast.error("Error al analizar fotos");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const retryPhoto = async (id: string) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "done" as const } : p))
    );
    toast.success("Foto aceptada");
  };

  const handleSortDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleSortDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleSortDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    setPhotos((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, moved);
      return updated;
    });
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await generatePdf(photos.map((p) => p.file));
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "documento.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF generado y descargado");
    } catch {
      toast.error("Error al generar PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Generador de PDF</h1>
        <p className="text-gray-500 mt-1">
          Convierte fotos en un documento PDF organizado.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2">
        {steps.map((step, i) => (
          <React.Fragment key={step.num}>
            <button
              onClick={() => {
                if (step.num <= currentStep) setCurrentStep(step.num);
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentStep === step.num
                  ? "bg-indigo-100 text-indigo-700"
                  : currentStep > step.num
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              <span
                className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentStep === step.num
                    ? "bg-indigo-600 text-white"
                    : currentStep > step.num
                      ? "bg-green-600 text-white"
                      : "bg-gray-300 text-white"
                }`}
              >
                {currentStep > step.num ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  step.num
                )}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {i < steps.length - 1 && (
              <ChevronRight className="h-4 w-4 text-gray-300" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors"
            >
              <Upload className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                Arrastra fotos aqui o haz clic para seleccionar
              </p>
              <p className="text-sm text-gray-400 mt-1">
                JPG, PNG, HEIC, PDF
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={(e) => {
                  if (e.target.files) handleFiles(e.target.files);
                }}
                className="hidden"
              />
            </div>

            {photos.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  {photos.length} foto(s) seleccionada(s)
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 group"
                    >
                      <img
                        src={photo.preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(photo.id);
                        }}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={analyzePhotos}
                    isLoading={isAnalyzing}
                    rightIcon={<ChevronRight className="h-4 w-4" />}
                  >
                    Analizar y Continuar
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            <p className="text-sm text-gray-500">
              Revisa las fotos. Puedes alternar entre original y recortada,
              aceptar, reintentar o eliminar cada foto.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <Card key={photo.id}>
                  <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden rounded-t-xl">
                    <img
                      src={
                        photo.showOriginal
                          ? photo.preview
                          : (photo.croppedPreview ?? photo.preview)
                      }
                      alt="Foto"
                      className="w-full h-full object-cover"
                    />
                    {photo.status === "error" && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <span className="text-sm font-medium text-red-700 bg-white px-2 py-1 rounded">
                          Error
                        </span>
                      </div>
                    )}
                  </div>
                  <CardBody className="flex items-center justify-between gap-1 py-2 px-3">
                    <button
                      onClick={() =>
                        setPhotos((prev) =>
                          prev.map((p) =>
                            p.id === photo.id
                              ? { ...p, showOriginal: !p.showOriginal }
                              : p
                          )
                        )
                      }
                      className="p-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                      title={
                        photo.showOriginal ? "Ver recortada" : "Ver original"
                      }
                    >
                      {photo.showOriginal ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() =>
                        setPhotos((prev) =>
                          prev.map((p) =>
                            p.id === photo.id
                              ? { ...p, status: "done" as const }
                              : p
                          )
                        )
                      }
                      className="p-1.5 rounded text-green-500 hover:text-green-700 hover:bg-green-50"
                      title="Aceptar"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => retryPhoto(photo.id)}
                      className="p-1.5 rounded text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      title="Reintentar"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="p-1.5 rounded text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </CardBody>
                </Card>
              ))}
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(1)}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Atras
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Continuar
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            <p className="text-sm text-gray-500">
              Arrastra las fotos para cambiar el orden en el PDF final.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  draggable
                  onDragStart={() => handleSortDragStart(index)}
                  onDragOver={(e) => handleSortDragOver(e, index)}
                  onDrop={() => handleSortDrop(index)}
                  onDragEnd={() => {
                    setDraggedIndex(null);
                    setDragOverIndex(null);
                  }}
                  className={`relative rounded-xl overflow-hidden border-2 transition-colors cursor-grab active:cursor-grabbing ${
                    dragOverIndex === index
                      ? "border-indigo-400 bg-indigo-50"
                      : draggedIndex === index
                        ? "border-indigo-300 opacity-50"
                        : "border-gray-200"
                  }`}
                >
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-white/90 rounded-md px-1.5 py-0.5 text-xs font-medium text-gray-600">
                    <GripVertical className="h-3 w-3" />
                    {index + 1}
                  </div>
                  <div className="aspect-[3/4] bg-gray-100">
                    <img
                      src={photo.croppedPreview ?? photo.preview}
                      alt={`Pagina ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(2)}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Atras
              </Button>
              <Button
                onClick={() => setCurrentStep(4)}
                rightIcon={<ChevronRight className="h-4 w-4" />}
              >
                Continuar
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 4 && (
          <motion.div
            key="step4"
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">
                  Resumen
                </h2>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                  <span>
                    {photos.length} pagina(s) en el documento
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {photos.map((photo, i) => (
                    <div
                      key={photo.id}
                      className="h-20 w-16 rounded-md overflow-hidden border border-gray-200 bg-gray-100"
                    >
                      <img
                        src={photo.croppedPreview ?? photo.preview}
                        alt={`p${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between pt-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep(3)}
                    leftIcon={<ChevronLeft className="h-4 w-4" />}
                  >
                    Atras
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    isLoading={isGenerating}
                    leftIcon={<Download className="h-4 w-4" />}
                  >
                    Generar y Descargar PDF
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
