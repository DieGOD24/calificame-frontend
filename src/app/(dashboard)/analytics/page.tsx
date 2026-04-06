"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { getProjectAnalytics } from "@/lib/api";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  FileCheck,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

interface AnalyticsData {
  total_exams: number;
  average_score: number | null;
  average_percentage: number | null;
  pass_rate: number | null;
  highest_score: number | null;
  lowest_score: number | null;
  score_distribution: { range: string; count: number }[];
  question_stats: {
    question_number: number;
    success_rate: number;
    question_text?: string;
  }[];
}

function AnimatedCounter({
  value,
  suffix = "",
  decimals = 0,
}: {
  value: number;
  suffix?: string;
  decimals?: number;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | null>(null);

  useEffect(() => {
    const duration = 800;
    const start = Date.now();
    const from = 0;

    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (value - from) * eased);
      if (progress < 1) {
        ref.current = requestAnimationFrame(tick);
      }
    };

    ref.current = requestAnimationFrame(tick);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [value]);

  return (
    <span>
      {decimals > 0 ? display.toFixed(decimals) : Math.round(display)}
      {suffix}
    </span>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { projects, fetchProjects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  const allowedRoles = ["developer", "admin", "institution", "professor"];
  const hasAccess = user && allowedRoles.includes(user.role);

  useEffect(() => {
    if (hasAccess) {
      fetchProjects(1, 100)
        .catch(() => {})
        .finally(() => setIsLoadingProjects(false));
    } else {
      setIsLoadingProjects(false);
    }
  }, [hasAccess, fetchProjects]);

  useEffect(() => {
    if (!selectedProjectId) {
      setAnalytics(null);
      return;
    }
    setIsLoading(true);
    getProjectAnalytics(selectedProjectId)
      .then((res) => setAnalytics(res.data))
      .catch(() => toast.error("Error al cargar analiticas"))
      .finally(() => setIsLoading(false));
  }, [selectedProjectId]);

  if (!hasAccess) {
    return (
      <div className="py-16">
        <EmptyState
          title="Acceso restringido"
          description="No tienes permisos para ver esta seccion."
        />
      </div>
    );
  }

  const maxDistCount = analytics?.score_distribution
    ? Math.max(...analytics.score_distribution.map((d) => d.count), 1)
    : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analiticas</h1>
        <p className="text-gray-500 mt-1">
          Visualiza el rendimiento de tus proyectos.
        </p>
      </div>

      {/* Project Selector */}
      <div className="max-w-sm relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Seleccionar Proyecto
        </label>
        {isLoadingProjects ? (
          <Spinner size="sm" />
        ) : (
          <div className="relative">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full appearance-none px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="">-- Selecciona un proyecto --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {!selectedProjectId && (
        <EmptyState
          icon={<BarChart3 className="h-16 w-16" />}
          title="Selecciona un proyecto"
          description="Elige un proyecto del menu desplegable para ver sus analiticas."
        />
      )}

      {isLoading && (
        <div className="py-16">
          <Spinner size="lg" />
        </div>
      )}

      {analytics && !isLoading && (
        <motion.div
          className="space-y-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Summary Cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            variants={itemVariants}
          >
            <Card>
              <CardBody className="flex items-center gap-4">
                <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <FileCheck className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    <AnimatedCounter value={analytics.total_exams} />
                  </p>
                  <p className="text-sm text-gray-500">Total Examenes</p>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex items-center gap-4">
                <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.average_percentage !== null ? (
                      <AnimatedCounter
                        value={analytics.average_percentage}
                        suffix="%"
                        decimals={1}
                      />
                    ) : (
                      "N/A"
                    )}
                  </p>
                  <p className="text-sm text-gray-500">Promedio</p>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex items-center gap-4">
                <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.pass_rate !== null ? (
                      <AnimatedCounter
                        value={analytics.pass_rate}
                        suffix="%"
                        decimals={1}
                      />
                    ) : (
                      "N/A"
                    )}
                  </p>
                  <p className="text-sm text-gray-500">Tasa de Aprobacion</p>
                </div>
              </CardBody>
            </Card>
            <Card>
              <CardBody className="flex items-center gap-4">
                <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <TrendingDown className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.highest_score !== null
                      ? `${analytics.highest_score}`
                      : "N/A"}
                    {analytics.highest_score !== null &&
                      analytics.lowest_score !== null && (
                        <span className="text-sm font-normal text-gray-400">
                          {" "}
                          / {analytics.lowest_score}
                        </span>
                      )}
                  </p>
                  <p className="text-sm text-gray-500">Mayor / Menor</p>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Score Distribution */}
          {analytics.score_distribution &&
            analytics.score_distribution.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Distribucion de Puntajes
                    </h2>
                  </CardHeader>
                  <CardBody>
                    <div className="flex items-end gap-2 h-48">
                      {analytics.score_distribution.map((bucket, i) => (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center gap-1"
                        >
                          <span className="text-xs text-gray-500 font-medium">
                            {bucket.count}
                          </span>
                          <motion.div
                            className="w-full bg-indigo-500 rounded-t-sm"
                            initial={{ height: 0 }}
                            animate={{
                              height: `${(bucket.count / maxDistCount) * 100}%`,
                            }}
                            transition={{ duration: 0.5, delay: i * 0.05 }}
                            style={{ minHeight: bucket.count > 0 ? 4 : 0 }}
                          />
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {bucket.range}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}

          {/* Question Difficulty Table */}
          {analytics.question_stats && analytics.question_stats.length > 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Dificultad por Pregunta
                  </h2>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-gray-500">
                        <th className="px-6 py-3 font-medium">Pregunta</th>
                        <th className="px-6 py-3 font-medium">
                          Tasa de Acierto
                        </th>
                        <th className="px-6 py-3 font-medium w-1/2">
                          Barra
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.question_stats.map((q) => {
                        const rate = q.success_rate;
                        const color =
                          rate >= 70
                            ? "bg-green-500"
                            : rate >= 40
                              ? "bg-yellow-500"
                              : "bg-red-500";
                        return (
                          <tr
                            key={q.question_number}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="px-6 py-3 text-gray-900 font-medium">
                              #{q.question_number}
                            </td>
                            <td className="px-6 py-3 text-gray-700">
                              {rate.toFixed(1)}%
                            </td>
                            <td className="px-6 py-3">
                              <div className="w-full bg-gray-100 rounded-full h-3">
                                <motion.div
                                  className={`h-3 rounded-full ${color}`}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${rate}%` }}
                                  transition={{
                                    duration: 0.6,
                                    delay: q.question_number * 0.03,
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
