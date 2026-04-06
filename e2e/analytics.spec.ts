import { test, expect } from "@playwright/test";
import { loginAsMock, mockUser, mockProjects } from "./helpers";

const mockAnalytics = {
  project_id: "project-1",
  project_name: "Examen Final Matematicas",
  total_exams: 25,
  graded_count: 25,
  average_score: 7.2,
  median_score: 7.5,
  highest_score: 10.0,
  lowest_score: 3.0,
  average_percentage: 72.0,
  pass_rate: 80.0,
  score_distribution: [
    { range: "0-10", count: 0 },
    { range: "10-20", count: 1 },
    { range: "20-30", count: 1 },
    { range: "30-40", count: 2 },
    { range: "40-50", count: 3 },
    { range: "50-60", count: 2 },
    { range: "60-70", count: 4 },
    { range: "70-80", count: 5 },
    { range: "80-90", count: 4 },
    { range: "90-100", count: 3 },
  ],
  question_stats: [
    { question_number: 1, question_text: "Pregunta 1", success_rate: 80.0 },
    { question_number: 2, question_text: "Pregunta 2", success_rate: 60.0 },
    { question_number: 3, question_text: "Pregunta 3", success_rate: 20.0 },
  ],
};

test.describe("Analytics", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMock(page);

    await page.route("**/api/v1/projects?*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockProjects),
      });
    });

    await page.route("**/api/v1/analytics/projects/project-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockAnalytics),
      });
    });
  });

  test("analytics page shows project selector", async ({ page }) => {
    await page.goto("/analytics");
    // The label text is "Seleccionar Proyecto"
    await expect(page.getByText("Seleccionar Proyecto")).toBeVisible();
  });

  test("shows analytics after selecting project", async ({ page }) => {
    await page.goto("/analytics");
    const selector = page.locator("select");
    await expect(selector).toBeVisible();
    await selector.selectOption({ index: 1 });
    await expect(page.getByText(/72/)).toBeVisible(); // average percentage
  });

  test("shows score distribution chart", async ({ page }) => {
    await page.goto("/analytics");
    const selector = page.locator("select");
    await expect(selector).toBeVisible();
    await selector.selectOption({ index: 1 });
    await expect(page.getByText(/Distribucion de Puntajes/i)).toBeVisible();
  });

  test("shows question difficulty", async ({ page }) => {
    await page.goto("/analytics");
    const selector = page.locator("select");
    await expect(selector).toBeVisible();
    await selector.selectOption({ index: 1 });
    await expect(page.getByText(/Dificultad por Pregunta/i)).toBeVisible();
  });

  test("shows pass rate", async ({ page }) => {
    await page.goto("/analytics");
    const selector = page.locator("select");
    await expect(selector).toBeVisible();
    await selector.selectOption({ index: 1 });
    // Pass rate card shows "Tasa de Aprobacion" label
    await expect(page.getByText("Tasa de Aprobacion")).toBeVisible();
  });
});
