"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useProjects } from "@/hooks/useProjects";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  Plus,
  FolderOpen,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const { projects, fetchProjects, isLoading } = useProjects();
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchProjects(1, 50).then((data) => {
      if (data) {
        const items = data.items;
        setStats({
          total: items.length,
          active: items.filter(
            (p) => p.status !== "completed" && p.status !== "draft"
          ).length,
          completed: items.filter((p) => p.status === "completed").length,
        });
      }
    }).catch(() => {});
  }, [fetchProjects]);

  const recentProjects = (projects || []).slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t("dashboard.welcome")}, {user?.full_name || "Usuario"}
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900 rounded-xl flex items-center justify-center">
              <FolderOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">{t("dashboard.totalProjects")}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-sm text-gray-500">{t("dashboard.activeProjects")}</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              <p className="text-sm text-gray-500">{t("dashboard.completedProjects")}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex gap-3">
        <Link href="/projects/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            {t("projects.new")}
          </Button>
        </Link>
        <Link href="/projects">
          <Button variant="outline" rightIcon={<ArrowRight className="h-4 w-4" />}>
            {t("nav.projects")}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("dashboard.recentProjects")}
            </h2>
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                {t("nav.projects")}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <Spinner />
          ) : recentProjects.length === 0 ? (
            <EmptyState
              title={t("dashboard.noProjects")}
              description={t("dashboard.createFirst")}
              action={
                <Link href="/projects/new">
                  <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
                    {t("projects.create")}
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
