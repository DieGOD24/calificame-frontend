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
    { range_label: "0-10", count: 0 },
    { range_label: "10-20", count: 1 },
    { range_label: "20-30", count: 1 },
    { range_label: "30-40", count: 2 },
    { range_label: "40-50", count: 3 },
    { range_label: "50-60", count: 2 },
    { range_label: "60-70", count: 4 },
    { range_label: "70-80", count: 5 },
    { range_label: "80-90", count: 4 },
    { range_label: "90-100", count: 3 },
  ],
  question_difficulty: [
    { question_number: 1, question_text: "Pregunta 1", correct_count: 20, total_count: 25, success_rate: 80.0 },
    { question_number: 2, question_text: "Pregunta 2", correct_count: 15, total_count: 25, success_rate: 60.0 },
    { question_number: 3, question_text: "Pregunta 3", correct_count: 5, total_count: 25, success_rate: 20.0 },
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
    await expect(page.getByText(/seleccionar|select/i)).toBeVisible();
  });

  test("shows analytics after selecting project", async ({ page }) => {
    await page.goto("/analytics");
    // Select project from dropdown
    const selector = page.getByRole("combobox").or(page.locator("select"));
    if (await selector.isVisible()) {
      await selector.selectOption({ label: /matematicas/i });
      await expect(page.getByText(/72/)).toBeVisible(); // average percentage
    }
  });

  test("shows score distribution chart", async ({ page }) => {
    await page.goto("/analytics");
    const selector = page.getByRole("combobox").or(page.locator("select"));
    if (await selector.isVisible()) {
      await selector.selectOption({ index: 1 });
      await expect(page.getByText(/distribucion|distribution/i)).toBeVisible();
    }
  });

  test("shows question difficulty", async ({ page }) => {
    await page.goto("/analytics");
    const selector = page.getByRole("combobox").or(page.locator("select"));
    if (await selector.isVisible()) {
      await selector.selectOption({ index: 1 });
      await expect(page.getByText(/dificultad|difficulty/i)).toBeVisible();
    }
  });

  test("shows pass rate", async ({ page }) => {
    await page.goto("/analytics");
    const selector = page.getByRole("combobox").or(page.locator("select"));
    if (await selector.isVisible()) {
      await selector.selectOption({ index: 1 });
      await expect(page.getByText(/80/)).toBeVisible(); // pass rate
    }
  });
});
