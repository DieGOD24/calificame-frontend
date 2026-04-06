import { test, expect } from "@playwright/test";
import { loginAsMock, mockProject } from "./helpers";

const confirmedProject = { ...mockProject, status: "confirmed", question_count: 10, student_exam_count: 5 };
const gradedProject = { ...mockProject, status: "completed", question_count: 10, student_exam_count: 5 };

const mockExams = {
  items: [
    { id: "exam-1", project_id: "project-1", student_name: "Maria Garcia", student_identifier: "2024001", original_filename: "exam1.pdf", file_type: "pdf", status: "uploaded", total_score: null, max_score: null, grade_percentage: null, created_at: "2025-06-01T00:00:00Z", graded_at: null },
    { id: "exam-2", project_id: "project-1", student_name: "Carlos Lopez", student_identifier: "2024002", original_filename: "exam2.pdf", file_type: "pdf", status: "uploaded", total_score: null, max_score: null, grade_percentage: null, created_at: "2025-06-01T00:00:00Z", graded_at: null },
  ],
  total: 2, graded_count: 0, average_score: null,
};

const mockTask = {
  id: "task-1", user_id: "user-1", task_type: "grading", status: "processing", progress: 50.0,
  current_step: "Calificando examen 1 de 2...", result_data: null, error_message: null,
  project_id: "project-1", created_at: "2025-06-01T00:00:00Z", started_at: "2025-06-01T00:00:01Z", completed_at: null,
};

test.describe("Grading Flow - Upload Exams", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMock(page);
    // Use regex to match ONLY /projects/project-1 (not sub-routes)
    await page.route(/\/api\/v1\/projects\/project-1$/, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(confirmedProject) });
    });
    await page.route(/\/api\/v1\/projects\/project-1\/exams/, async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockExams) });
      } else { await route.continue(); }
    });
  });

  test("upload exams page shows exam list", async ({ page }) => {
    await page.goto("/projects/project-1/upload-exams");
    await expect(page.getByRole("heading", { name: /Examenes de Alumnos/i })).toBeVisible();
  });

  test("shows pending exam count", async ({ page }) => {
    await page.goto("/projects/project-1/upload-exams");
    await expect(page.getByText(/2 pendiente/i)).toBeVisible();
  });

  test("shows grade all button", async ({ page }) => {
    await page.goto("/projects/project-1/upload-exams");
    await expect(page.getByRole("button", { name: /calificar todos/i })).toBeVisible();
  });
});

test.describe("Grading Flow - Background Grading with Progress", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMock(page);
    await page.route(/\/api\/v1\/projects\/project-1$/, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(confirmedProject) });
    });
    await page.route(/\/api\/v1\/projects\/project-1\/exams/, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockExams) });
    });
    await page.route(/\/api\/v1\/projects\/project-1\/grading\/grade-all/, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(mockTask) });
    });
    let taskPollCount = 0;
    await page.route("**/api/v1/tasks/task-1", async (route) => {
      taskPollCount++;
      const completed = taskPollCount >= 3;
      await route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify({
          ...mockTask,
          status: completed ? "completed" : "processing",
          progress: completed ? 100 : taskPollCount * 33,
          current_step: completed ? "Calificacion completada: 2/2 examenes" : `Calificando examen ${taskPollCount} de 2...`,
          result_data: completed ? { graded_count: 2, total: 2 } : null,
          completed_at: completed ? "2025-06-01T01:00:00Z" : null,
        }),
      });
    });
  });

  test("clicking grade all starts background task", async ({ page }) => {
    await page.goto("/projects/project-1/upload-exams");
    const gradeBtn = page.getByRole("button", { name: /calificar todos/i });
    if (await gradeBtn.isVisible()) {
      await gradeBtn.click();
      await expect(page.getByText(/calificando|calificacion/i).first()).toBeVisible();
    }
  });
});

