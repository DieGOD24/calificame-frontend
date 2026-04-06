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
    await page.route("**/api/v1/projects**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [], total: 0, page: 1, page_size: 20 }),
      });
    });
  });

  test("professor sees projects in sidebar", async ({ page }) => {
    await page.goto("/dashboard");
    const sidebar = page.getByLabel("Menu lateral");
    await expect(sidebar.getByText(/proyectos/i)).toBeVisible();
  });

  test("professor sees analytics in sidebar", async ({ page }) => {
    await page.goto("/dashboard");
    const sidebar = page.getByLabel("Menu lateral");
    await expect(sidebar.getByText(/analiticas/i)).toBeVisible();
  });

  test("professor sees PDF generator in sidebar", async ({ page }) => {
    await page.goto("/dashboard");
    const sidebar = page.getByLabel("Menu lateral");
    await expect(sidebar.getByText(/generador pdf/i)).toBeVisible();
  });

  test("professor does not see admin panel", async ({ page }) => {
    await page.goto("/dashboard");
    const sidebar = page.getByLabel("Menu lateral");
    await expect(sidebar.getByText(/admin/i)).not.toBeVisible();
  });
});

test.describe("Role-Based Access - Student", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMock(page, mockStudentUser);
  });

  test("student sees their grades dashboard", async ({ page }) => {
    await page.goto("/student");
    await expect(page.getByText(/calificaciones|grades|mi dashboard/i)).toBeVisible();
  });

  test("student cannot access projects page", async ({ page }) => {
    await page.goto("/projects");
    await page.waitForTimeout(2000);
    // Student should be redirected away from projects or see no content
    const sidebar = page.getByLabel("Menu lateral");
    // Projects link should not be in sidebar for students
    await expect(sidebar.getByRole("link", { name: /^proyectos$/i })).not.toBeVisible();
  });
});

test.describe("Role-Based Access - Admin", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMock(page, mockAdminUser);
    await page.route("**/api/v1/auth/users", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([mockUser, mockAdminUser, mockStudentUser]),
      });
    });
    await page.route("**/api/v1/projects**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [], total: 0, page: 1, page_size: 20 }),
      });
    });
    await page.route("**/api/v1/institutions**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    });
  });

  test("admin sees admin panel in sidebar", async ({ page }) => {
    await page.goto("/dashboard");
    const sidebar = page.getByLabel("Menu lateral");
    // Use role link selector to avoid matching "Admin User" (name) and "Administrador" (role badge)
    await expect(sidebar.getByRole("link", { name: /Administracion/i })).toBeVisible();
  });

  test("admin can access admin page", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText(/panel de administracion|admin/i).first()).toBeVisible();
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
    // Mock specific endpoints, NOT a catch-all that breaks auth/me
    await page.route("**/api/v1/projects**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ items: [], total: 0, page: 1, page_size: 20 }),
      });
    });
  });

  test("developer sees all navigation items", async ({ page }) => {
    await page.goto("/dashboard");
    const sidebar = page.getByLabel("Menu lateral");
    await expect(sidebar.getByText(/proyectos/i)).toBeVisible();
    await expect(sidebar.getByText(/analiticas/i)).toBeVisible();
    await expect(sidebar.getByText(/admin/i)).toBeVisible();
  });
});
