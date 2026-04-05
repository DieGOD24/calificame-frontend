import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import type { Project } from "@/types/project";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const mockProject: Project = {
  id: "project-1",
  owner_id: "user-1",
  name: "Examen Final Matematicas",
  description: "Examen de fin de semestre",
  subject: "Matematicas",
  status: "confirmed",
  config: {
    exam_type: "multiple_choice",
    total_questions: 20,
    points_per_question: 5,
    has_multiple_pages: false,
  },
  created_at: "2026-03-15T10:00:00Z",
  updated_at: "2026-03-20T14:30:00Z",
  questions_count: 20,
  exams_count: 30,
  graded_count: 15,
};

describe("ProjectCard", () => {
  it("renders project name", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText("Examen Final Matematicas")).toBeInTheDocument();
  });

  it("renders project subject", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText("Matematicas")).toBeInTheDocument();
  });

  it("renders project description", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText("Examen de fin de semestre")).toBeInTheDocument();
  });

  it("renders status badge", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText("Confirmado")).toBeInTheDocument();
  });

  it("renders questions count", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText("20 preguntas")).toBeInTheDocument();
  });

  it("renders graded count", () => {
    render(<ProjectCard project={mockProject} />);
    expect(screen.getByText("15/30 calificados")).toBeInTheDocument();
  });

  it("links to project detail page", () => {
    render(<ProjectCard project={mockProject} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/projects/project-1");
  });

  it("renders created date", () => {
    render(<ProjectCard project={mockProject} />);
    // Spanish date format
    expect(screen.getByText(/Creado:/)).toBeInTheDocument();
  });
});
