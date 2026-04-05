"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useProjects } from "@/hooks/useProjects";
import { ProjectList } from "@/components/projects/ProjectList";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default function ProjectsPage() {
  const { projects, fetchProjects, isLoading } = useProjects();

  useEffect(() => {
    fetchProjects().catch(() => {
      // Error handled in hook
    });
  }, [fetchProjects]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Proyectos</h1>
          <p className="text-gray-500 mt-1">
            Gestiona todos tus proyectos de calificacion.
          </p>
        </div>
        <Link href="/projects/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>
            Nuevo Proyecto
          </Button>
        </Link>
      </div>

      <ProjectList projects={projects} isLoading={isLoading} />
    </div>
  );
}
