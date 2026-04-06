import { test, expect } from "@playwright/test";

test.describe("Grading Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.setItem("access_token", "mock-token");
    });

    // Mock auth/me
    await page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-1",
          email: "teacher@school.com",
          full_name: "Profesor Garcia",
          is_active: true,
          created_at: "2026-01-01T00:00:00Z",
        }),
      });
    });
  });

  test("full grading flow from project creation to results", async ({
    page,
  }) => {
    // Mock create project
    await page.route("**/api/v1/projects", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            id: "flow-project",
            owner_id: "user-1",
            name: "Examen de Prueba",
            description: "Test exam",
            subject: "Ciencias",
            status: "draft",
            config: null,
            created_at: "2026-04-01T10:00:00Z",
            updated_at: "2026-04-01T10:00:00Z",
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ items: [], total: 0, page: 1, per_page: 20, pages: 0 }),
        });
      }
    });

    // Mock project detail (GET and PUT)
    await page.route("**/api/v1/projects/flow-project", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "flow-project",
          owner_id: "user-1",
          name: "Examen de Prueba",
          description: "Test exam",
          subject: "Ciencias",
          status: "completed",
          config: { exam_type: "multiple_choice", total_questions: 5, points_per_question: 2, has_multiple_pages: false },
          created_at: "2026-04-01T10:00:00Z",
          updated_at: "2026-04-01T10:00:00Z",
          questions_count: 5,
          exams_count: 2,
          graded_count: 2,
        }),
      });
    });

    // Mock results endpoints
    await page.route("**/api/v1/projects/flow-project/exams/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: "exam-1",
              project_id: "flow-project",
              student_name: "Ana Lopez",
              student_identifier: "2026001",
              original_filename: "ana_exam.pdf",
              file_type: "pdf",
              status: "graded",
              total_score: 8,
              max_score: 10,
              grade_percentage: 80,
              grading_details: null,
              error_message: null,
              created_at: "2026-04-01T11:00:00Z",
              graded_at: "2026-04-01T11:05:00Z",
            },
            {
              id: "exam-2",
              project_id: "flow-project",
              student_name: "Carlos Ruiz",
              student_identifier: "2026002",
              original_filename: "carlos_exam.pdf",
              file_type: "pdf",
              status: "graded",
              total_score: 6,
              max_score: 10,
              grade_percentage: 60,
              grading_details: null,
              error_message: null,
              created_at: "2026-04-01T11:00:00Z",
              graded_at: "2026-04-01T11:05:00Z",
            },
          ],
          total: 2,
          graded_count: 2,
          average_score: 70,
        }),
      });
    });

    await page.route("**/api/v1/projects/flow-project/grading/summary", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          project_id: "flow-project",
          project_name: "Examen de Prueba",
          total_exams: 2,
          graded_count: 2,
          pending_count: 0,
          error_count: 0,
          average_score: 7,
          average_percentage: 70,
          highest_score: 8,
          lowest_score: 6,
        }),
      });
    });

    // Step 1: Navigate to create project
    await page.goto("/projects/new");
    await expect(page.getByText(/nuevo proyecto/i)).toBeVisible();

    // Fill out basic info
    await page.getByLabel(/nombre del proyecto/i).fill("Examen de Prueba");
    await page.getByLabel(/materia/i).fill("Ciencias");
    await page.getByRole("button", { name: /continuar/i }).click();

    // Step 2: Should see configuration step
    await expect(
      page.getByText(/configuracion del examen/i)
    ).toBeVisible();

    // Fill configuration and submit
    await page.getByLabel(/numero de preguntas/i).clear();
    await page.getByLabel(/numero de preguntas/i).fill("5");
    await page.getByRole("button", { name: /guardar configuracion/i }).click();

    // Step 3: Should see upload step
    await expect(page.getByText(/subir solucionario/i)).toBeVisible();

    // Skip upload and go to project
    await page.getByRole("button", { name: /omitir por ahora/i }).click();

    // Should be on project detail page
    await page.waitForURL(/\/projects\/flow-project/);

    // Navigate to results
    await page.goto("/projects/flow-project/results");

    // Check results are displayed
    await expect(page.getByText("Ana Lopez")).toBeVisible();
    await expect(page.getByText("Carlos Ruiz")).toBeVisible();
    await expect(page.getByText("70.0%")).toBeVisible(); // Average
  });
});
