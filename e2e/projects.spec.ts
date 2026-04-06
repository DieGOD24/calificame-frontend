import { test, expect } from "@playwright/test";
import { loginAsMock, setupProjectRoutes, mockProject, mockProjects } from "./helpers";

test.describe("Projects", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMock(page);
    await setupProjectRoutes(page);
  });

  test("authenticated user sees projects list", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByText("Examen Final Matematicas")).toBeVisible();
    await expect(page.getByText("Quiz Fisica")).toBeVisible();
  });

  test("shows project count in list", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByText(/2/)).toBeVisible();
  });

  test("user can navigate to new project page", async ({ page }) => {
    await page.goto("/projects");
    await page.getByRole("link", { name: /nuevo|new|crear/i }).click();
    await expect(page).toHaveURL(/\/projects\/new/);
  });

  test("new project wizard shows step 1", async ({ page }) => {
    await page.route("**/api/v1/projects", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(mockProject),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/projects/new");
    await expect(page.getByText(/informacion|information|basica/i)).toBeVisible();
  });

  test("new project wizard validates required fields", async ({ page }) => {
    await page.goto("/projects/new");
    await page.getByRole("button", { name: /continuar|continue/i }).click();
    // Name is required
    await expect(page.locator("form")).toContainText(/obligatorio|required|nombre/i);
  });

  test("can fill step 1 and advance to step 2", async ({ page }) => {
    await page.route("**/api/v1/projects", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(mockProject),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto("/projects/new");
    await page.getByLabel(/nombre/i).fill("Nuevo Examen");
    await page.getByLabel(/materia/i).fill("Ciencias");
    await page.getByRole("button", { name: /continuar|continue/i }).click();
    await expect(page.getByText(/configuracion|configuration/i)).toBeVisible();
  });

  test("can navigate to project detail", async ({ page }) => {
    await page.goto("/projects");
    await page.getByText("Examen Final Matematicas").click();
    await page.waitForURL(/\/projects\/project-1/);
  });

  test("project detail shows project info", async ({ page }) => {
    await page.goto("/projects/project-1");
    await expect(page.getByText("Examen Final Matematicas")).toBeVisible();
    await expect(page.getByText(/borrador|draft/i)).toBeVisible();
  });
});

test.describe("Project - Answer Key Flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMock(page);

    const confirmedProject = {
      ...mockProject,
      status: "answer_key_uploaded",
    };

    await page.route("**/api/v1/projects/project-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(confirmedProject),
      });
    });
  });

  test("shows answer key upload option", async ({ page }) => {
    await page.goto("/projects/project-1");
    await expect(
      page.getByText(/solucionario|answer key/i)
    ).toBeVisible();
  });
});

test.describe("Project - Grading Flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMock(page);

    const completedProject = {
      ...mockProject,
      status: "completed",
      question_count: 10,
      student_exam_count: 5,
    };

    await page.route("**/api/v1/projects/project-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(completedProject),
      });
    });

    await page.route("**/api/v1/projects/project-1/grading/summary", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          project_id: "project-1",
          total_exams: 5,
          graded_count: 5,
          pending_count: 0,
          error_count: 0,
          average_score: 7.5,
          highest_score: 10.0,
          lowest_score: 4.0,
          average_percentage: 75.0,
        }),
      });
    });

    await page.route("**/api/v1/projects/project-1/exams*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: "exam-1",
              project_id: "project-1",
              student_name: "Juan Perez",
              student_identifier: "2024001",
              original_filename: "exam1.pdf",
              file_path: "student_exams/project-1/exam1.pdf",
              file_type: "pdf",
              status: "graded",
              total_score: 8.0,
              max_score: 10.0,
              grade_percentage: 80.0,
              created_at: "2025-06-01T00:00:00Z",
              graded_at: "2025-06-01T01:00:00Z",
            },
          ],
          total: 1,
          graded_count: 1,
          average_score: 80.0,
        }),
      });
    });
  });

  test("results page shows grading summary", async ({ page }) => {
    await page.goto("/projects/project-1/results");
    await expect(page.getByText(/resultados|results/i)).toBeVisible();
  });

  test("results page shows student exams", async ({ page }) => {
    await page.goto("/projects/project-1/results");
    await expect(page.getByText("Juan Perez")).toBeVisible();
  });
});
