"use client";

import React from "react";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/types/project";
import { FolderOpen, FileText, CheckCircle } from "lucide-react";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardBody>
          <div className="flex items-start justify-between mb-3">
            <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <FolderOpen className="h-5 w-5 text-indigo-600" />
            </div>
            <Badge status={project.status} />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
            {project.name}
          </h3>

          {project.subject && (
            <p className="text-sm text-indigo-600 mb-2">{project.subject}</p>
          )}

          {project.description && (
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">
              {project.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-400 mt-auto pt-3 border-t border-gray-100">
            {project.questions_count !== undefined && (
              <span className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                {project.questions_count} preguntas
              </span>
            )}
            {project.exams_count !== undefined && (
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3.5 w-3.5" />
                {project.graded_count || 0}/{project.exams_count} calificados
              </span>
            )}
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Creado: {formatDate(project.created_at)}
          </p>
        </CardBody>
      </Card>
    </Link>
  );
}
