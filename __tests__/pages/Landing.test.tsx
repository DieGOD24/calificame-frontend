import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

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

// Mock next/font/google
vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "--font-inter" }),
}));

import HomePage from "@/app/page";

describe("Landing Page", () => {
  it("renders the Hero section with title", () => {
    render(<HomePage />);
    expect(
      screen.getByText(/califica examenes en/i)
    ).toBeInTheDocument();
  });

  it("renders the hero CTA buttons", () => {
    render(<HomePage />);
    expect(screen.getByText(/comenzar gratis/i)).toBeInTheDocument();
    // "Iniciar Sesion" appears in both hero and footer
    const iniciarSesionElements = screen.getAllByText(/iniciar sesion/i);
    expect(iniciarSesionElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the Features section", () => {
    render(<HomePage />);
    expect(
      screen.getByText(/todo lo que necesitas para calificar/i)
    ).toBeInTheDocument();
  });

  it("renders feature items", () => {
    render(<HomePage />);
    expect(screen.getByText(/subida facil/i)).toBeInTheDocument();
    expect(screen.getByText(/ocr avanzado/i)).toBeInTheDocument();
    expect(screen.getByText(/calificacion con ia/i)).toBeInTheDocument();
    expect(screen.getByText(/reportes detallados/i)).toBeInTheDocument();
    expect(screen.getByText(/revision humana/i)).toBeInTheDocument();
    expect(screen.getByText(/ahorra tiempo/i)).toBeInTheDocument();
  });

  it("renders the How It Works section", () => {
    render(<HomePage />);
    // "Como Funciona" appears in both the section heading and footer link
    const comoFuncionaElements = screen.getAllByText(/como funciona/i);
    expect(comoFuncionaElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the how it works steps", () => {
    render(<HomePage />);
    expect(screen.getByText(/crea tu proyecto/i)).toBeInTheDocument();
    // "Sube el Solucionario" appears in both title and description
    const solucionarioElements = screen.getAllByText(/sube el solucionario/i);
    expect(solucionarioElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/revisa y confirma/i)).toBeInTheDocument();
    // "Sube los Examenes" may appear in both title and description
    const examenesElements = screen.getAllByText(/sube los examenes/i);
    expect(examenesElements.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/obtiene resultados/i)).toBeInTheDocument();
  });

  it("renders the Footer section", () => {
    render(<HomePage />);
    expect(
      screen.getByText(/todos los derechos reservados/i)
    ).toBeInTheDocument();
  });

  it("renders footer links", () => {
    render(<HomePage />);
    const registerLinks = screen.getAllByText(/registrarse/i);
    expect(registerLinks.length).toBeGreaterThan(0);
  });

  it("renders CTA link to register page", () => {
    render(<HomePage />);
    const links = screen.getAllByRole("link");
    const registerLink = links.find(
      (link) => link.getAttribute("href") === "/register"
    );
    expect(registerLink).toBeDefined();
  });
});
