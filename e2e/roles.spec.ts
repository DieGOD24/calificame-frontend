import { test, expect } from "@playwright/test";
import {
  loginAsMock,
  mockUser,
  mockAdminUser,
  mockDeveloperUser,
  mockStudentUser,
} from "./helpers";

test.describe("Role-Based Access - Professor", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMock(page, mockUser);
    await page.route("**/api/v1/projects*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [], total: 0, page: 1, page_size: 20 }),
      });
    });
  });

  test("professor sees projects in sidebar", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/proyectos|projects/i)).toBeVisible();
  });

  test("professor sees analytics in sidebar", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/analiticas|analytics/i)).toBeVisible();
  });

  test("professor sees PDF generator in sidebar", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/generador|pdf/i)).toBeVisible();
  });

  test("professor does not see admin panel", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/administracion|admin panel/i)).not.toBeVisible();
  });
});

test.describe("Role-Based Access - Student", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMock(page, mockStudentUser);
  });

  test("student sees their grades dashboard", async ({ page }) => {
    await page.goto("/student");
    await expect(page.getByText(/calificaciones|grades/i)).toBeVisible();
  });

  test("student cannot access projects page", async ({ page }) => {
    await page.goto("/projects");
    // Should redirect or show forbidden
    await page.waitForTimeout(1000);
    const url = page.url();
    expect(url).not.toContain("/projects");
  });
});

test.describe("Role-Based Access - Admin", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMock(page, mockAdminUser);
    await page.route("**/api/v1/auth/users", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          mockUser,
          mockAdminUser,
          mockStudentUser,
        ]),
      });
    });
  });

  test("admin sees admin panel in sidebar", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/administracion|admin/i)).toBeVisible();
  });

  test("admin can access admin page", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText(/panel de administracion|admin panel/i)).toBeVisible();
  });

  test("admin sees user list", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText(mockUser.email)).toBeVisible();
    await expect(page.getByText(mockStudentUser.email)).toBeVisible();
  });
});

test.describe("Role-Based Access - Developer", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMock(page, mockDeveloperUser);
    await page.route("**/api/v1/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });
  });

  test("developer sees all navigation items", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/proyectos|projects/i)).toBeVisible();
    await expect(page.getByText(/analiticas|analytics/i)).toBeVisible();
    await expect(page.getByText(/administracion|admin/i)).toBeVisible();
  });
});
