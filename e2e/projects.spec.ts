import { test, expect } from "@playwright/test";

test.describe("Projects", () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication by setting token in localStorage
    await page.goto("/login");
    await page.evaluate(() => {
      localStorage.setItem("access_token", "mock-token");
    });

    // Mock the API responses
    await page.route("**/api/v1/auth/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "user-1",
          email: "test@test.com",
          full_name: "Test User",
          is_active: true,
          created_at: "2026-01-01T00:00:00Z",
        }),
      });
    });

    await page.route("**/api/v1/projects*", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            items: [
              {
                id: "project-1",
                owner_id: "user-1",
                name: "Examen Matematicas",
                description: "Examen del primer semestre",
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
                exams_count: 5,
                graded_count: 3,
              },
            ],
            total: 1,
            page: 1,
            per_page: 20,
            pages: 1,
          }),
        });
      } else if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            id: "project-2",
            owner_id: "user-1",
            name: "Nuevo Examen",
            description: "",
            subject: "Ciencias",
            status: "draft",
            config: null,
            created_at: "2026-04-01T10:00:00Z",
            updated_at: "2026-04-01T10:00:00Z",
          }),
        });
      }
    });
  });

  test("authenticated user sees projects list", async ({ page }) => {
    await page.goto("/projects");
    await expect(page.getByText("Examen Matematicas")).toBeVisible();
    await expect(page.getByText("Matematicas", { exact: true })).toBeVisible();
  });

  test("user can create a new project", async ({ page }) => {
    // Mock the config endpoint
    await page.route("**/api/v1/projects/project-2/config", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "project-2",
          owner_id: "user-1",
          name: "Nuevo Examen",
          description: "",
          subject: "Ciencias",
          status: "configuring",
          config: {
            exam_type: "multiple_choice",
            total_questions: 10,
            points_per_question: 1,
            has_multiple_pages: false,
          },
          created_at: "2026-04-01T10:00:00Z",
          updated_at: "2026-04-01T10:00:00Z",
        }),
      });
    });

    await page.goto("/projects/new");

    // Step 1: Fill basic info
    await page.getByLabel(/nombre del proyecto/i).fill("Nuevo Examen");
    await page.getByLabel(/materia/i).fill("Ciencias");

    await page.getByRole("button", { name: /continuar/i }).click();

    // Should advance to step 2
    await expect(
      page.getByText(/configuracion del examen/i)
    ).toBeVisible();
  });
});