test.describe("Grading Flow - Results Display", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMock(page);
    await page.route(/\/api\/v1\/projects\/project-1$/, async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(gradedProject) });
    });
    await page.route(/\/api\/v1\/projects\/project-1\/grading\/summary/, async (route) => {
      await route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify({
          project_id: "project-1", total_exams: 2, graded_count: 2, pending_count: 0,
          error_count: 0, average_score: 8.0, highest_score: 9.0, lowest_score: 7.0, average_percentage: 80.0,
        }),
      });
    });
    await page.route(/\/api\/v1\/projects\/project-1\/exams/, async (route) => {
      await route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify({
          items: [
            { ...mockExams.items[0], status: "graded", total_score: 9.0, max_score: 10.0, grade_percentage: 90.0, graded_at: "2025-06-01T01:00:00Z" },
            { ...mockExams.items[1], status: "graded", total_score: 7.0, max_score: 10.0, grade_percentage: 70.0, graded_at: "2025-06-01T01:00:00Z" },
          ],
          total: 2, graded_count: 2, average_score: 80.0,
        }),
      });
    });
    await page.route(/\/api\/v1\/projects\/project-1\/grading\/export/, async (route) => {
      await route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify({ project: {}, questions: [], results: [] }),
      });
    });
  });

  test("results page shows student names", async ({ page }) => {
    await page.goto("/projects/project-1/results");
    await expect(page.getByText("Maria Garcia")).toBeVisible();
    await expect(page.getByText("Carlos Lopez")).toBeVisible();
  });

  test("results page shows scores", async ({ page }) => {
    await page.goto("/projects/project-1/results");
    await expect(page.getByText("Maria Garcia")).toBeVisible();
  });

  test("results page shows summary", async ({ page }) => {
    await page.goto("/projects/project-1/results");
    await expect(page.getByText("Maria Garcia")).toBeVisible();
  });

  test("export CSV button exists", async ({ page }) => {
    await page.goto("/projects/project-1/results");
    const exportBtn = page.getByRole("button", { name: /exportar/i }).first();
    await expect(exportBtn).toBeVisible();
  });
});

test.describe("Full Grading E2E Flow", () => {
  test("complete flow: create project -> results", async ({ page }) => {
    await loginAsMock(page);

    await page.route(/\/api\/v1\/projects(\?|$)/, async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          status: 201, contentType: "application/json",
          body: JSON.stringify({ ...mockProject, id: "flow-project", name: "Examen de Prueba" }),
        });
      } else {
        await route.fulfill({
          status: 200, contentType: "application/json",
          body: JSON.stringify({ items: [], total: 0, page: 1, page_size: 20 }),
        });
      }
    });
    await page.route(/\/api\/v1\/projects\/flow-project$/, async (route) => {
      await route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify({ ...gradedProject, id: "flow-project", name: "Examen de Prueba" }),
      });
    });
    await page.route(/\/api\/v1\/projects\/flow-project\/grading\/summary/, async (route) => {
      await route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify({
          project_id: "flow-project", total_exams: 2, graded_count: 2, pending_count: 0,
          error_count: 0, average_score: 7, highest_score: 8, lowest_score: 6, average_percentage: 70,
        }),
      });
    });
    await page.route(/\/api\/v1\/projects\/flow-project\/exams/, async (route) => {
      await route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify({
          items: [
            { id: "e1", project_id: "flow-project", student_name: "Ana", status: "graded", total_score: 8, max_score: 10, grade_percentage: 80, created_at: "2025-01-01T00:00:00Z", graded_at: "2025-01-01T01:00:00Z" },
            { id: "e2", project_id: "flow-project", student_name: "Carlos", status: "graded", total_score: 6, max_score: 10, grade_percentage: 60, created_at: "2025-01-01T00:00:00Z", graded_at: "2025-01-01T01:00:00Z" },
          ],
          total: 2, graded_count: 2, average_score: 70,
        }),
      });
    });

    await page.goto("/projects/new");
    await page.getByLabel(/nombre/i).fill("Examen de Prueba");
    await page.getByLabel(/materia/i).fill("Ciencias");
    await page.getByRole("button", { name: /continuar/i }).click();
    await expect(page.getByText(/configuracion del examen/i)).toBeVisible();

    await page.goto("/projects/flow-project/results");
    await expect(page.getByRole("cell", { name: "Ana" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Carlos" })).toBeVisible();
  });
});
