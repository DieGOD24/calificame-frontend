import { Page } from "@playwright/test";

export const mockUser = {
  id: "user-1",
  email: "professor@calificame.com",
  full_name: "Test Professor",
  role: "professor",
  is_active: true,
  created_at: "2025-01-01T00:00:00Z",
};

export const mockAdminUser = {
  ...mockUser,
  id: "admin-1",
  email: "admin@calificame.com",
  full_name: "Admin User",
  role: "admin",
};

export const mockDeveloperUser = {
  ...mockUser,
  id: "dev-1",
  email: "dev@calificame.com",
  full_name: "Developer User",
  role: "developer",
};

export const mockStudentUser = {
  ...mockUser,
  id: "student-1",
  email: "student@calificame.com",
  full_name: "Test Student",
  role: "student",
};

export const mockProject = {
  id: "project-1",
  owner_id: "user-1",
  name: "Examen Final Matematicas",
  description: "Examen del semestre",
  subject: "Matematicas",
  status: "draft",
  config: {
    exam_type: "mixed",
    total_questions: 10,
    points_per_question: 1.0,
    has_multiple_pages: false,
  },
  created_at: "2025-06-01T00:00:00Z",
  updated_at: "2025-06-01T00:00:00Z",
  question_count: 0,
  student_exam_count: 0,
};

export const mockProjects = {
  items: [
    mockProject,
    {
      ...mockProject,
      id: "project-2",
      name: "Quiz Fisica",
      subject: "Fisica",
      status: "completed",
      question_count: 5,
      student_exam_count: 15,
    },
  ],
  total: 2,
  page: 1,
  page_size: 20,
};

export async function loginAsMock(page: Page, user = mockUser) {
  // Mock auth/me BEFORE any navigation
  await page.route("**/api/v1/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(user),
    });
  });

  // Set localStorage BEFORE the page loads using addInitScript
  await page.addInitScript(() => {
    localStorage.setItem("access_token", "mock-jwt-token");
  });
}

export async function setupProjectRoutes(page: Page) {
  await page.route("**/api/v1/projects**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // Don't intercept sub-resource routes like /projects/id/exams, /projects/id/grading, etc.
    const projectSubRoute = url.match(/\/projects\/[^/?]+\//);
    if (projectSubRoute) {
      await route.continue();
      return;
    }

    if (method === "GET") {
      // Single project GET: /projects/project-1
      if (url.match(/\/projects\/[^/?]+$/)) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockProject),
        });
      } else {
        // List endpoint: /projects or /projects?page=...
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(mockProjects),
        });
      }
    } else if (method === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify(mockProject),
      });
    } else {
      await route.continue();
    }
  });
}
