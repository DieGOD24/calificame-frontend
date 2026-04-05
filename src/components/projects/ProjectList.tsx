"use client";

import React from "react";
import Link from "next/link";
import { ProjectCard } from "./ProjectCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import type { Project } from "@/types/project";
import { FolderOpen, Plus } from "lucide-react";

interface ProjectListProps {
  projects: Project[];
  isLoading: boolean;
}

export function ProjectList({ projects, isLoading }: ProjectListProps) {
  if (isLoading) {
    return (
      <div className="py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<FolderOpen className="h-16 w-16" />}
        title="No tienes proyectos aun"
        description="Crea tu primer proyecto para comenzar a calificar examenes automaticamente."
        action={
          <Link href="/projects/new">
            <Button leftIcon={<Plus className="h-4 w-4" />}>
              Crear Proyecto
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
